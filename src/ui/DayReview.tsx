import { useState } from 'react'
import { moveItem, setMeta, skipItem, unscheduleItem, type Undo } from '../db/actions'
import { addDays, formatDay } from '../domain/dates'
import { itemsForDate } from '../domain/derive'
import type { ISODate, Item } from '../domain/types'
import { useApp } from './context'
import { MoveActions } from './MoveActions'
import { Sheet } from './Sheet'

export const reviewKey = (date: ISODate) => `review:${date}`

/**
 * Günü Toparla: günün özeti ve bekleyen işler için kolay kararlar.
 * Hiçbir karar zorunlu değildir; atlamak ya da ertelemek bir şey kaybettirmez.
 */
export function DayReview({ date, onLater, onFinished }: { date: ISODate; onLater: () => void; onFinished: () => void }) {
  const { data, today, act } = useApp()
  const [selected, setSelected] = useState<string[]>([])
  const [choosing, setChoosing] = useState<string | null>(null)

  const items = itemsForDate({ tasks: data.tasks, occs: data.occs }, date)
  const done = items.filter((i) => i.status === 'done')
  const pending = items.filter((i) => i.status === 'pending')
  const picked = pending.filter((i) => selected.includes(i.key))
  const isToday = date === today
  const tomorrow = addDays(today, 1)

  const bulk = (label: string, change: (item: Item) => Promise<Undo>) =>
    act(async (): Promise<Undo> => {
      const undos: Undo[] = []
      for (const item of picked) undos.push(await change(item))
      setSelected([])
      return async () => {
        for (const undo of undos.reverse()) await undo()
      }
    }, `${picked.length} görev ${label}`)

  const finish = async () => {
    if (await act(() => setMeta(reviewKey(date), 'done'))) onFinished()
  }

  return (
    <Sheet title="Günü Toparla" onClose={onLater}>
      <div className="stack">
        <p className="review-lead">
          {isToday ? 'Bugün yaptıklarına bir bakalım 🌷' : `${formatDay(date)} gününe bir bakalım 🌷`}
        </p>

        <section className="card panel stack">
          <p>
            <strong>{done.length}</strong> iş tamamlandı.
            {done.length > 0 ? ' Minik bir adım da ilerlemedir 🐾' : ' Dinlenmek de günün bir parçası.'}
          </p>
          {done.length > 0 && (
            <ul className="done-list">
              {done.map((i) => (
                <li key={i.key}>✓ {i.task.title}</li>
              ))}
            </ul>
          )}
        </section>

        {pending.length === 0 ? (
          <p className="sub">Bekleyen bir şey yok; her şey yerli yerinde.</p>
        ) : (
          <section className="stack">
            <h3>Bunları başka bir güne planlamak ister misin?</h3>
            <label className="check-field">
              <input
                type="checkbox"
                checked={picked.length === pending.length}
                onChange={(e) => setSelected(e.target.checked ? pending.map((i) => i.key) : [])}
              />
              Hepsini seç
            </label>
            <ul className="plain-list">
              {pending.map((item) => (
                <li key={item.key} className="card review-item">
                  <label className="check-field">
                    <input
                      type="checkbox"
                      checked={selected.includes(item.key)}
                      onChange={(e) =>
                        setSelected((list) => (e.target.checked ? [...list, item.key] : list.filter((k) => k !== item.key)))
                      }
                    />
                    <span>{item.task.title}</span>
                  </label>
                  {choosing === item.key ? (
                    <MoveActions item={item} leaveLabel="Şimdilik karar verme" onDone={() => setChoosing(null)} />
                  ) : (
                    <button className="btn ghost" onClick={() => setChoosing(item.key)}>
                      Seçenekler
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {picked.length > 0 && (
              <div className="callout">
                <p>Seçilen {picked.length} görev için:</p>
                <div className="row-actions">
                  {!isToday && (
                    <button className="btn soft" onClick={() => bulk('bugüne alındı', (i) => moveItem(i, today))}>
                      Bugüne al
                    </button>
                  )}
                  <button className="btn soft" onClick={() => bulk('yarına taşındı', (i) => moveItem(i, tomorrow))}>
                    Yarına taşı
                  </button>
                  <button className="btn soft" onClick={() => bulk('bu seferlik atlandı', skipItem)}>
                    Bu seferlik atla
                  </button>
                  <button className="btn soft" onClick={() => bulk('tarihsiz listeye alındı', unscheduleItem)}>
                    Daha sonra planla
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        <div className="form-actions">
          <button className="btn ghost" onClick={onLater}>
            Daha sonra
          </button>
          <button className="btn primary" onClick={finish}>
            Bugünlük burada bırakalım
          </button>
        </div>
      </div>
    </Sheet>
  )
}
