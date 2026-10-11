import { nextOnOrAfter } from './recurrence'
import type { Difficulty, ISODate, Priority, Task } from './types'

/** Süre ve zorluk ölçütleri; hem enerji filtresinde hem görev aramasında kullanılır. */
export interface EffortFilter {
  maxMinutes: number | null
  difficulty: Difficulty | null
  /** Süresi veya zorluğu belirtilmemiş görevler de gösterilsin mi? */
  includeUnspecified: boolean
}

export const NO_EFFORT: EffortFilter = { maxMinutes: null, difficulty: null, includeUnspecified: false }

export const effortActive = (f: EffortFilter) => f.maxMinutes != null || f.difficulty != null

/**
 * 'unspecified': görev ölçütlere aykırı değil ama sorulan bilgi (süre ya da zorluk)
 * girilmemiş. Bu görevler sessizce elenmez; kullanıcıya sayısı gösterilir.
 */
export type EffortMatch = 'match' | 'miss' | 'unspecified'

export function matchEffort(task: Pick<Task, 'estimateMin' | 'difficulty'>, f: EffortFilter): EffortMatch {
  let unspecified = false
  if (f.maxMinutes != null) {
    if (task.estimateMin == null) unspecified = true
    else if (task.estimateMin > f.maxMinutes) return 'miss'
  }
  if (f.difficulty) {
    if (task.difficulty == null) unspecified = true
    else if (task.difficulty !== f.difficulty) return 'miss'
  }
  return unspecified ? 'unspecified' : 'match'
}

/** Listeyi ölçütlere göre ayırır: gösterilecekler ve bilgisi eksik olduğu için gizlenenler. */
export function applyEffort<T>(rows: T[], taskOf: (row: T) => Task, f: EffortFilter): { shown: T[]; unspecified: number } {
  if (!effortActive(f)) return { shown: rows, unspecified: 0 }
  let unspecified = 0
  const shown = rows.filter((row) => {
    const match = matchEffort(taskOf(row), f)
    if (match === 'unspecified' && !f.includeUnspecified) unspecified++
    return match === 'match' || (match === 'unspecified' && f.includeUnspecified)
  })
  return { shown, unspecified }
}

export interface TaskFilter {
  text: string
  /** 'none' = kategorisiz */
  categoryId: string | null
  priority: Priority | null
  kind: 'recurring' | 'single' | null
  from: ISODate | null
  to: ISODate | null
}

export const NO_FILTER: TaskFilter = { text: '', categoryId: null, priority: null, kind: null, from: null, to: null }

const fold = (s: string) => s.toLocaleLowerCase('tr')

export function matchesTask(task: Task, f: TaskFilter): boolean {
  if (f.text.trim() && !fold(task.title).includes(fold(f.text.trim()))) return false
  if (f.categoryId === 'none' ? task.categoryId !== null : f.categoryId && task.categoryId !== f.categoryId) return false
  if (f.priority && task.priority !== f.priority) return false
  if (f.kind && (f.kind === 'recurring') !== !!task.recurrence) return false
  if (f.from || f.to) {
    if (!task.plannedDate) return false
    if (task.recurrence) {
      // Aralıkta en az bir tekrarı var mı?
      const first = nextOnOrAfter(task, f.from ?? task.plannedDate)
      if (!first || (f.to && first > f.to)) return false
    } else if ((f.from && task.plannedDate < f.from) || (f.to && task.plannedDate > f.to)) {
      return false
    }
  }
  return true
}
