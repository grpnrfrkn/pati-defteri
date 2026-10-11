import { SINGLE } from '../domain/derive'
import type { Category, Difficulty, ISODate, Item, Occurrence, Priority, Recurrence, Subtask, Task, TaskEvent } from '../domain/types'
import { db } from './db'

/** Bir işlemi geri alır ve geri alındığını geçmişe yazar. */
export type Undo = () => Promise<void>

const now = () => Date.now()
const uid = () => crypto.randomUUID()

let seq = 0
const nextOrder = () => Date.now() * 100 + (seq++ % 100)

function logEvent(e: Omit<TaskEvent, 'id' | 'at'>) {
  return db.events.add({ ...e, id: uid(), at: now() })
}

export interface TaskInput {
  title: string
  note?: string
  categoryId?: string | null
  plannedDate?: ISODate | null
  dueDate?: ISODate | null
  recurrence?: Recurrence | null
  longTerm?: boolean
  priority?: Priority
  estimateMin?: number | null
  difficulty?: Difficulty | null
}

export interface SubtaskInput {
  id?: string
  title: string
}

export async function createTask(input: TaskInput, subtasks: SubtaskInput[] = []): Promise<Task> {
  const t = now()
  const task: Task = {
    id: uid(),
    title: input.title.trim(),
    note: input.note?.trim() ?? '',
    categoryId: input.categoryId ?? null,
    plannedDate: input.plannedDate ?? null,
    dueDate: input.dueDate ?? null,
    recurrence: input.recurrence ?? null,
    longTerm: input.longTerm ?? false,
    priority: input.priority ?? 'normal',
    estimateMin: input.estimateMin ?? null,
    difficulty: input.difficulty ?? null,
    sortOrder: nextOrder(),
    suggestionDismissed: false,
    createdAt: t,
    updatedAt: t,
    deletedAt: null,
  }
  await db.transaction('rw', db.tasks, db.subtasks, db.events, async () => {
    await db.tasks.add(task)
    await saveSubtasks(task.id, subtasks)
    await logEvent({ taskId: task.id, occId: null, type: 'created', to: task.plannedDate })
  })
  return task
}

async function saveSubtasks(taskId: string, inputs: SubtaskInput[]) {
  const t = now()
  const existing = await db.subtasks.where('taskId').equals(taskId).toArray()
  const kept = new Set(inputs.map((s) => s.id).filter(Boolean))
  const rows: Subtask[] = existing
    .filter((s) => !s.deletedAt && !kept.has(s.id))
    .map((s) => ({ ...s, deletedAt: t, updatedAt: t }))
  inputs.forEach((s, order) => {
    const title = s.title.trim()
    if (title) rows.push({ id: s.id ?? uid(), taskId, title, order, updatedAt: t, deletedAt: null })
  })
  await db.subtasks.bulkPut(rows)
}

export async function updateTask(id: string, input: TaskInput, subtasks: SubtaskInput[]): Promise<void> {
  await db.transaction('rw', db.tasks, db.subtasks, db.events, async () => {
    const prev = await db.tasks.get(id)
    if (!prev) throw new Error('Görev bulunamadı')
    const next: Task = {
      ...prev,
      title: input.title.trim(),
      note: input.note?.trim() ?? '',
      categoryId: input.categoryId ?? null,
      plannedDate: input.plannedDate ?? null,
      dueDate: input.dueDate ?? null,
      recurrence: input.recurrence ?? null,
      longTerm: input.longTerm ?? false,
      priority: input.priority ?? 'normal',
      estimateMin: input.estimateMin ?? null,
      difficulty: input.difficulty ?? null,
      // Son teslim tarihi değiştiyse öneri yeniden gösterilebilir.
      suggestionDismissed: prev.suggestionDismissed && prev.dueDate === (input.dueDate ?? null),
      updatedAt: now(),
    }
    await db.tasks.put(next)
    await saveSubtasks(id, subtasks)
    await logEvent({ taskId: id, occId: null, type: 'edited' })
    if (!next.recurrence && !prev.recurrence && prev.plannedDate !== next.plannedDate) {
      await logEvent({
        taskId: id,
        occId: null,
        type: next.plannedDate ? 'moved' : 'unscheduled',
        from: prev.plannedDate,
        to: next.plannedDate,
      })
    }
  })
}

export async function deleteTask(id: string): Promise<Undo> {
  const prev = await db.tasks.get(id)
  if (!prev) throw new Error('Görev bulunamadı')
  await db.transaction('rw', db.tasks, db.events, async () => {
    await db.tasks.put({ ...prev, deletedAt: now(), updatedAt: now() })
    await logEvent({ taskId: id, occId: null, type: 'deleted' })
  })
  return () =>
    db.transaction('rw', db.tasks, db.events, async () => {
      await db.tasks.put(prev)
      await logEvent({ taskId: id, occId: null, type: 'undone', detail: 'silme' })
    })
}

function blankOcc(item: Item): Occurrence {
  return {
    id: item.key,
    taskId: item.task.id,
    originalDate: item.originalDate,
    moved: false,
    plannedDate: null,
    status: 'pending',
    completedAt: null,
    completedOn: null,
    doneSubtasks: {},
    updatedAt: 0,
  }
}

/**
 * Bir gerçekleşme üzerindeki her değişiklik buradan geçer: görev ve gerçekleşme
 * tek işlemde yazılır, önceki hâlleri geri alma için saklanır.
 */
async function mutate(
  item: Item,
  label: string,
  change: (rows: { task: Task; occ: Occurrence }) => Omit<TaskEvent, 'id' | 'at' | 'taskId' | 'occId'>,
): Promise<Undo> {
  const tables = [db.tasks, db.occurrences, db.events]
  let prevTask: Task | undefined
  let prevOcc: Occurrence | undefined
  await db.transaction('rw', tables, async () => {
    prevTask = await db.tasks.get(item.task.id)
    if (!prevTask) throw new Error('Görev bulunamadı')
    prevOcc = await db.occurrences.get(item.key)
    const task = { ...prevTask }
    const occ = prevOcc ? { ...prevOcc } : blankOcc(item)
    const event = change({ task, occ })
    task.updatedAt = occ.updatedAt = now()
    await db.tasks.put(task)
    await db.occurrences.put(occ)
    await logEvent({ ...event, taskId: task.id, occId: item.key })
  })
  return () =>
    db.transaction('rw', tables, async () => {
      await db.tasks.put(prevTask!)
      if (prevOcc) await db.occurrences.put(prevOcc)
      else await db.occurrences.delete(item.key)
      await logEvent({ taskId: item.task.id, occId: item.key, type: 'undone', detail: label })
    })
}

export function completeItem(item: Item, on: ISODate): Promise<Undo> {
  return mutate(item, 'tamamlama', ({ occ }) => {
    occ.status = 'done'
    occ.completedAt = now()
    occ.completedOn = on
    return { type: 'completed', to: on }
  })
}

export function uncompleteItem(item: Item): Promise<Undo> {
  return mutate(item, 'tamamlamayı geri alma', ({ occ }) => {
    occ.status = 'pending'
    occ.completedAt = null
    occ.completedOn = null
    return { type: 'uncompleted' }
  })
}

/** Planlanan günü değiştirir; son teslim tarihine ve serinin diğer tekrarlarına dokunmaz. */
export function moveItem(item: Item, to: ISODate): Promise<Undo> {
  return mutate(item, 'taşıma', ({ task, occ }) => {
    if (item.originalDate === SINGLE) {
      task.plannedDate = to
    } else {
      occ.moved = to !== item.originalDate
      occ.plannedDate = occ.moved ? to : null
    }
    if (occ.status === 'skipped') occ.status = 'pending'
    return { type: 'moved', from: item.date, to }
  })
}

export function unscheduleItem(item: Item): Promise<Undo> {
  return mutate(item, 'tarihsiz yapma', ({ task, occ }) => {
    if (item.originalDate === SINGLE) {
      task.plannedDate = null
    } else {
      occ.moved = true
      occ.plannedDate = null
    }
    return { type: 'unscheduled', from: item.date }
  })
}

export function skipItem(item: Item): Promise<Undo> {
  return mutate(item, 'atlama', ({ occ }) => {
    occ.status = 'skipped'
    return { type: 'skipped', from: item.date }
  })
}

export function toggleSubtask(item: Item, subtask: Subtask): Promise<Undo> {
  return mutate(item, 'alt görev', ({ occ }) => {
    const done = { ...occ.doneSubtasks }
    const wasDone = subtask.id in done
    if (wasDone) delete done[subtask.id]
    else done[subtask.id] = now()
    occ.doneSubtasks = done
    return { type: wasDone ? 'subtask_undone' : 'subtask_done', detail: subtask.title }
  })
}

export async function setPriority(taskId: string, priority: Priority): Promise<void> {
  await db.tasks.update(taskId, { priority, updatedAt: now() })
}

export async function dismissSuggestion(taskId: string): Promise<void> {
  await db.tasks.update(taskId, { suggestionDismissed: true, updatedAt: now() })
}

/** Verilen görevleri bu sıraya dizer; listedeki mevcut sıra değerlerini yeniden dağıtır. */
export async function reorderTasks(taskIds: string[]): Promise<void> {
  const ids = [...new Set(taskIds)]
  await db.transaction('rw', db.tasks, async () => {
    const rows = (await db.tasks.bulkGet(ids)).filter((t): t is Task => !!t)
    const base = Math.min(...rows.map((t) => t.sortOrder))
    const t = now()
    await db.tasks.bulkPut(
      ids.flatMap((id, i) => {
        const row = rows.find((r) => r.id === id)
        return row ? [{ ...row, sortOrder: base + i, updatedAt: t }] : []
      }),
    )
  })
}

const DEFAULT_CATEGORIES = ['Ev', 'Kişisel bakım', 'İş', 'Kediler', 'Hobiler']

export async function seedDefaults(): Promise<void> {
  await db.transaction('rw', db.categories, db.meta, async () => {
    if (await db.meta.get('seeded')) return
    const t = now()
    await db.categories.bulkAdd(
      DEFAULT_CATEGORIES.map((name, order) => ({ id: uid(), name, order, updatedAt: t, deletedAt: null })),
    )
    await db.meta.put({ key: 'seeded', value: true })
  })
}

export async function addCategory(name: string): Promise<Category> {
  const count = await db.categories.count()
  const category: Category = { id: uid(), name: name.trim(), order: count, updatedAt: now(), deletedAt: null }
  await db.categories.add(category)
  return category
}

export async function renameCategory(id: string, name: string): Promise<void> {
  await db.categories.update(id, { name: name.trim(), updatedAt: now() })
}

/** Kategori silinince görevleri silinmez; kategorisiz kalır ya da `moveTo` kategorisine geçer. */
export async function deleteCategory(id: string, moveTo: string | null): Promise<void> {
  await db.transaction('rw', db.categories, db.tasks, async () => {
    const t = now()
    await db.tasks.filter((task) => task.categoryId === id).modify({ categoryId: moveTo, updatedAt: t })
    await db.categories.update(id, { deletedAt: t, updatedAt: t })
  })
}

export async function setMeta(key: string, value: unknown): Promise<void> {
  await db.meta.put({ key, value })
}

const BACKUP_TABLES = ['tasks', 'subtasks', 'occurrences', 'events', 'categories', 'meta'] as const

export async function exportBackup(): Promise<string> {
  const data: Record<string, unknown[]> = {}
  for (const name of BACKUP_TABLES) data[name] = await db.table(name).toArray()
  return JSON.stringify({ app: 'pati-defteri', version: 1, exportedAt: new Date().toISOString(), data })
}

/** Yedeği yükler; cihazdaki mevcut verinin tamamının yerine geçer. */
export async function importBackup(json: string): Promise<void> {
  const parsed = JSON.parse(json)
  if (parsed?.app !== 'pati-defteri' || typeof parsed.data !== 'object') {
    throw new Error('Bu dosya bir Pati Defteri yedeği değil')
  }
  await db.transaction('rw', BACKUP_TABLES.map((name) => db.table(name)), async () => {
    for (const name of BACKUP_TABLES) {
      await db.table(name).clear()
      await db.table(name).bulkPut(parsed.data[name] ?? [])
    }
  })
}
