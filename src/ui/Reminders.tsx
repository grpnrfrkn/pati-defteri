import { useEffect, useState } from 'react'
import { minutesOf } from '../domain/dates'
import { itemsForDate } from '../domain/derive'
import type { Item } from '../domain/types'
import { useApp } from './context'

/** Saati bu kadar dakikadan fazla geçmiş hatırlatmalar gösterilmez; geç kalmış uyarı baskı gibi durur. */
const WINDOW_MIN = 60
const shownKey = (item: Item, today: string) => `pati.hatirlatma.${today}.${item.key}`

/**
 * Uygulama açıkken saati gelen hatırlatmaları gösterir. Uygulama kapalıyken
 * bildirim göndermek bir sunucu gerektirir; bkz. docs/SONRAYA-BIRAKILANLAR.md.
 */
export function Reminders({ now }: { now: string }) {
  const { data, today, open } = useApp()
  const [active, setActive] = useState<Item[]>([])

  useEffect(() => {
    const nowMin = minutesOf(now)
    const due = itemsForDate({ tasks: data.tasks, occs: data.occs }, today).filter((item) => {
      const time = item.task.reminderEnabled ? item.task.reminderTime : null
      if (!time || item.status !== 'pending' || item.date !== today) return false
      const late = nowMin - minutesOf(time)
      return late >= 0 && late <= WINDOW_MIN && !localStorage.getItem(shownKey(item, today))
    })
    if (due.length === 0) return
    for (const item of due) {
      localStorage.setItem(shownKey(item, today), '1')
      if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
        navigator.serviceWorker?.ready
          .then((reg) => reg.showNotification('Minik bir hatırlatma 🌷', { body: item.task.title, tag: item.key }))
          .catch(() => {})
      }
    }
    setActive((list) => [...list, ...due])
  }, [now, today, data.tasks, data.occs])

  // Tamamlanan ya da planı değişen işin hatırlatması ekranda kalmasın.
  const todays = new Map(itemsForDate({ tasks: data.tasks, occs: data.occs }, today).map((i) => [i.key, i]))
  const visible = active.filter((a) => todays.get(a.key)?.status === 'pending')
  if (visible.length === 0) return null

  return (
    <div className="reminders">
      {visible.map((item) => (
        <aside key={item.key} className="callout" role="status">
          <p>
            Minik bir hatırlatma 🌷 Sırada: <strong>{item.task.title}</strong>
          </p>
          <div className="row-actions">
            <button
              className="btn soft"
              onClick={() => open({ type: 'detail', taskId: item.task.id, originalDate: item.originalDate })}
            >
              Aç
            </button>
            <button className="btn ghost" onClick={() => setActive((list) => list.filter((a) => a.key !== item.key))}>
              Tamam
            </button>
          </div>
        </aside>
      ))}
    </div>
  )
}
