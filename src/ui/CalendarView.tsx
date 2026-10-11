import { useState } from 'react'
import {
  addDays,
  addMonths,
  dayOfMonth,
  formatDay,
  formatLong,
  monthOf,
  MONTHS,
  startOfMonth,
  startOfWeek,
  WEEKDAYS_SHORT,
} from '../domain/dates'
import { itemsForDate } from '../domain/derive'
import type { ISODate } from '../domain/types'
import { useApp } from './context'
import { Chips } from './Sheet'
import { TaskRow } from './TaskRow'

type Mode = 'month' | 'week'

/** Aylık ve haftalık takvim. Tarihsiz görevler burada hiçbir güne yerleştirilmez. */
export function CalendarView() {
  const { data, today, open } = useApp()
  const [mode, setMode] = useState<Mode>('month')
  const [selected, setSelected] = useState<ISODate>(today)
  // Görünen ay ya da hafta, içindeki herhangi bir günle tutulur.
  const [cursor, setCursor] = useState<ISODate>(today)

  const snap = { tasks: data.tasks, occs: data.occs }
  const first = mode === 'month' ? startOfWeek(startOfMonth(cursor)) : startOfWeek(cursor)
  const monthEnd = addDays(addMonths(cursor, 1), -1)
  const cellCount = mode === 'week' ? 7 : Math.ceil((dayOfMonth(monthEnd) + offset(first, startOfMonth(cursor))) / 7) * 7
  const days = Array.from({ length: cellCount }, (_, i) => addDays(first, i))

  const step = (dir: number) => setCursor(mode === 'month' ? addMonths(cursor, dir) : addDays(cursor, dir * 7))
  const goToday = () => {
    setCursor(today)
    setSelected(today)
  }

  const title =
    mode === 'month'
      ? `${MONTHS[monthOf(cursor) - 1]} ${cursor.slice(0, 4)}`
      : `${formatDay(days[0])} – ${formatDay(days[6])}`

  const dayItems = itemsForDate(snap, selected)

  return (
    <div className="stack">
      <div className="cal-bar">
        <Chips
          label="Takvim görünümü"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'month', label: 'Ay' },
            { value: 'week', label: 'Hafta' },
          ]}
        />
        <button className="btn ghost" onClick={goToday}>
          Bugün
        </button>
      </div>

      <div className="cal-nav">
        <button className="icon-btn" aria-label={mode === 'month' ? 'Önceki ay' : 'Önceki hafta'} onClick={() => step(-1)}>
          ‹
        </button>
        <h2 aria-live="polite">{title}</h2>
        <button className="icon-btn" aria-label={mode === 'month' ? 'Sonraki ay' : 'Sonraki hafta'} onClick={() => step(1)}>
          ›
        </button>
      </div>

      <div className="card cal">
        <div className="cal-grid" aria-hidden>
          {WEEKDAYS_SHORT.map((d) => (
            <span key={d} className="cal-weekday">
              {d}
            </span>
          ))}
        </div>
        <div className="cal-grid">
          {days.map((d) => {
            const items = itemsForDate(snap, d)
            const done = items.filter((i) => i.status === 'done').length
            const outside = mode === 'month' && monthOf(d) !== monthOf(cursor)
            const allDone = items.length > 0 && done === items.length
            return (
              <button
                key={d}
                className={`cal-day${d === selected ? ' selected' : ''}${d === today ? ' today' : ''}${outside ? ' outside' : ''}`}
                aria-pressed={d === selected}
                aria-label={`${formatLong(d)}: ${items.length ? `${items.length} görev, ${done} tamamlandı` : 'görev yok'}`}
                onClick={() => setSelected(d)}
              >
                <span className="cal-num">{dayOfMonth(d)}</span>
                {items.length > 0 && (
                  <span className={`cal-count${allDone ? ' all-done' : ''}`}>
                    {allDone ? '✓' : ''}
                    {done}/{items.length}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <section className="stack">
        <div className="page-head">
          <h2>
            {selected === today ? 'Bugün · ' : ''}
            {formatLong(selected)}
          </h2>
          <button className="btn soft" onClick={() => open({ type: 'form', defaults: { plannedDate: selected } })}>
            + Bu güne ekle
          </button>
        </div>
        {dayItems.length === 0 ? (
          <p className="sub">Bu gün için planlanmış bir şey yok.</p>
        ) : (
          <ul className="task-list">
            {dayItems.map((item) => (
              <li key={item.key}>
                <TaskRow item={item} hideCheck={selected > today && item.status !== 'done'} />
              </li>
            ))}
          </ul>
        )}
        <p className="hint">Bir görevin gününü değiştirmek için üstüne dokun, “Planı değiştir”den yeni tarihi seç.</p>
      </section>
    </div>
  )
}

/** Ayın ilk gününden önce, haftanın başından itibaren kaç boş hücre var? */
function offset(gridStart: ISODate, monthStart: ISODate): number {
  let n = 0
  for (let d = gridStart; d < monthStart; d = addDays(d, 1)) n++
  return n
}
