import { describe, expect, it } from 'vitest'
import { addDays, isoWeekday } from './dates'
import { itemsForDate, occId, overdueItems, sectionOf, undatedItems, SINGLE } from './derive'
import { nextOnOrAfter, occursOn } from './recurrence'
import type { Occurrence, Task } from './types'

let n = 0
function task(over: Partial<Task>): Task {
  n++
  return {
    id: `t${n}`, title: `Görev ${n}`, note: '', categoryId: null, plannedDate: null, dueDate: null,
    recurrence: null, longTerm: false, priority: 'normal', estimateMin: null, difficulty: null,
    sortOrder: n, suggestionDismissed: false, createdAt: 0, updatedAt: 0, deletedAt: null, ...over,
  }
}
function occ(t: Task, originalDate: string, over: Partial<Occurrence>): Occurrence {
  return {
    id: occId(t.id, originalDate), taskId: t.id, originalDate, moved: false, plannedDate: null,
    status: 'pending', completedAt: null, completedOn: null, doneSubtasks: {}, updatedAt: 0, ...over,
  }
}

// 2026-10-11 bir Pazar.
const SUN = '2026-10-11'
const MON = '2026-10-12'
const NEXT_SUN = '2026-10-18'

describe('tekrarlar', () => {
  it('takvim günlerini doğru hesaplar', () => {
    expect(isoWeekday(SUN)).toBe(7)
    const weekly = task({ plannedDate: '2026-10-01', recurrence: { type: 'weekly', days: [7] } })
    expect(occursOn(weekly, SUN)).toBe(true)
    expect(occursOn(weekly, MON)).toBe(false)
    expect(occursOn(weekly, '2026-09-27')).toBe(false) // başlangıçtan önce
    expect(nextOnOrAfter(weekly, MON)).toBe(NEXT_SUN)
  })

  it('aylık tekrar kısa aylarda ayın son gününe düşer', () => {
    const monthly = task({ plannedDate: '2026-01-31', recurrence: { type: 'monthly', day: 31 } })
    expect(occursOn(monthly, '2027-02-28')).toBe(true)
    expect(occursOn(monthly, '2026-03-30')).toBe(false)
  })

  it('özel aralık başlangıçtan sayar', () => {
    const every3 = task({ plannedDate: SUN, recurrence: { type: 'interval', every: 3, unit: 'day' } })
    expect([0, 1, 2, 3, 6].map((i) => occursOn(every3, addDays(SUN, i)))).toEqual([true, false, false, true, true])
  })

  it('geç tamamlanan haftalık görevin sonraki günü kaymaz', () => {
    const t = task({ plannedDate: '2026-10-01', recurrence: { type: 'weekly', days: [7] } })
    const occs = [occ(t, SUN, { status: 'done', completedOn: MON })]
    const snap = { tasks: [t], occs }
    expect(itemsForDate(snap, MON).map((i) => [i.key, i.status])).toEqual([[occId(t.id, SUN), 'done']])
    expect(itemsForDate(snap, NEXT_SUN).map((i) => [i.originalDate, i.status])).toEqual([[NEXT_SUN, 'pending']])
  })

  it('atlanan tekrar diğerlerini etkilemez', () => {
    const t = task({ plannedDate: '2026-10-01', recurrence: { type: 'daily' } })
    const snap = { tasks: [t], occs: [occ(t, SUN, { status: 'skipped' })] }
    expect(itemsForDate(snap, SUN)).toEqual([])
    expect(itemsForDate(snap, MON)).toHaveLength(1)
    expect(itemsForDate(snap, addDays(SUN, -1))).toHaveLength(1)
  })

  it('taşınan tekrar yalnızca yeni gününde görünür, seri yerinde kalır', () => {
    const t = task({ plannedDate: '2026-10-01', recurrence: { type: 'weekly', days: [7] } })
    const snap = { tasks: [t], occs: [occ(t, SUN, { moved: true, plannedDate: '2026-10-14' })] }
    expect(itemsForDate(snap, SUN)).toEqual([])
    expect(itemsForDate(snap, '2026-10-14').map((i) => i.originalDate)).toEqual([SUN])
    expect(itemsForDate(snap, NEXT_SUN)).toHaveLength(1)
  })
})

describe('geçmişten kalanlar', () => {
  it('tek seferlik görev bugüne taşınmaz, geçmişten kalanlarda görünür', () => {
    const t = task({ plannedDate: '2026-10-08' })
    const snap = { tasks: [t], occs: [] }
    expect(itemsForDate(snap, SUN)).toEqual([])
    expect(overdueItems(snap, SUN).map((i) => i.date)).toEqual(['2026-10-08'])
  })

  it('tamamlanan veya atlanan iş geçmişten kalanlarda görünmez', () => {
    const a = task({ plannedDate: '2026-10-08' })
    const b = task({ plannedDate: '2026-10-08' })
    const occs = [occ(a, SINGLE, { status: 'done', completedOn: '2026-10-09' }), occ(b, SINGLE, { status: 'skipped' })]
    expect(overdueItems({ tasks: [a, b], occs }, SUN)).toEqual([])
  })

  it('günlük rutinler birikmez', () => {
    const t = task({ plannedDate: '2026-09-01', recurrence: { type: 'daily' } })
    expect(overdueItems({ tasks: [t], occs: [] }, SUN)).toEqual([])
  })

  it('kaçan haftalık tekrar, sıradaki günü gelene kadar tek kayıt olarak durur', () => {
    const t = task({ plannedDate: '2026-09-01', recurrence: { type: 'weekly', days: [7] } })
    const snap = { tasks: [t], occs: [] }
    expect(overdueItems(snap, '2026-10-14').map((i) => i.originalDate)).toEqual([SUN])
    expect(overdueItems(snap, NEXT_SUN)).toEqual([])
  })
})

describe('listeler', () => {
  it('tarihsiz görev Bugün ekranına girmez', () => {
    const t = task({})
    const snap = { tasks: [t], occs: [] }
    expect(itemsForDate(snap, SUN)).toEqual([])
    expect(undatedItems(snap)).toHaveLength(1)
  })

  it('her iş tek bir bölüme düşer', () => {
    const snap = {
      tasks: [
        task({ plannedDate: SUN, priority: 'high', recurrence: { type: 'daily' } }),
        task({ plannedDate: SUN, recurrence: { type: 'daily' } }),
        task({ plannedDate: SUN }),
      ],
      occs: [],
    }
    expect(itemsForDate(snap, SUN).map(sectionOf)).toEqual(['priority', 'routine', 'other'])
  })

  it('silinen görev hiçbir listede görünmez', () => {
    const t = task({ plannedDate: SUN, deletedAt: 1 })
    expect(itemsForDate({ tasks: [t], occs: [] }, SUN)).toEqual([])
  })
})
