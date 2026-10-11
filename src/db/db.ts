import Dexie, { type Table } from 'dexie'
import type { Category, LedgerEntry, Occurrence, Subtask, Task, TaskEvent } from '../domain/types'

export interface Meta {
  key: string
  value: unknown
}

class AppDB extends Dexie {
  tasks!: Table<Task, string>
  subtasks!: Table<Subtask, string>
  occurrences!: Table<Occurrence, string>
  events!: Table<TaskEvent, string>
  categories!: Table<Category, string>
  meta!: Table<Meta, string>
  ledger!: Table<LedgerEntry, string>

  constructor() {
    super('pati-defteri')
    this.version(1).stores({
      tasks: 'id',
      subtasks: 'id, taskId',
      occurrences: 'id, taskId',
      events: 'id, taskId, at',
      categories: 'id',
      meta: 'key',
    })
    this.version(2).stores({ ledger: 'id, occId, day' })
  }
}

export const db = new AppDB()
