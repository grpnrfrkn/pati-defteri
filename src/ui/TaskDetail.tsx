import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { completeItem, deleteTask, toggleSubtask, uncompleteItem } from '../db/actions'
import { db } from '../db/db'
import { addDays, formatDay, formatLong, relativeDay } from '../domain/dates'
import { buildItem, occId } from '../domain/derive'
import { describeRecurrence, nextOnOrAfter } from '../domain/recurrence'
import { categoryName, subtasksOf, useApp } from './context'
import { describeEvent, DIFFICULTY, eventOccurrenceLabel, formatMinutes, formatTimestamp, PRIORITY } from './labels'
import { MoveActions } from './MoveActions'
import { Sheet } from './Sheet'

export function TaskDetail({
  taskId,
  originalDate,
  onClose,
}: {
  taskId: string
  originalDate: string
  onClose: () => void
}) {
  const { data, today, act, open } = useApp()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const events = useLiveQuery(() => db.events.where('taskId').equals(taskId).sortBy('at'), [taskId])

  const task = data.tasks.find((t) => t.id === taskId)
  if (!task) return null

  const item = buildItem(task, originalDate, data.occs.find((o) => o.id === occId(taskId, originalDate)))
  const subs = subtasksOf(data, taskId)
  const subsDone = subs.filter((s) => s.id in item.doneSubtasks).length
  const done = item.status === 'done'
  const allSubsDone = subs.length > 0 && subsDone === subs.length
  const category = categoryName(data, task.categoryId)
  const next = task.recurrence ? nextOnOrAfter(task, addDays(today, 1)) : null
  const lastDone = data.occs
    .filter((o) => o.taskId === taskId && o.status === 'done' && o.completedOn)
    .map((o) => o.completedOn!)
    .sort()
    .at(-1)

  const complete = (on = today) => act(() => completeItem(item, on), 'Tamamlandı 🐾')

  return (
    <Sheet title={task.title} onClose={onClose}>
      <div className="detail">
        <dl className="facts">
          <div>
            <dt>Planlanan</dt>
            <dd>{item.date ? `${relativeDay(item.date, today)} · ${formatLong(item.date)}` : 'Tarihsiz'}</dd>
          </div>
          {task.dueDate && (
            <div>
              <dt>Son teslim</dt>
              <dd>{formatLong(task.dueDate)}</dd>
            </div>
          )}
          {task.recurrence && (
            <div>
              <dt>Tekrar</dt>
              <dd>
                {describeRecurrence(task.recurrence)}
                {next && ` · sıradaki ${formatDay(next)}`}
              </dd>
            </div>
          )}
          <div>
            <dt>Öncelik</dt>
            <dd>{PRIORITY[task.priority]}</dd>
          </div>
          {category && (
            <div>
              <dt>Kategori</dt>
              <dd>{category}</dd>
            </div>
          )}
          {task.estimateMin && (
            <div>
              <dt>Tahmini süre</dt>
              <dd>{formatMinutes(task.estimateMin)}</dd>
            </div>
          )}
          {task.difficulty && (
            <div>
              <dt>Zorluk</dt>
              <dd>{DIFFICULTY[task.difficulty]}</dd>
            </div>
          )}
          {task.longTerm && (
            <div>
              <dt>Tür</dt>
              <dd>Uzun vadeli</dd>
            </div>
          )}
          {lastDone && (
            <div>
              <dt>Son tamamlanma</dt>
              <dd>{formatLong(lastDone)}</dd>
            </div>
          )}
        </dl>

        {task.note && <p className="note">{task.note}</p>}

        {subs.length > 0 && (
          <section>
            <h3>
              Alt görevler · {subsDone}/{subs.length} tamamlandı — %{Math.round((subsDone / subs.length) * 100)}
            </h3>
            <div className="progress-bar wide">
              <span style={{ width: `${(subsDone / subs.length) * 100}%` }} />
            </div>
            <ul className="sub-list">
              {subs.map((s) => {
                const on = s.id in item.doneSubtasks
                return (
                  <li key={s.id}>
                    <button
                      className={`sub${on ? ' done' : ''}`}
                      role="checkbox"
                      aria-checked={on}
                      onClick={() => act(() => toggleSubtask(item, s))}
                    >
                      <span className="check small">
                        <span>{on ? '✓' : ''}</span>
                      </span>
                      {s.title}
                    </button>
                  </li>
                )
              })}
            </ul>
            {allSubsDone && !done && (
              <div className="callout">
                <p>Hepsi bitti, görevi tamamlayalım mı? 🌷</p>
                <button className="btn primary" onClick={() => complete()}>
                  Tamamla
                </button>
              </div>
            )}
          </section>
        )}

        {done ? (
          <section className="stack">
            <p className="done-line">✓ Tamamlandı{item.completedOn && ` · ${formatLong(item.completedOn)}`}</p>
            <label className="field">
              <span>Aslında başka bir gün mü tamamladın?</span>
              <input
                type="date"
                className="input"
                max={today}
                value={item.completedOn ?? today}
                onChange={(e) => e.target.value && act(() => completeItem(item, e.target.value), 'Tarih güncellendi')}
              />
            </label>
            <button className="btn soft" onClick={() => act(() => uncompleteItem(item), 'Geri alındı')}>
              Tamamlamayı geri al
            </button>
          </section>
        ) : (
          <section className="stack">
            <button className="btn primary wide" onClick={() => complete()}>
              Tamamla
            </button>
            <h3>Planı değiştir</h3>
            <MoveActions item={item} onDone={onClose} />
          </section>
        )}

        <section className="row-actions">
          <button className="btn soft" onClick={() => open({ type: 'form', taskId })}>
            Düzenle
          </button>
          {confirmDelete ? (
            <>
              <span className="hint">
                {task.recurrence ? 'Tüm tekrarlarıyla birlikte silinsin mi?' : 'Silinsin mi?'}
              </span>
              <button
                className="btn soft"
                onClick={async () => {
                  if (await act(() => deleteTask(taskId), 'Görev silindi')) onClose()
                }}
              >
                Evet, sil
              </button>
              <button className="btn ghost" onClick={() => setConfirmDelete(false)}>
                Vazgeç
              </button>
            </>
          ) : (
            <button className="btn ghost" onClick={() => setConfirmDelete(true)}>
              Sil
            </button>
          )}
        </section>

        <section>
          <h3>Geçmiş</h3>
          <ul className="history">
            {(events ?? [])
              .slice()
              .reverse()
              .map((e) => (
                <li key={e.id}>
                  <span>
                    {describeEvent(e)}
                    {eventOccurrenceLabel(e) && <em> · {eventOccurrenceLabel(e)}</em>}
                  </span>
                  <time>{formatTimestamp(e.at)}</time>
                </li>
              ))}
          </ul>
        </section>
      </div>
    </Sheet>
  )
}
