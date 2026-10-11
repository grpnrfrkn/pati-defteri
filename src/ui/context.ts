import { createContext, useContext } from 'react'
import type { TaskInput, Undo } from '../db/actions'
import type { Cat, Category, Flower, ISODate, LedgerEntry, Occurrence, Subtask, Task } from '../domain/types'

export interface AppData {
  /** Silinenler dahil; geçmişte görev adını gösterebilmek için. */
  tasksAll: Task[]
  tasks: Task[]
  subtasks: Subtask[]
  occs: Occurrence[]
  categories: Category[]
  onboarded: boolean
  /** Gün sonu saati, "SS:DD". */
  dayEndTime: string
  /** Günü Toparla'sı kapatılmış günler. */
  reviewedDays: Set<ISODate>
  ledger: LedgerEntry[]
  /** Toplam XP ve pati bakiyesi; ledger kayıtlarının toplamı. */
  xp: number
  pati: number
  cat: Cat | null
  flowers: Flower[]
}

export interface CelebrationInfo {
  emoji: string
  title: string
  text?: string | null
  /** Kutlamanın altında çıkan sevgi notu. */
  note?: string | null
}

export type SheetState =
  | null
  | { type: 'quick' }
  | { type: 'form'; taskId?: string; defaults?: Partial<TaskInput> }
  | { type: 'detail'; taskId: string; originalDate: string }
  | { type: 'review'; date: ISODate }

export interface AppCtx {
  data: AppData
  today: ISODate
  open: (sheet: SheetState) => void
  /**
   * Bir veri işlemini çalıştırır. Başarılıysa mesajı (varsa geri al seçeneğiyle) gösterir;
   * kaydedilemezse bunu açıkça söyler ve false döner.
   */
  act: (fn: () => Promise<unknown>, message?: string, note?: string | null) => Promise<boolean>
  notify: (message: string, undo?: Undo, note?: string | null) => void
  /** Kısa, akışı kesmeyen kutlama. */
  celebrate: (info: CelebrationInfo) => void
}

export const AppContext = createContext<AppCtx | null>(null)

export function useApp(): AppCtx {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('AppContext yok')
  return ctx
}

export const subtasksOf = (data: AppData, taskId: string): Subtask[] =>
  data.subtasks.filter((s) => s.taskId === taskId).sort((a, b) => a.order - b.order)

export const categoryName = (data: AppData, id: string | null): string | null =>
  data.categories.find((c) => c.id === id)?.name ?? null
