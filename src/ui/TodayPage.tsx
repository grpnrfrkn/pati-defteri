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
import type { Item, Section } from '../domain/types'
import { useApp } from './context'
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

function Overdue({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false)
  const [choosing, setChoosing] = useState<string | null>(null)
  if (items.length === 0) return null
  return (
    <section className="overdue">
      <button className="overdue-toggle" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span>Geçmişten kalan {items.length} görev</span>
        <span aria-hidden>{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <ul className="task-list">
          {items.map((item) => (
            <li key={item.key}>
              <TaskRow item={item} extra={item.date ? `${formatFrom(item.date)} kaldı` : undefined}>
                {choosing === item.key ? (
                  <MoveActions item={item} canLeave onDone={() => setChoosing(null)} />
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
  const { data, today } = useApp()
  const [collapsed, setCollapsed] = useState<Section[]>(loadCollapsed)

  const snap = { tasks: data.tasks, occs: data.occs }
  const items = itemsForDate(snap, today)
  const overdue = overdueItems(snap, today)
  const doneCount = items.filter((i) => i.status === 'done').length

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
        {items.length > 0 && (
          <p className="counter" aria-label={`${items.length} işten ${doneCount} tanesi tamamlandı`}>
            <strong>{doneCount}</strong> / {items.length} tamamlandı
          </p>
        )}
      </header>

      <PrioritySuggestion items={[...items, ...overdue]} />

      {items.length === 0 && (
        <div className="empty">
          <p>Bugün için planlanmış bir şey yok 🌷</p>
          <p className="sub">Sağ alttaki + ile minik bir adım ekleyebilirsin.</p>
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
    </div>
  )
}
