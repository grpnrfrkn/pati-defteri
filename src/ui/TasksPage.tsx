import { useState } from 'react'
import { addDays, formatDay, relativeDay } from '../domain/dates'
import { buildItem, occId, SINGLE, undatedItems } from '../domain/derive'
import { nextOnOrAfter } from '../domain/recurrence'
import type { Item, Task } from '../domain/types'
import { useApp } from './context'
import { Chips } from './Sheet'
import { TaskRow } from './TaskRow'

type Filter = 'all' | 'daily' | 'weekly' | 'monthly' | 'planned' | 'undated' | 'longTerm' | 'done'

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Hepsi' },
  { value: 'daily', label: 'Günlük' },
  { value: 'weekly', label: 'Haftalık' },
  { value: 'monthly', label: 'Aylık' },
  { value: 'planned', label: 'Planlı' },
  { value: 'undated', label: 'Tarihsiz' },
  { value: 'longTerm', label: 'Uzun vadeli' },
  { value: 'done', label: 'Tamamlanan' },
]

function kindOf(task: Task): Filter {
  const rule = task.recurrence
  if (!rule) return task.plannedDate ? 'planned' : 'undated'
  if (rule.type === 'monthly') return 'monthly'
  if (rule.type === 'weekly' || (rule.type === 'interval' && rule.unit === 'week')) return 'weekly'
  return 'daily'
}

export function TasksPage() {
  const { data, today } = useApp()
  const [filter, setFilter] = useState<Filter>('all')
  const occById = new Map(data.occs.map((o) => [o.id, o]))

  // Tekrarlı görevler sıradaki tekrarlarıyla, tek seferlikler kendileriyle listelenir.
  const rows: { item: Item; extra?: string; hideCheck?: boolean }[] = []
  for (const task of [...data.tasks].sort((a, b) => a.sortOrder - b.sortOrder)) {
    if (task.recurrence) {
      // Sıradaki bekleyen tekrar: tamamlanmış, atlanmış ya da taşınmış olanlar geçilir.
      let next = nextOnOrAfter(task, today)
      for (let i = 0; next && i < 60; i++) {
        const occ = occById.get(occId(task.id, next))
        if (!occ || (occ.status === 'pending' && !occ.moved)) break
        next = nextOnOrAfter(task, addDays(next, 1))
      }
      if (!next) continue
      rows.push({
        item: buildItem(task, next, occById.get(occId(task.id, next))),
        extra: `Sıradaki: ${relativeDay(next, today)}`,
        hideCheck: next !== today,
      })
    } else {
      const item = buildItem(task, SINGLE, occById.get(occId(task.id, SINGLE)))
      if (item.status === 'skipped') continue
      rows.push({
        item,
        extra: item.status === 'done' ? undefined : task.plannedDate ? relativeDay(task.plannedDate, today) : 'Tarihsiz',
      })
    }
  }
  // Tarihsiz listeye alınmış tekil tekrarlar.
  for (const item of undatedItems({ tasks: data.tasks, occs: data.occs })) {
    if (item.recurring) rows.push({ item, extra: `${formatDay(item.originalDate)} tekrarı · tarihsiz` })
  }

  const visible = rows.filter(({ item }) => {
    const singleDone = !item.recurring && item.status === 'done'
    if (filter === 'done') return singleDone
    if (singleDone) return false
    if (filter === 'all') return true
    if (filter === 'longTerm') return item.task.longTerm
    if (filter === 'undated') return item.date === null
    return item.date !== null && kindOf(item.task) === filter
  })

  return (
    <div className="page">
      <header className="page-head">
        <h1>Görevler</h1>
      </header>
      <Chips label="Görev türü" options={FILTERS} value={filter} onChange={setFilter} />
      {visible.length === 0 ? (
        <div className="empty">
          <p>Burada şimdilik bir şey yok 🌷</p>
        </div>
      ) : (
        <ul className="task-list">
          {visible.map(({ item, extra, hideCheck }) => (
            <li key={item.key}>
              <TaskRow item={item} extra={extra} hideCheck={hideCheck} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
