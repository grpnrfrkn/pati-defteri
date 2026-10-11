import { addDays } from './dates'
import { occursOn } from './recurrence'
import type { ISODate, Item, Occurrence, Section, Task } from './types'

export const SINGLE = 'single'
export const occId = (taskId: string, originalDate: string) => `${taskId}|${originalDate}`

export interface Snapshot {
  tasks: Task[]
  occs: Occurrence[]
}

export function buildItem(task: Task, originalDate: ISODate | typeof SINGLE, occ?: Occurrence): Item {
  const recurring = originalDate !== SINGLE
  return {
    key: occId(task.id, originalDate),
    task,
    originalDate,
    date: recurring ? (occ?.moved ? occ.plannedDate : originalDate) : task.plannedDate,
    recurring,
    status: occ?.status ?? 'pending',
    completedOn: occ?.completedOn ?? null,
    doneSubtasks: occ?.doneSubtasks ?? {},
  }
}

const live = (t: Task) => !t.deletedAt
const byOrder = (a: Item, b: Item) => a.task.sortOrder - b.task.sortOrder

function indexes(snap: Snapshot) {
  return {
    occById: new Map(snap.occs.map((o) => [o.id, o])),
    taskById: new Map(snap.tasks.filter(live).map((t) => [t.id, t])),
  }
}

/** Bir güne planlı işler ve o gün tamamlananlar. Atlananlar görünmez. */
export function itemsForDate(snap: Snapshot, date: ISODate): Item[] {
  const { occById, taskById } = indexes(snap)
  const out = new Map<string, Item>()
  const add = (item: Item) => out.set(item.key, item)

  for (const t of taskById.values()) {
    if (!t.recurrence) {
      if (t.plannedDate === date) add(buildItem(t, SINGLE, occById.get(occId(t.id, SINGLE))))
    } else if (occursOn(t, date)) {
      const occ = occById.get(occId(t.id, date))
      if (!occ?.moved) add(buildItem(t, date, occ))
    }
  }
  for (const o of snap.occs) {
    const t = taskById.get(o.taskId)
    if (!t) continue
    const movedHere = o.moved && o.plannedDate === date
    const doneHere = o.status === 'done' && o.completedOn === date
    if (movedHere || doneHere) add(buildItem(t, o.originalDate, o))
  }
  return [...out.values()].filter((i) => i.status !== 'skipped').sort(byOrder)
}

/**
 * Geçmişten kalan, hakkında karar verilmemiş işler. Bugüne taşınmazlar.
 * Tekrarlı görevlerde yalnızca en son kaçan tekrar gösterilir ve sıradaki
 * tekrarın günü geldiğinde listeden düşer; böylece rutinler burada birikmez.
 */
export function overdueItems(snap: Snapshot, today: ISODate, lookbackDays = 62): Item[] {
  const { occById, taskById } = indexes(snap)
  const out: Item[] = []
  const addIfPending = (item: Item) => item.status === 'pending' && out.push(item)

  for (const t of taskById.values()) {
    if (!t.recurrence) {
      if (t.plannedDate && t.plannedDate < today) {
        addIfPending(buildItem(t, SINGLE, occById.get(occId(t.id, SINGLE))))
      }
      continue
    }
    if (!t.plannedDate || occursOn(t, today)) continue
    for (let i = 1; i <= lookbackDays; i++) {
      const d = addDays(today, -i)
      if (d < t.plannedDate) break
      if (!occursOn(t, d)) continue
      const occ = occById.get(occId(t.id, d))
      if (!occ?.moved) addIfPending(buildItem(t, d, occ))
      break
    }
  }
  for (const o of snap.occs) {
    const t = taskById.get(o.taskId)
    if (t && o.moved && o.plannedDate && o.plannedDate < today) addIfPending(buildItem(t, o.originalDate, o))
  }
  return out.sort((a, b) => (a.date ?? '').localeCompare(b.date ?? '') || byOrder(a, b))
}

/** Tarihsiz bekleyen işler; kullanıcı planlayana kadar Bugün'e girmezler. */
export function undatedItems(snap: Snapshot): Item[] {
  const { occById, taskById } = indexes(snap)
  const out: Item[] = []
  for (const t of taskById.values()) {
    if (!t.recurrence && !t.plannedDate) out.push(buildItem(t, SINGLE, occById.get(occId(t.id, SINGLE))))
  }
  for (const o of snap.occs) {
    const t = taskById.get(o.taskId)
    if (t && o.moved && !o.plannedDate) out.push(buildItem(t, o.originalDate, o))
  }
  return out.filter((i) => i.status === 'pending').sort(byOrder)
}

/** Her iş tam olarak bir bölümde görünür: yüksek öncelik, tekrarlı olmaktan önce gelir. */
export function sectionOf(item: Item): Section {
  if (item.task.priority === 'high') return 'priority'
  return item.recurring ? 'routine' : 'other'
}
