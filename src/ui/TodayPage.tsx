import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'
import { dismissSuggestion, reorderTasks, setPriority } from '../db/actions'
import { addDays, formatDay, formatFrom, formatLong } from '../domain/dates'
import { itemsForDate, overdueItems, sectionOf } from '../domain/derive'
import { applyEffort, effortActive, NO_EFFORT, type EffortFilter } from '../domain/filter'
import type { Item, Priority, Section } from '../domain/types'
import { useApp } from './context'
import { EffortControls, useSessionState } from './EffortControls'
import { PRIORITY } from './labels'
import { MoveActions } from './MoveActions'
import { TaskRow } from './TaskRow'

const SECTIONS: { id: Section; title: string }[] = [
  { id: 'priority', title: 'Öncelikli işler' },
  { id: 'routine', title: 'Rutinler' },
  { id: 'other', title: 'Diğer işler' },
]

const COLLAPSED_KEY = 'pati.bugun.kapali'

function loadCollapsed(): Section[] {
  try {
    return JSON.parse(localStorage.getItem(COLLAPSED_KEY) ?? '[]')
  } catch {
    return []
  }
}

function SortableRow({ item }: { item: Item }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: item.key,
  })
  return (
    <li
      ref={setNodeRef}
      className={isDragging ? 'dragging' : undefined}
      style={{ transform: CSS.Translate.toString(transform), transition }}
    >
      <TaskRow
        item={item}
        handle={
          <button
            ref={setActivatorNodeRef}
            className="handle"
            aria-label={`${item.task.title}: sırasını değiştir`}
            {...attributes}
            {...listeners}
          >
            ⋮⋮
          </button>
        }
      />
    </li>
  )
}

function SectionList({ items }: { items: Item[] }) {
  const { act } = useApp()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const from = items.findIndex((i) => i.key === active.id)
    const to = items.findIndex((i) => i.key === over.id)
    if (from < 0 || to < 0) return
    act(() => reorderTasks(arrayMove(items, from, to).map((i) => i.task.id)))
  }
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((i) => i.key)} strategy={verticalListSortingStrategy}>
        <ul className="task-list">
          {items.map((item) => (
            <SortableRow key={item.key} item={item} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}

function Overdue({ items: all }: { items: Item[] }) {
  const { data, today } = useApp()
  const [open, setOpen] = useState(false)
  const [choosing, setChoosing] = useState<string | null>(null)
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState('')
  const [age, setAge] = useState('')
  if (all.length === 0) return null
  const weekAgo = addDays(today, -7)
  const items = all.filter(
    (i) =>
      (!category || (category === 'none' ? !i.task.categoryId : i.task.categoryId === category)) &&
      (!priority || i.task.priority === priority) &&
      (!age || !i.date || (age === 'week' ? i.date >= weekAgo : i.date < weekAgo)),
  )
  return (
    <section className="overdue">
      <button className="overdue-toggle" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span>Geçmişten kalan {all.length} görev</span>
        <span aria-hidden>{open ? '▴' : '▾'}</span>
      </button>
      {open && all.length > 4 && (
        <div className="inline-filters">
          <select className="input" aria-label="Tarihe göre" value={age} onChange={(e) => setAge(e.target.value)}>
            <option value="">Tüm tarihler</option>
            <option value="week">Son 7 gün</option>
            <option value="older">Daha eski</option>
          </select>
          <select className="input" aria-label="Kategoriye göre" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Tüm kategoriler</option>
            {data.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
            <option value="none">Kategorisiz</option>
          </select>
          <select className="input" aria-label="Önceliğe göre" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="">Tüm öncelikler</option>
            {(['high', 'normal', 'low'] as Priority[]).map((p) => (
              <option key={p} value={p}>
                {PRIORITY[p]}
              </option>
            ))}
          </select>
        </div>
      )}
      {open && items.length === 0 && <p className="sub">Bu seçimlerle eşleşen bir görev yok.</p>}
      {open && (
        <ul className="task-list">
          {items.map((item) => (
            <li key={item.key}>
              <TaskRow item={item} extra={item.date ? `${formatFrom(item.date)} kaldı` : undefined}>
                {choosing === item.key ? (
                  <MoveActions item={item} leaveLabel="Olduğu gibi bırak" onDone={() => setChoosing(null)} />
                ) : (
                  <button className="btn ghost row-more" onClick={() => setChoosing(item.key)}>
                    Ne yapalım?
                  </button>
                )}
              </TaskRow>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** Son teslim tarihi yaklaşan bir görev için öncelik önerisi. Onaysız hiçbir şey değişmez. */
function PrioritySuggestion({ items }: { items: Item[] }) {
  const { today, act } = useApp()
  const tomorrow = addDays(today, 1)
  const task = items
    .filter((i) => i.status === 'pending')
    .map((i) => i.task)
    .find((t) => t.dueDate && t.dueDate <= tomorrow && t.priority !== 'high' && !t.suggestionDismissed)
  if (!task?.dueDate) return null
  const when = task.dueDate === tomorrow ? 'yarın' : task.dueDate === today ? 'bugün' : formatDay(task.dueDate)
  return (
    <aside className="callout">
      <p>
        “{task.title}” görevinin son teslim tarihi {when}. Önceliğini yükseltmek ister misin?
      </p>
      <div className="row-actions">
        <button className="btn primary" onClick={() => act(() => setPriority(task.id, 'high'), 'Öncelik yükseltildi')}>
          Yüksek yap
        </button>
        <button className="btn ghost" onClick={() => act(() => dismissSuggestion(task.id))}>
          Böyle kalsın
        </button>
      </div>
    </aside>
  )
}

export function TodayPage() {
  const { data, today, open } = useApp()
  const [collapsed, setCollapsed] = useState<Section[]>(loadCollapsed)
  const [effort, setEffort] = useSessionState<EffortFilter>('pati.bugun.enerji', NO_EFFORT)
  const [energyOpen, setEnergyOpen] = useState(false)

  const snap = { tasks: data.tasks, occs: data.occs }
  const allItems = itemsForDate(snap, today)
  const overdue = overdueItems(snap, today)
  const doneCount = allItems.filter((i) => i.status === 'done').length
  // Enerji filtresi yalnızca görünümü daraltır; hiçbir görev silinmez ya da değişmez.
  const { shown: items, unspecified } = applyEffort(allItems, (i) => i.task, effort)
  const filtering = effortActive(effort)
  const hiddenCount = allItems.length - items.length

  const toggle = (id: Section) => {
    const next = collapsed.includes(id) ? collapsed.filter((s) => s !== id) : [...collapsed, id]
    setCollapsed(next)
    localStorage.setItem(COLLAPSED_KEY, JSON.stringify(next))
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>Bugün</h1>
          <p className="sub">{formatLong(today)}</p>
        </div>
        {allItems.length > 0 && (
          <p className="counter" aria-label={`${allItems.length} işten ${doneCount} tanesi tamamlandı`}>
            <strong>{doneCount}</strong> / {allItems.length} tamamlandı
          </p>
        )}
      </header>

      {allItems.length > 0 && (
        <div className="row-actions">
          <button
            className={`chip${filtering ? ' on' : ''}`}
            aria-expanded={energyOpen}
            onClick={() => setEnergyOpen((v) => !v)}
          >
            Enerjime göre göster
          </button>
          {filtering && (
            <button className="link" onClick={() => setEffort(NO_EFFORT)}>
              Hepsini göster
            </button>
          )}
        </div>
      )}
      {energyOpen && (
        <section className="card panel">
          <EffortControls value={effort} onChange={setEffort} hiddenUnspecified={unspecified} />
        </section>
      )}
      {filtering && hiddenCount > 0 && (
        <p className="sub filter-note">
          Seçimine uymayan {hiddenCount} görev şimdilik gizli
          {unspecified > 0 && ` (${unspecified} tanesinin süresi ya da zorluğu belirtilmemiş)`}. Hepsi yerinde duruyor.
        </p>
      )}

      <PrioritySuggestion items={[...allItems, ...overdue]} />

      {allItems.length === 0 && (
        <div className="empty">
          <p>Bugün için planlanmış bir şey yok 🌷</p>
          <p className="sub">Sağ alttaki + ile minik bir adım ekleyebilirsin.</p>
        </div>
      )}
      {allItems.length > 0 && items.length === 0 && (
        <div className="empty">
          <p>Bu seçimlere uyan bir görev yok 🌷</p>
        </div>
      )}

      {SECTIONS.map(({ id, title }) => {
        const list = items.filter((i) => sectionOf(i) === id)
        if (list.length === 0) return null
        const isOpen = !collapsed.includes(id)
        return (
          <section key={id} className="section">
            <button className="section-head" aria-expanded={isOpen} onClick={() => toggle(id)}>
              <h2>{title}</h2>
              <span className="count">
                {list.filter((i) => i.status === 'done').length}/{list.length}
              </span>
              <span aria-hidden>{isOpen ? '▴' : '▾'}</span>
            </button>
            {isOpen && <SectionList items={list} />}
          </section>
        )
      })}

      <Overdue items={overdue} />

      <button className="btn ghost review-link" onClick={() => open({ type: 'review', date: today })}>
        Günü toparla 🌙
      </button>
    </div>
  )
}
