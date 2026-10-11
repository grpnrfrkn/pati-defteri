import { useState } from 'react'
import { addDays, formatDay, relativeDay } from '../domain/dates'
import { buildItem, occId, SINGLE, undatedItems } from '../domain/derive'
import { applyEffort, effortActive, matchesTask, NO_EFFORT, NO_FILTER, type EffortFilter, type TaskFilter } from '../domain/filter'
import { nextOnOrAfter } from '../domain/recurrence'
import type { Item, Priority, Task } from '../domain/types'
import { useApp } from './context'
import { EffortControls, useSessionState } from './EffortControls'
import { PRIORITY } from './labels'
import { Chips } from './Sheet'
import { TaskRow } from './TaskRow'

type Kind = 'all' | 'daily' | 'weekly' | 'monthly' | 'planned' | 'undated' | 'longTerm'
type Status = 'pending' | 'done' | 'all'

const KINDS: { value: Kind; label: string }[] = [
  { value: 'all', label: 'Hepsi' },
  { value: 'daily', label: 'Günlük' },
  { value: 'weekly', label: 'Haftalık' },
  { value: 'monthly', label: 'Aylık' },
  { value: 'planned', label: 'Planlı' },
  { value: 'undated', label: 'Tarihsiz' },
  { value: 'longTerm', label: 'Uzun vadeli' },
]

interface Filters {
  kind: Kind
  status: Status
  task: TaskFilter
  effort: EffortFilter
}

const NO_FILTERS: Filters = { kind: 'all', status: 'pending', task: NO_FILTER, effort: NO_EFFORT }

function kindOf(task: Task): Kind {
  const rule = task.recurrence
  if (!rule) return task.plannedDate ? 'planned' : 'undated'
  if (rule.type === 'monthly') return 'monthly'
  if (rule.type === 'weekly' || (rule.type === 'interval' && rule.unit === 'week')) return 'weekly'
  return 'daily'
}

export function TasksPage() {
  const { data, today } = useApp()
  const [filters, setFilters] = useSessionState<Filters>('pati.gorevler.filtre', NO_FILTERS)
  const [panelOpen, setPanelOpen] = useState(false)
  const { kind, status, task: tf, effort } = filters
  const set = (patch: Partial<Filters>) => setFilters({ ...filters, ...patch })
  const setTask = (patch: Partial<TaskFilter>) => set({ task: { ...tf, ...patch } })
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

  const matched = rows.filter(({ item }) => {
    const done = item.status === 'done'
    // Tekrarlı görevler bütün olarak "tamamlanmış" olmaz; yalnızca bekleyenlerde görünür.
    if (status === 'done' && (item.recurring || !done)) return false
    if (status === 'pending' && done) return false
    if (kind === 'longTerm' && !item.task.longTerm) return false
    if (kind === 'undated' && item.date !== null) return false
    if (kind !== 'all' && kind !== 'longTerm' && kind !== 'undated' && (item.date === null || kindOf(item.task) !== kind)) {
      return false
    }
    return matchesTask(item.task, tf)
  })
  const { shown, unspecified } = applyEffort(matched, (r) => r.item.task, effort)

  const activeCount =
    (status !== 'pending' ? 1 : 0) +
    [tf.categoryId, tf.priority, tf.kind, tf.from || tf.to].filter(Boolean).length +
    (effortActive(effort) ? 1 : 0)
  const anyFilter = activeCount > 0 || kind !== 'all' || tf.text.trim() !== ''

  return (
    <div className="page">
      <header className="page-head">
        <h1>Görevler</h1>
      </header>

      <div className="search-row">
        <input
          className="input"
          type="search"
          placeholder="Görev ara"
          aria-label="Görev adıyla ara"
          value={tf.text}
          onChange={(e) => setTask({ text: e.target.value })}
        />
        <button className="btn soft" aria-expanded={panelOpen} onClick={() => setPanelOpen((v) => !v)}>
          Filtreler{activeCount > 0 && ` (${activeCount})`}
        </button>
      </div>

      <Chips label="Görev türü" options={KINDS} value={kind} onChange={(v) => set({ kind: v })} />

      {panelOpen && (
        <section className="card panel stack">
          <div className="field">
            <span>Durum</span>
            <Chips
              label="Tamamlanma durumu"
              value={status}
              onChange={(v) => set({ status: v })}
              options={[
                { value: 'pending', label: 'Bekleyen' },
                { value: 'done', label: 'Tamamlanan' },
                { value: 'all', label: 'Hepsi' },
              ]}
            />
          </div>
          <label className="field">
            <span>Kategori</span>
            <select
              className="input"
              value={tf.categoryId ?? ''}
              onChange={(e) => setTask({ categoryId: e.target.value || null })}
            >
              <option value="">Hepsi</option>
              {data.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
              <option value="none">Kategorisiz</option>
            </select>
          </label>
          <div className="field">
            <span>Öncelik</span>
            <Chips
              label="Öncelik"
              value={tf.priority ?? 'any'}
              onChange={(v) => setTask({ priority: v === 'any' ? null : (v as Priority) })}
              options={[
                ...(['high', 'normal', 'low'] as Priority[]).map((p) => ({ value: p as string, label: PRIORITY[p] })),
                { value: 'any', label: 'Hepsi' },
              ]}
            />
          </div>
          <div className="field">
            <span>Tekrar</span>
            <Chips
              label="Tekrarlanan veya tek seferlik"
              value={tf.kind ?? 'any'}
              onChange={(v) => setTask({ kind: v === 'any' ? null : (v as 'recurring' | 'single') })}
              options={[
                { value: 'recurring', label: 'Tekrarlanan' },
                { value: 'single', label: 'Tek seferlik' },
                { value: 'any', label: 'Hepsi' },
              ]}
            />
          </div>
          <div className="field">
            <span>Tarih aralığı</span>
            <div className="inline-field">
              <input
                type="date"
                className="input"
                aria-label="Başlangıç tarihi"
                value={tf.from ?? ''}
                onChange={(e) => setTask({ from: e.target.value || null })}
              />
              –
              <input
                type="date"
                className="input"
                aria-label="Bitiş tarihi"
                value={tf.to ?? ''}
                onChange={(e) => setTask({ to: e.target.value || null })}
              />
            </div>
          </div>
          <EffortControls value={effort} onChange={(v) => set({ effort: v })} hiddenUnspecified={unspecified} />
        </section>
      )}

      {anyFilter && (
        <p className="sub filter-note">
          {shown.length} görev gösteriliyor.
          {unspecified > 0 && !panelOpen && ` Süresi ya da zorluğu belirtilmemiş ${unspecified} görev gizli.`}{' '}
          <button className="link" onClick={() => setFilters(NO_FILTERS)}>
            Filtreleri temizle
          </button>
        </p>
      )}

      {shown.length === 0 ? (
        <div className="empty">
          <p>{anyFilter ? 'Bu seçimlerle eşleşen bir görev yok 🌷' : 'Burada şimdilik bir şey yok 🌷'}</p>
        </div>
      ) : (
        <ul className="task-list">
          {shown.map(({ item, extra, hideCheck }) => (
            <li key={item.key}>
              <TaskRow item={item} extra={extra} hideCheck={hideCheck} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
