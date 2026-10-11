/** Yerel takvim günü, YYYY-AA-GG. */
export type ISODate = string

export type Priority = 'low' | 'normal' | 'high'
export type Difficulty = 'easy' | 'medium' | 'hard'

export type Recurrence =
  | { type: 'daily' }
  /** days: 1 = Pazartesi … 7 = Pazar */
  | { type: 'weekly'; days: number[] }
  /** Ay o kadar uzun değilse ayın son günü. */
  | { type: 'monthly'; day: number }
  | { type: 'interval'; every: number; unit: 'day' | 'week' }

export interface Task {
  id: string
  title: string
  note: string
  categoryId: string | null
  /** Tek seferlik görevde planlanan gün (null = tarihsiz); tekrarlı görevde serinin başlangıcı. */
  plannedDate: ISODate | null
  /** Kesin son teslim tarihi; planlanan tarihten bağımsızdır. */
  dueDate: ISODate | null
  recurrence: Recurrence | null
  longTerm: boolean
  priority: Priority
  estimateMin: number | null
  /** null = belirtilmemiş (kolay sayılmaz). */
  difficulty: Difficulty | null
  sortOrder: number
  suggestionDismissed: boolean
  createdAt: number
  updatedAt: number
  deletedAt: number | null
}

export interface Subtask {
  id: string
  taskId: string
  title: string
  order: number
  updatedAt: number
  deletedAt: number | null
}

export type OccStatus = 'pending' | 'done' | 'skipped'

/**
 * Bir görevin tek bir gerçekleşmesi. Kimlik `görev|asıl gün` olduğu için
 * aynı gerçekleşme iki kez yazılamaz. Tek seferlik görevlerde asıl gün 'single'.
 */
export interface Occurrence {
  id: string
  taskId: string
  originalDate: ISODate | 'single'
  /** Tekrarlı bir gerçekleşme asıl gününden taşındıysa true; plannedDate null ise tarihsiz. */
  moved: boolean
  plannedDate: ISODate | null
  status: OccStatus
  completedAt: number | null
  completedOn: ISODate | null
  doneSubtasks: Record<string, number>
  updatedAt: number
}

export type EventType =
  | 'created'
  | 'edited'
  | 'completed'
  | 'uncompleted'
  | 'moved'
  | 'unscheduled'
  | 'skipped'
  | 'subtask_done'
  | 'subtask_undone'
  | 'deleted'
  | 'undone'

export interface TaskEvent {
  id: string
  taskId: string
  occId: string | null
  type: EventType
  at: number
  from?: ISODate | null
  to?: ISODate | null
  detail?: string
}

export interface Category {
  id: string
  name: string
  order: number
  updatedAt: number
  deletedAt: number | null
}

/** Listelerde gösterilen şey: görev + hangi gerçekleşmesi olduğu. */
export interface Item {
  key: string
  task: Task
  originalDate: ISODate | 'single'
  /** Şu an planlandığı gün; null = tarihsiz. */
  date: ISODate | null
  recurring: boolean
  status: OccStatus
  completedOn: ISODate | null
  doneSubtasks: Record<string, number>
}

export type Section = 'priority' | 'routine' | 'other'
