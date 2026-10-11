import { useState } from 'react'
import { saveRoom } from '../db/actions'
import { CATALOG, defaultPosition, type ShopItem, type Slot } from '../domain/shop'
import type { RoomState } from '../domain/types'
import { useApp } from './context'
import { Chips } from './Sheet'
import { ItemArt } from './ShopPage'

type Tab = 'items' | 'wallpaper' | 'rug' | 'accessory'

/** Envanter: sahip olunan eşyaları odaya koyma, kaldırma, takma ve çıkarma. */
export function RoomEditor({ onDone }: { onDone: () => void }) {
  const { data, act } = useApp()
  const [tab, setTab] = useState<Tab>('items')
  const { room } = data
  const owned = CATALOG.filter((item) => item.price === 0 || data.owned.has(item.id))
  const update = (next: RoomState) => act(() => saveRoom(next))

  const togglePlaced = (item: ShopItem) => {
    const isPlaced = room.placed.some((p) => p.itemId === item.id)
    update({
      ...room,
      placed: isPlaced
        ? room.placed.filter((p) => p.itemId !== item.id)
        : [...room.placed, { itemId: item.id, ...defaultPosition(item.zone!, room.placed.length) }],
    })
  }
  const toggleWorn = (item: ShopItem) => {
    const slot = item.slot as Slot
    const wearing = { ...room.wearing }
    if (wearing[slot] === item.id) delete wearing[slot]
    else wearing[slot] = item.id
    update({ ...room, wearing })
  }

  const lists: Record<Tab, ShopItem[]> = {
    items: owned.filter((i) => i.zone),
    wallpaper: owned.filter((i) => i.category === 'wallpaper'),
    rug: owned.filter((i) => i.category === 'rug'),
    accessory: owned.filter((i) => i.slot),
  }

  const state = (item: ShopItem): { on: boolean; label: string; toggle: () => void } => {
    if (item.zone) {
      const on = room.placed.some((p) => p.itemId === item.id)
      return { on, label: on ? 'Odadan kaldır' : 'Odaya koy', toggle: () => togglePlaced(item) }
    }
    if (item.slot) {
      const on = room.wearing[item.slot] === item.id
      return { on, label: on ? 'Çıkar' : 'Tak', toggle: () => toggleWorn(item) }
    }
    if (item.category === 'wallpaper') {
      const on = room.wallpaper === item.id
      return { on, label: on ? 'Duvarda' : 'Bunu kullan', toggle: () => update({ ...room, wallpaper: item.id }) }
    }
    const on = room.rug === item.id
    return { on, label: on ? 'Kaldır' : 'Ser', toggle: () => update({ ...room, rug: on ? null : item.id }) }
  }

  return (
    <section className="stack">
      <p className="hint">
        Odadaki eşyaları sürükleyerek taşıyabilirsin. Zemin eşyaları zeminde, duvar eşyaları duvarda durur.
      </p>
      <Chips
        label="Envanter"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'items', label: 'Eşyalar' },
          { value: 'wallpaper', label: 'Duvar kâğıdı' },
          { value: 'rug', label: 'Halı' },
          { value: 'accessory', label: 'Aksesuar' },
        ]}
      />
      {lists[tab].length === 0 ? (
        <p className="sub">Burada henüz bir şey yok. Mağazadan pati parasıyla alabilirsin.</p>
      ) : (
        <ul className="shop-grid">
          {lists[tab].map((item) => {
            const { on, label, toggle } = state(item)
            return (
              <li key={item.id} className={`card shop-item${on ? ' on' : ''}`}>
                <ItemArt item={item} />
                <strong>{item.name}</strong>
                <button className={`btn ${on ? 'soft' : 'primary'}`} aria-pressed={on} onClick={toggle}>
                  {on && '✓ '}
                  {label}
                </button>
              </li>
            )
          })}
        </ul>
      )}
      <button className="btn primary wide" onClick={onDone}>
        Bitti
      </button>
    </section>
  )
}
