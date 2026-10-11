import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { buildItem, occId, SINGLE } from '../domain/derive'
import { progressFor, REWARDS, rewardFor, xpToReach } from '../domain/rewards'
import type { Item } from '../domain/types'
import { completeItem, createTask, skipItem, toggleSubtask, uncompleteItem } from './actions'
import { db } from './db'

const TODAY = '2026-10-11'

async function itemOf(taskId: string, originalDate: string = SINGLE): Promise<Item> {
  const task = (await db.tasks.get(taskId))!
  return buildItem(task, originalDate, await db.occurrences.get(occId(taskId, originalDate)))
}
async function totals() {
  const rows = await db.ledger.toArray()
  return { count: rows.length, xp: rows.reduce((n, r) => n + r.xp, 0), pati: rows.reduce((n, r) => n + r.pati, 0) }
}

beforeEach(async () => {
  await Promise.all(db.tables.map((t) => t.clear()))
})

describe('ödül miktarı', () => {
  it('süre ve zorluğa göre hesaplanır, hiçbir görev ödülsüz kalmaz', () => {
    expect(rewardFor({ estimateMin: null, difficulty: null })).toEqual({ xp: 10, pati: 5 })
    expect(rewardFor({ estimateMin: 5, difficulty: 'easy' })).toEqual({ xp: 6, pati: 3 })
    expect(rewardFor({ estimateMin: 60, difficulty: 'hard' })).toEqual({ xp: 35, pati: 18 })
    expect(rewardFor({ estimateMin: 240, difficulty: null }).xp).toBe(REWARDS.xpOverAnHour)
  })

  it('seviye ve büyüme aşaması yalnızca XP’ye bağlıdır', () => {
    expect(progressFor(0)).toMatchObject({ level: 1, stage: 'kitten', intoLevel: 0, needed: 40 })
    expect(progressFor(130)).toMatchObject({ level: 3, intoLevel: 10, needed: 120 })
    expect(progressFor(xpToReach(5)).stage).toBe('young')
    expect(progressFor(xpToReach(10)).stage).toBe('adult')
  })
})

describe('ödül kayıtları', () => {
  it('tamamlanan görev doğru XP ve pati kazandırır', async () => {
    const task = await createTask({ title: 'Çamaşır', plannedDate: TODAY, estimateMin: 15 })
    await completeItem(await itemOf(task.id), TODAY)
    expect(await totals()).toEqual({ count: 1, xp: 10, pati: 5 })
  })

  it('aynı tamamlanma iki kez ödül oluşturmaz', async () => {
    const task = await createTask({ title: 'Çamaşır', plannedDate: TODAY })
    const item = await itemOf(task.id)
    await completeItem(item, TODAY)
    await completeItem(item, TODAY)
    await completeItem(await itemOf(task.id), '2026-10-10') // tamamlanma tarihini düzeltmek
    expect(await totals()).toEqual({ count: 1, xp: 10, pati: 5 })
  })

  it('tamamlama geri alınınca ödül de geri alınır; geri alma geri alınırsa döner', async () => {
    const task = await createTask({ title: 'Çamaşır', plannedDate: TODAY })
    const undoComplete = await completeItem(await itemOf(task.id), TODAY)
    await undoComplete()
    expect((await totals()).count).toBe(0)

    await completeItem(await itemOf(task.id), TODAY)
    const undoUncomplete = await uncompleteItem(await itemOf(task.id))
    expect((await totals()).count).toBe(0)
    await undoUncomplete()
    expect(await totals()).toEqual({ count: 1, xp: 10, pati: 5 })
  })

  it('alt görevler küçük ödül verir, ana görev bitince alt görev ödülleri yeniden sayılmaz', async () => {
    const task = await createTask({ title: 'Gardırop', plannedDate: TODAY }, [{ title: 'Kazaklar' }, { title: 'Çekmeceler' }])
    const subs = await db.subtasks.where('taskId').equals(task.id).toArray()
    await toggleSubtask(await itemOf(task.id), subs[0])
    await toggleSubtask(await itemOf(task.id), subs[1])
    expect(await totals()).toEqual({ count: 2, xp: 6, pati: 2 })

    await completeItem(await itemOf(task.id), TODAY)
    expect(await totals()).toEqual({ count: 3, xp: 16, pati: 7 })

    await toggleSubtask(await itemOf(task.id), subs[0]) // işareti kaldır
    expect(await totals()).toEqual({ count: 2, xp: 13, pati: 6 })
  })

  it('tekrarlı görevin her gerçekleşmesi ayrı ve tam ödül kazandırır', async () => {
    const task = await createTask({ title: 'Cilt bakımı', plannedDate: '2026-10-01', recurrence: { type: 'daily' } })
    await completeItem(await itemOf(task.id, '2026-10-10'), TODAY)
    await completeItem(await itemOf(task.id, TODAY), TODAY)
    expect(await totals()).toEqual({ count: 2, xp: 20, pati: 10 })
  })

  it('atlamak ödül vermez ama var olan bakiyeye de dokunmaz', async () => {
    const done = await createTask({ title: 'Yapılan', plannedDate: TODAY })
    const skipped = await createTask({ title: 'Atlanan', plannedDate: TODAY })
    await completeItem(await itemOf(done.id), TODAY)
    await skipItem(await itemOf(skipped.id))
    expect(await totals()).toEqual({ count: 1, xp: 10, pati: 5 })
  })
})
