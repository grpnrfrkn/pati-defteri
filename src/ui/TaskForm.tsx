import { useState, type FormEvent } from 'react'
import { createTask, updateTask, type SubtaskInput, type TaskInput } from '../db/actions'
import { addDays, dayOfMonth, isoWeekday, WEEKDAYS_SHORT } from '../domain/dates'
import type { Difficulty, Priority, Recurrence } from '../domain/types'
import { subtasksOf, useApp } from './context'
import { DIFFICULTY, PRIORITY } from './labels'
import { Chips, Sheet } from './Sheet'

type RecType = 'none' | Recurrence['type']

const ESTIMATES = [5, 10, 15, 30, 60]

export function TaskForm({
  taskId,
  defaults,
  onClose,
}: {
  taskId?: string
  defaults?: Partial<TaskInput>
  onClose: () => void
}) {
  const { data, today, act } = useApp()
  const existing = taskId ? data.tasks.find((t) => t.id === taskId) : undefined
  const init: Partial<TaskInput> = existing ?? defaults ?? {}
  const rule = init.recurrence ?? null

  const [title, setTitle] = useState(init.title ?? '')
  const [note, setNote] = useState(init.note ?? '')
  const [categoryId, setCategoryId] = useState(init.categoryId ?? '')
  const [planned, setPlanned] = useState(init.plannedDate ?? '')
  const [due, setDue] = useState(init.dueDate ?? '')
  const [longTerm, setLongTerm] = useState(init.longTerm ?? false)
  const [priority, setPriority] = useState<Priority>(init.priority ?? 'normal')
  const [estimate, setEstimate] = useState<number | null>(init.estimateMin ?? null)
  const [customEstimate, setCustomEstimate] = useState(
    init.estimateMin != null && !ESTIMATES.includes(init.estimateMin),
  )
  const [difficulty, setDifficulty] = useState<Difficulty | null>(init.difficulty ?? null)
  const [recType, setRecType] = useState<RecType>(rule?.type ?? 'none')
  const [days, setDays] = useState<number[]>(rule?.type === 'weekly' ? rule.days : [isoWeekday(planned || today)])
  const [monthDay, setMonthDay] = useState(rule?.type === 'monthly' ? rule.day : dayOfMonth(planned || today))
  const [every, setEvery] = useState(rule?.type === 'interval' ? rule.every : 2)
  const [unit, setUnit] = useState<'day' | 'week'>(rule?.type === 'interval' ? rule.unit : 'day')
  const [subs, setSubs] = useState<SubtaskInput[]>(() =>
    taskId ? subtasksOf(data, taskId).map((s) => ({ id: s.id, title: s.title })) : [],
  )
  const [newSub, setNewSub] = useState('')
  const [reminderOn, setReminderOn] = useState(init.reminderEnabled ?? false)
  const [reminderTime, setReminderTime] = useState(init.reminderTime ?? '09:00')

  const recurring = recType !== 'none'
  const valid = title.trim() !== '' && !(recType === 'weekly' && days.length === 0)

  const buildRecurrence = (): Recurrence | null => {
    switch (recType) {
      case 'none':
        return null
      case 'daily':
        return { type: 'daily' }
      case 'weekly':
        return { type: 'weekly', days: [...days].sort((a, b) => a - b) }
      case 'monthly':
        return { type: 'monthly', day: Math.min(31, Math.max(1, monthDay || 1)) }
      case 'interval':
        return { type: 'interval', every: Math.max(1, every || 1), unit }
    }
  }

  const addSub = () => {
    if (!newSub.trim()) return
    setSubs((list) => [...list, { title: newSub.trim() }])
    setNewSub('')
  }

  const save = async (e: FormEvent) => {
    e.preventDefault()
    if (!valid) return
    const input: TaskInput = {
      title,
      note,
      categoryId: categoryId || null,
      // Tekrarlı görevin bir başlangıç günü olmalı; boşsa bugünden başlar.
      plannedDate: planned || (recurring ? today : null),
      dueDate: due || null,
      recurrence: buildRecurrence(),
      longTerm,
      priority,
      estimateMin: estimate,
      difficulty,
      reminderEnabled: reminderOn,
      reminderTime: reminderOn ? reminderTime : null,
    }
    const allSubs = newSub.trim() ? [...subs, { title: newSub.trim() }] : subs
    const ok = await act(
      () => (existing ? updateTask(existing.id, input, allSubs) : createTask(input, allSubs)),
      existing ? 'Kaydedildi' : 'Eklendi 🌷',
    )
    if (ok) onClose()
  }

  return (
    <Sheet title={existing ? 'Görevi düzenle' : 'Yeni görev'} onClose={onClose}>
      <form onSubmit={save} className="form">
        <input
          className="input big"
          autoFocus={!existing}
          placeholder="Ne yapılacak?"
          aria-label="Görev adı"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="field">
          <span>Açıklama veya not</span>
          <textarea className="input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
        </label>

        <label className="field">
          <span>Kategori</span>
          <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Kategorisiz</option>
            {data.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <div className="field">
          <span>{recurring ? 'Başlangıç günü' : 'Planlanan tarih'}</span>
          <div className="chips">
            <button type="button" className={`chip${planned === today ? ' on' : ''}`} onClick={() => setPlanned(today)}>
              Bugün
            </button>
            <button
              type="button"
              className={`chip${planned === addDays(today, 1) ? ' on' : ''}`}
              onClick={() => setPlanned(addDays(today, 1))}
            >
              Yarın
            </button>
            {!recurring && (
              <button type="button" className={`chip${planned === '' ? ' on' : ''}`} onClick={() => setPlanned('')}>
                Tarihsiz
              </button>
            )}
            <input
              type="date"
              className="input inline"
              aria-label="Tarih seç"
              value={planned}
              onChange={(e) => setPlanned(e.target.value)}
            />
          </div>
        </div>

        <label className="field">
          <span>Son teslim tarihi (varsa)</span>
          <input type="date" className="input" value={due} onChange={(e) => setDue(e.target.value)} />
        </label>

        <div className="field">
          <span>Tekrar</span>
          <select className="input" value={recType} onChange={(e) => setRecType(e.target.value as RecType)}>
            <option value="none">Tekrar etmez</option>
            <option value="daily">Her gün</option>
            <option value="weekly">Her hafta, seçili günlerde</option>
            <option value="monthly">Her ay belirli günde</option>
            <option value="interval">Özel aralık</option>
          </select>
          {recType === 'weekly' && (
            <div className="chips" role="group" aria-label="Haftanın günleri">
              {WEEKDAYS_SHORT.map((name, i) => {
                const d = i + 1
                const on = days.includes(d)
                return (
                  <button
                    key={d}
                    type="button"
                    className={`chip${on ? ' on' : ''}`}
                    aria-pressed={on}
                    onClick={() => setDays((list) => (on ? list.filter((x) => x !== d) : [...list, d]))}
                  >
                    {name}
                  </button>
                )
              })}
            </div>
          )}
          {recType === 'weekly' && days.length === 0 && <p className="hint">En az bir gün seç.</p>}
          {recType === 'monthly' && (
            <label className="inline-field">
              Ayın
              <input
                type="number"
                className="input small"
                min={1}
                max={31}
                value={monthDay}
                onChange={(e) => setMonthDay(Number(e.target.value))}
              />
              . günü
            </label>
          )}
          {recType === 'interval' && (
            <label className="inline-field">
              <input
                type="number"
                className="input small"
                min={1}
                value={every}
                onChange={(e) => setEvery(Number(e.target.value))}
                aria-label="Aralık"
              />
              <select className="input small" value={unit} onChange={(e) => setUnit(e.target.value as 'day' | 'week')}>
                <option value="day">günde bir</option>
                <option value="week">haftada bir</option>
              </select>
            </label>
          )}
        </div>

        <div className="field">
          <span>Öncelik</span>
          <Chips
            label="Öncelik"
            value={priority}
            onChange={setPriority}
            options={(['low', 'normal', 'high'] as Priority[]).map((p) => ({ value: p, label: PRIORITY[p] }))}
          />
        </div>

        <div className="field">
          <span>Tahmini süre</span>
          <div className="chips">
            {ESTIMATES.map((m) => {
              const on = !customEstimate && estimate === m
              return (
                <button
                  key={m}
                  type="button"
                  className={`chip${on ? ' on' : ''}`}
                  aria-pressed={on}
                  onClick={() => {
                    setCustomEstimate(false)
                    setEstimate(on ? null : m)
                  }}
                >
                  {m} dk
                </button>
              )
            })}
            <button
              type="button"
              className={`chip${customEstimate ? ' on' : ''}`}
              aria-pressed={customEstimate}
              onClick={() => {
                setCustomEstimate((v) => !v)
                setEstimate(null)
              }}
            >
              Özel
            </button>
            {customEstimate && (
              <label className="inline-field">
                <input
                  type="number"
                  className="input small"
                  min={1}
                  value={estimate ?? ''}
                  onChange={(e) => setEstimate(e.target.value ? Math.max(1, Number(e.target.value)) : null)}
                  aria-label="Süre (dakika)"
                />
                dk
              </label>
            )}
          </div>
        </div>

        <div className="field">
          <span>Zorluk</span>
          <div className="chips">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
              <button
                key={d}
                type="button"
                className={`chip${difficulty === d ? ' on' : ''}`}
                aria-pressed={difficulty === d}
                onClick={() => setDifficulty(difficulty === d ? null : d)}
              >
                {DIFFICULTY[d]}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span>Alt görevler</span>
          {subs.map((s, i) => (
            <div className="sub-edit" key={s.id ?? `new-${i}`}>
              <input
                className="input"
                value={s.title}
                aria-label={`Alt görev ${i + 1}`}
                onChange={(e) => setSubs((list) => list.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))}
              />
              <button
                type="button"
                className="icon-btn"
                aria-label="Alt görevi kaldır"
                onClick={() => setSubs((list) => list.filter((_, j) => j !== i))}
              >
                ✕
              </button>
            </div>
          ))}
          <div className="sub-edit">
            <input
              className="input"
              placeholder="Küçük bir adım ekle"
              aria-label="Yeni alt görev"
              value={newSub}
              onChange={(e) => setNewSub(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addSub()
                }
              }}
            />
            <button type="button" className="btn soft" onClick={addSub}>
              Ekle
            </button>
          </div>
        </div>

        <div className="field">
          <label className="check-field">
            <input
              type="checkbox"
              checked={reminderOn}
              onChange={(e) => {
                setReminderOn(e.target.checked)
                // İzin, ilk hatırlatma açıldığında istenir.
                if (e.target.checked && 'Notification' in window && Notification.permission === 'default') {
                  Notification.requestPermission().catch(() => {})
                }
              }}
            />
            Hatırlat
          </label>
          {reminderOn && (
            <>
              <input
                type="time"
                className="input"
                aria-label="Hatırlatma saati"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
              />
              <p className="hint">Hatırlatmalar şimdilik yalnızca uygulama açıkken gösterilir.</p>
            </>
          )}
        </div>

        <label className="check-field">
          <input type="checkbox" checked={longTerm} onChange={(e) => setLongTerm(e.target.checked)} />
          Uzun vadeli görev
        </label>

        <div className="form-actions">
          <button type="button" className="btn ghost" onClick={onClose}>
            Vazgeç
          </button>
          <button type="submit" className="btn primary" disabled={!valid}>
            Kaydet
          </button>
        </div>
      </form>
    </Sheet>
  )
}
