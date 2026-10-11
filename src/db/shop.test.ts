import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { buildItem } from '../domain/derive'
import { CATALOG, clampPosition, DEFAULT_ROOM, findItem, normalizeRoom } from '../domain/shop'
import type { RoomState } from '../domain/types'
import { buyItem, completeItem, createTask, saveRoom, UserError } from './actions'
import { db } from './db'

/** Bakiyeyi gerçek yoldan, görev tamamlayarak doldurur (görev başına 22 XP, 11 pati). */
async function earn(tasks: number) {
  for (let i = 0; i < tasks; i++) {
    const task = await createTask({ title: `İş ${i}`, plannedDate: '2026-10-11', estimateMin: 60 })
    await completeItem(buildItem(task, 'single'), '2026-10-11')
  }
}
const balance = async () => (await db.ledger.toArray()).reduce((sum, r) => sum + r.pati, 0)
const owns = async (id: string) => !!(await db.ledger.get(`satin:${id}`))

beforeEach(async () => {
  await Promise.all(db.tables.map((t) => t.clear()))
})

describe('satın alma', () => {
  it('pati düşer ve eşya envantere girer', async () => {
    await earn(2) // 22 pati
    await buyItem('acc-bow') // 15
    expect(await balance()).toBe(7)
    expect(await owns('acc-bow')).toBe(true)
  })

  it('aynı eşya iki kez satın alınamaz, çift dokunuş tek ödeme yapar', async () => {
    await earn(5) // 55 pati
    const results = await Promise.allSettled([buyItem('acc-bow'), buyItem('acc-bow')])
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
    await expect(buyItem('acc-bow')).rejects.toBeInstanceOf(UserError)
    expect(await balance()).toBe(40)
  })

  it('bakiye yetmezse alınmaz ve hiçbir şey değişmez', async () => {
    await earn(1) // 11 pati
    await expect(buyItem('acc-bow')).rejects.toThrow('4 pati daha')
    expect(await balance()).toBe(11)
    expect(await owns('acc-bow')).toBe(false)
  })

  it('seviye kilidi: açılmadan alınamaz, açılınca da parasıyla alınır', async () => {
    await earn(5) // 110 XP: seviye 2, 55 pati
    await expect(buyItem('acc-flowers')).rejects.toThrow('seviye 3')
    await earn(1) // 132 XP: seviye 3, 66 pati
    await buyItem('acc-flowers') // 35
    expect(await balance()).toBe(31)
  })

  it('geri alınınca para iade edilir ve eşya odadan kalkar', async () => {
    await earn(4) // 44 pati
    const undo = await buyItem('fur-plant') // 30
    await saveRoom({ ...DEFAULT_ROOM, placed: [{ itemId: 'fur-plant', x: 0.5, y: 0.9 }] })
    await undo()
    expect(await balance()).toBe(44)
    expect(((await db.meta.get('room'))!.value as RoomState).placed).toEqual([])
  })
})

describe('oda', () => {
  it('katalogdaki her eşya kullanılabilir biçimde tanımlı', () => {
    expect(new Set(CATALOG.map((i) => i.id)).size).toBe(CATALOG.length)
    for (const item of CATALOG) {
      const placeable = !!item.emoji && !!item.size && !!item.zone
      const usable = item.category === 'accessory' ? !!item.slot : item.category === 'wallpaper' || item.category === 'rug' ? !!item.style : placeable
      expect(usable, item.id).toBe(true)
    }
    // Baştan açık eşyalar da, seviyeyle açılanlar da var.
    expect(CATALOG.some((i) => i.minLevel)).toBe(true)
    expect(CATALOG.filter((i) => !i.minLevel && i.price > 0).length).toBeGreaterThan(10)
  })

  it('eşyalar oda dışına ve yanlış bölgeye taşamaz', () => {
    expect(clampPosition('floor', -1, 0.1)).toEqual({ x: 0.08, y: 0.76 })
    expect(clampPosition('floor', 2, 5)).toEqual({ x: 0.92, y: 0.98 })
    expect(clampPosition('wall', 0.5, 0.95)).toEqual({ x: 0.5, y: 0.62 })
    expect(clampPosition('wall', 0.5, NaN).y).toBe(0.2)
  })

  it('kayıtlı oda yüklenirken sahip olunmayan ya da bilinmeyen eşyalar çizilmez', () => {
    const owned = new Set(['fur-plant', 'acc-bow'])
    const owns = (id: string) => owned.has(id) || findItem(id)?.price === 0
    const room = normalizeRoom(
      {
        wallpaper: 'wall-night',
        rug: 'rug-pink',
        wearing: { neck: 'acc-bow', head: 'acc-crown' },
        placed: [
          { itemId: 'fur-plant', x: 0.5, y: 0.1 },
          { itemId: 'fur-sofa', x: 0.5, y: 0.9 },
          { itemId: 'yok', x: 0, y: 0 },
        ],
      },
      owns,
    )
    expect(room).toEqual({
      wallpaper: 'wall-pink',
      rug: null,
      wearing: { neck: 'acc-bow' },
      placed: [{ itemId: 'fur-plant', x: 0.5, y: 0.76 }],
    })
    expect(normalizeRoom(undefined, owns)).toEqual(DEFAULT_ROOM)
  })
})
