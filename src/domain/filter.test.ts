import { describe, expect, it } from 'vitest'
import { applyEffort, matchEffort, matchesTask, NO_EFFORT, NO_FILTER } from './filter'
import type { Task } from './types'

let n = 0
function task(over: Partial<Task>): Task {
  n++
  return {
    id: `t${n}`, title: `Görev ${n}`, note: '', categoryId: null, plannedDate: null, dueDate: null,
    recurrence: null, longTerm: false, priority: 'normal', estimateMin: null, difficulty: null,
    sortOrder: n, suggestionDismissed: false, createdAt: 0, updatedAt: 0, deletedAt: null, ...over,
  }
}

describe('süre ve zorluk filtresi', () => {
  it('ikisi birlikte çalışır', () => {
    const f = { maxMinutes: 15, difficulty: 'easy' as const, includeUnspecified: false }
    expect(matchEffort(task({ estimateMin: 10, difficulty: 'easy' }), f)).toBe('match')
    expect(matchEffort(task({ estimateMin: 15, difficulty: 'easy' }), f)).toBe('match')
    expect(matchEffort(task({ estimateMin: 30, difficulty: 'easy' }), f)).toBe('miss')
    expect(matchEffort(task({ estimateMin: 10, difficulty: 'hard' }), f)).toBe('miss')
  })

  it('belirtilmemiş zorluk kolay sayılmaz, ayrı tutulur', () => {
    const f = { maxMinutes: 15, difficulty: 'easy' as const, includeUnspecified: false }
    expect(matchEffort(task({ estimateMin: 10 }), f)).toBe('unspecified')
    expect(matchEffort(task({ difficulty: 'easy' }), f)).toBe('unspecified')
    // Aykırı olduğu bilinen görev, eksik bilgisi olsa da elenir.
    expect(matchEffort(task({ estimateMin: 60 }), f)).toBe('miss')
  })

  it('gizlenen belirtilmemiş görevleri sayar, istenirse gösterir', () => {
    const rows = [task({ estimateMin: 5 }), task({}), task({ estimateMin: 60 })]
    const f = { maxMinutes: 15, difficulty: null, includeUnspecified: false }
    expect(applyEffort(rows, (t) => t, f)).toMatchObject({ shown: [rows[0]], unspecified: 1 })
    expect(applyEffort(rows, (t) => t, { ...f, includeUnspecified: true }).shown).toEqual([rows[0], rows[1]])
    expect(applyEffort(rows, (t) => t, NO_EFFORT).shown).toHaveLength(3)
  })
})

describe('görev filtreleri', () => {
  it('ada göre arar, Türkçe büyük küçük harfe takılmaz', () => {
    const t = task({ title: 'Işıkları kapat' })
    expect(matchesTask(t, { ...NO_FILTER, text: 'IŞIK' })).toBe(true)
    expect(matchesTask(t, { ...NO_FILTER, text: 'çamaşır' })).toBe(false)
  })

  it('birden fazla filtre birlikte uygulanır', () => {
    const t = task({ categoryId: 'ev', priority: 'high', plannedDate: '2026-10-11' })
    const f = { ...NO_FILTER, categoryId: 'ev', priority: 'high' as const, kind: 'single' as const }
    expect(matchesTask(t, f)).toBe(true)
    expect(matchesTask(t, { ...f, priority: 'low' })).toBe(false)
    expect(matchesTask(t, { ...f, kind: 'recurring' })).toBe(false)
    expect(matchesTask(t, { ...NO_FILTER, categoryId: 'none' })).toBe(false)
    expect(matchesTask(task({}), { ...NO_FILTER, categoryId: 'none' })).toBe(true)
  })

  it('tarih aralığı: tek seferlikte planlanan gün, tekrarlıda aralıktaki bir tekrar', () => {
    const range = { ...NO_FILTER, from: '2026-10-12', to: '2026-10-14' }
    expect(matchesTask(task({ plannedDate: '2026-10-13' }), range)).toBe(true)
    expect(matchesTask(task({ plannedDate: '2026-10-15' }), range)).toBe(false)
    expect(matchesTask(task({}), range)).toBe(false) // tarihsiz
    const sundays = task({ plannedDate: '2026-10-01', recurrence: { type: 'weekly', days: [7] } })
    expect(matchesTask(sundays, range)).toBe(false)
    expect(matchesTask(sundays, { ...range, to: '2026-10-18' })).toBe(true)
  })
})
