import { useState } from 'react'
import { moveItem, skipItem, unscheduleItem } from '../db/actions'
import { addDays, formatDay } from '../domain/dates'
import type { Item } from '../domain/types'
import { useApp } from './context'

/** Bir işin planını değiştiren seçenekler. Hiçbiri son teslim tarihine dokunmaz. */
export function MoveActions({
  item,
  onDone,
  leaveLabel,
}: {
  item: Item
  onDone?: () => void
  /** Verilirse "hiçbir şey yapma" seçeneği bu adla gösterilir. */
  leaveLabel?: string
}) {
  const { today, act } = useApp()
  const [picking, setPicking] = useState(false)
  const tomorrow = addDays(today, 1)

  const run = async (fn: () => Promise<unknown>, message: string) => {
    if (await act(fn, message)) onDone?.()
  }

  return (
    <div className="move-actions">
      {item.date !== today && (
        <button className="btn soft" onClick={() => run(() => moveItem(item, today), 'Bugüne alındı')}>
          Bugüne al
        </button>
      )}
      {item.date !== tomorrow && (
        <button className="btn soft" onClick={() => run(() => moveItem(item, tomorrow), 'Yarına taşındı')}>
          Yarına taşı
        </button>
      )}
      <button className="btn soft" aria-expanded={picking} onClick={() => setPicking((v) => !v)}>
        Başka tarihe planla
      </button>
      <button className="btn soft" onClick={() => run(() => skipItem(item), 'Bu seferlik atlandı')}>
        Bu seferlik atla
      </button>
      {item.date !== null && (
        <button className="btn soft" onClick={() => run(() => unscheduleItem(item), 'Tarihsiz listeye alındı')}>
          Tarihsiz listeye al
        </button>
      )}
      {leaveLabel && (
        <button className="btn ghost" onClick={onDone}>
          {leaveLabel}
        </button>
      )}
      {picking && (
        <label className="field date-pick">
          <span>Yeni tarih</span>
          <input
            type="date"
            defaultValue={item.date ?? today}
            onChange={(e) => {
              const to = e.target.value
              if (to) run(() => moveItem(item, to), `${formatDay(to)} gününe planlandı`)
            }}
          />
        </label>
      )}
    </div>
  )
}
