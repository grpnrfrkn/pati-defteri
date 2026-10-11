import { useState, type FormEvent } from 'react'
import { createTask } from '../db/actions'
import { addDays } from '../domain/dates'
import { useApp } from './context'
import { Chips, Sheet } from './Sheet'

type When = 'today' | 'tomorrow' | 'none'

export function QuickAdd({ onClose }: { onClose: () => void }) {
  const { today, act, open } = useApp()
  const [title, setTitle] = useState('')
  const [when, setWhen] = useState<When>('today')

  const plannedDate = when === 'today' ? today : when === 'tomorrow' ? addDays(today, 1) : null

  const save = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    if (await act(() => createTask({ title, plannedDate }), 'Eklendi 🌷')) onClose()
  }

  return (
    <Sheet title="Yeni görev" onClose={onClose}>
      <form onSubmit={save} className="form">
        <input
          className="input big"
          autoFocus
          placeholder="Ne yapılacak?"
          aria-label="Görev adı"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          enterKeyHint="done"
        />
        <Chips
          label="Zaman"
          value={when}
          onChange={setWhen}
          options={[
            { value: 'today', label: 'Bugün' },
            { value: 'tomorrow', label: 'Yarın' },
            { value: 'none', label: 'Tarihsiz' },
          ]}
        />
        <div className="form-actions">
          <button
            type="button"
            className="btn ghost"
            onClick={() => open({ type: 'form', defaults: { title, plannedDate } })}
          >
            Ayrıntı ekle
          </button>
          <button type="submit" className="btn primary" disabled={!title.trim()}>
            Kaydet
          </button>
        </div>
      </form>
    </Sheet>
  )
}
