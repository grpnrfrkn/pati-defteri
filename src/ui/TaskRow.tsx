import type { ReactNode } from 'react'
import { completeItem, uncompleteItem } from '../db/actions'
import { formatDay } from '../domain/dates'
import { describeRecurrence } from '../domain/recurrence'
import type { Item } from '../domain/types'
import { categoryName, subtasksOf, useApp } from './context'
import { formatMinutes, PRIORITY } from './labels'

interface Props {
  item: Item
  /** Sürükleme tutamacı (yalnızca sıralanabilir listelerde). */
  handle?: ReactNode
  /** Görev adının altında gösterilecek ek bilgi, ör. "8 Ekim’den kaldı". */
  extra?: string
  hideCheck?: boolean
  children?: ReactNode
}

export function TaskRow({ item, handle, extra, hideCheck, children }: Props) {
  const { data, today, act, open } = useApp()
  const { task } = item
  const done = item.status === 'done'
  const subs = subtasksOf(data, task.id)
  const subsDone = subs.filter((s) => s.id in item.doneSubtasks).length
  const category = categoryName(data, task.categoryId)

  const toggle = () =>
    act(() => (done ? uncompleteItem(item) : completeItem(item, today)), done ? 'Geri alındı' : 'Tamamlandı 🐾')

  return (
    <div className={`task${done ? ' done' : ''}`}>
      <div className="task-main">
        {!hideCheck && (
          <button
            className="check"
            role="checkbox"
            aria-checked={done}
            aria-label={done ? `${task.title}: tamamlandı, geri al` : `${task.title}: tamamla`}
            onClick={toggle}
          >
            <span>{done ? '✓' : ''}</span>
          </button>
        )}
        <button
          className="task-body"
          onClick={() => open({ type: 'detail', taskId: task.id, originalDate: item.originalDate })}
        >
          <span className="task-title">{task.title}</span>
          {extra && <span className="task-extra">{extra}</span>}
          <span className="task-meta">
            {task.priority !== 'normal' && (
              <span className={`tag prio-${task.priority}`}>
                {task.priority === 'high' ? '▲' : '▽'} {PRIORITY[task.priority]}
              </span>
            )}
            {category && <span className="tag">{category}</span>}
            {task.recurrence && <span className="tag">↻ {describeRecurrence(task.recurrence)}</span>}
            {task.estimateMin && <span className="tag">◷ {formatMinutes(task.estimateMin)}</span>}
            {task.dueDate && <span className="tag">Son tarih: {formatDay(task.dueDate)}</span>}
          </span>
          {subs.length > 0 && (
            <span className="progress" aria-label={`${subsDone}/${subs.length} alt görev tamamlandı`}>
              <span className="progress-bar">
                <span style={{ width: `${(subsDone / subs.length) * 100}%` }} />
              </span>
              <span className="progress-text">
                {subsDone}/{subs.length}
              </span>
            </span>
          )}
        </button>
        {handle}
      </div>
      {children}
    </div>
  )
}
