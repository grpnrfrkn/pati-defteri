import { formatDay } from '../domain/dates'
import type { Difficulty, Priority, TaskEvent } from '../domain/types'

export const PRIORITY: Record<Priority, string> = { low: 'Düşük', normal: 'Normal', high: 'Yüksek' }
export const DIFFICULTY: Record<Difficulty, string> = { easy: 'Kolay', medium: 'Orta', hard: 'Zor' }

export function formatMinutes(min: number): string {
  return min >= 60 && min % 60 === 0 ? `${min / 60} sa` : `${min} dk`
}

export function formatTimestamp(at: number): string {
  return new Date(at).toLocaleString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
}

const day = (d?: string | null) => (d ? formatDay(d) : 'Tarihsiz')

export function describeEvent(e: TaskEvent): string {
  switch (e.type) {
    case 'created':
      return 'Oluşturuldu'
    case 'edited':
      return 'Düzenlendi'
    case 'completed':
      return e.to ? `Tamamlandı (${formatDay(e.to)})` : 'Tamamlandı'
    case 'uncompleted':
      return 'Tamamlama geri alındı'
    case 'moved':
      return `Tarihi değişti: ${day(e.from)} → ${day(e.to)}`
    case 'unscheduled':
      return `Tarihsiz listeye alındı (${day(e.from)} gününden)`
    case 'skipped':
      return 'Bu seferlik atlandı'
    case 'subtask_done':
      return `Alt görev tamamlandı: ${e.detail}`
    case 'subtask_undone':
      return `Alt görev geri alındı: ${e.detail}`
    case 'deleted':
      return 'Silindi'
    case 'undone':
      return `İşlem geri alındı: ${e.detail}`
  }
}

/** Tekrarlı görevlerde olayın hangi güne ait tekrar için olduğunu söyler. */
export function eventOccurrenceLabel(e: TaskEvent): string | null {
  const original = e.occId?.split('|')[1]
  return original && original !== 'single' ? `${formatDay(original)} tekrarı` : null
}
