import Dexie, { type Table } from 'dexie'
import type { Category, Occurrence, Subtask, Task, TaskEvent } from '../domain/types'

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
  }
}

export const db = new AppDB()
