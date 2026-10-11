import { useLiveQuery } from 'dexie-react-hooks'
import { useRef, useState } from 'react'
import { addCategory, deleteCategory, exportBackup, importBackup, renameCategory, setMeta } from '../db/actions'
import { db } from '../db/db'
import type { Category } from '../domain/types'
import { CalendarView } from './CalendarView'
import { useApp } from './context'
import { describeEvent, eventOccurrenceLabel, formatTimestamp } from './labels'

type View = 'menu' | 'calendar' | 'history' | 'categories' | 'settings' | 'backup'

function History() {
  const { data } = useApp()
  const events = useLiveQuery(() => db.events.orderBy('at').reverse().limit(300).toArray(), [])
  const titles = new Map(data.tasksAll.map((t) => [t.id, t.title]))
  if (events && events.length === 0) {
    return (
      <div className="empty">
        <p>Henüz bir kayıt yok 🌷</p>
      </div>
    )
  }
  return (
    <ul className="history card">
      {(events ?? []).map((e) => (
        <li key={e.id}>
          <span>
            <strong>{titles.get(e.taskId) ?? 'Görev'}</strong>
            <br />
            {describeEvent(e)}
            {eventOccurrenceLabel(e) && <em> · {eventOccurrenceLabel(e)}</em>}
          </span>
          <time>{formatTimestamp(e.at)}</time>
        </li>
      ))}
    </ul>
  )
}

function CategoryRow({ category }: { category: Category }) {
  const { data, act } = useApp()
  const [name, setName] = useState(category.name)
  const [deleting, setDeleting] = useState(false)
  const [moveTo, setMoveTo] = useState('')
  const taskCount = data.tasks.filter((t) => t.categoryId === category.id).length

  const rename = () => {
    if (name.trim() && name.trim() !== category.name) act(() => renameCategory(category.id, name), 'Kaydedildi')
    else setName(category.name)
  }

  return (
    <li className="category">
      <div className="sub-edit">
        <input
          className="input"
          value={name}
          aria-label="Kategori adı"
          onChange={(e) => setName(e.target.value)}
          onBlur={rename}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        />
        <button className="btn ghost" onClick={() => setDeleting((v) => !v)}>
          Sil
        </button>
      </div>
      {deleting && (
        <div className="callout">
          {taskCount > 0 ? (
            <label className="field">
              <span>Bu kategorideki {taskCount} görev silinmez. Nereye geçsin?</span>
              <select className="input" value={moveTo} onChange={(e) => setMoveTo(e.target.value)}>
                <option value="">Kategorisiz kalsın</option>
                {data.categories
                  .filter((c) => c.id !== category.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </label>
          ) : (
            <p>Bu kategoride görev yok.</p>
          )}
          <div className="row-actions">
            <button
              className="btn primary"
              onClick={() => act(() => deleteCategory(category.id, moveTo || null), 'Kategori silindi')}
            >
              Kategoriyi sil
            </button>
            <button className="btn ghost" onClick={() => setDeleting(false)}>
              Vazgeç
            </button>
          </div>
        </div>
      )}
    </li>
  )
}

function Categories() {
  const { data, act } = useApp()
  const [name, setName] = useState('')
  const add = async () => {
    if (name.trim() && (await act(() => addCategory(name), 'Kategori eklendi'))) setName('')
  }
  return (
    <div className="stack">
      <ul className="plain-list">
        {data.categories.map((c) => (
          <CategoryRow key={c.id} category={c} />
        ))}
      </ul>
      <div className="sub-edit">
        <input
          className="input"
          placeholder="Yeni kategori"
          aria-label="Yeni kategori adı"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <button className="btn soft" onClick={add}>
          Ekle
        </button>
      </div>
    </div>
  )
}

function Backup() {
  const { act, today } = useApp()
  const fileInput = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<string | null>(null)

  const download = () =>
    act(async () => {
      const url = URL.createObjectURL(new Blob([await exportBackup()], { type: 'application/json' }))
      const link = document.createElement('a')
      link.href = url
      link.download = `pati-defteri-yedek-${today}.json`
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 10_000)
    }, 'Yedek dosyası hazırlandı')

  return (
    <div className="stack">
      <p>
        Görevlerin yalnızca bu cihazda saklanıyor. Ara sıra yedek alırsan, telefon değişse ya da uygulama silinse bile
        geri yükleyebilirsin.
      </p>
      <button className="btn primary" onClick={download}>
        Yedek al
      </button>
      <button className="btn soft" onClick={() => fileInput.current?.click()}>
        Yedekten yükle
      </button>
      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={async (e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) setPending(await file.text())
        }}
      />
      {pending && (
        <div className="callout">
          <p>Yedek yüklenince bu cihazdaki şu anki veriler yedektekilerle değiştirilir. Devam edelim mi?</p>
          <div className="row-actions">
            <button
              className="btn primary"
              onClick={async () => {
                await act(() => importBackup(pending), 'Yedek yüklendi')
                setPending(null)
              }}
            >
              Evet, yükle
            </button>
            <button className="btn ghost" onClick={() => setPending(null)}>
              Vazgeç
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Settings() {
  const { data, act } = useApp()
  return (
    <div className="stack">
      <label className="field">
        <span>Gün sonu saati</span>
        <input
          type="time"
          className="input"
          value={data.dayEndTime}
          onChange={(e) => e.target.value && act(() => setMeta('dayEndTime', e.target.value), 'Kaydedildi')}
        />
      </label>
      <p className="hint">
        Bu saatte uygulama açıksa Günü Toparla kendiliğinden gelir. Kapalıysa bir sonraki açılışta sunulur; istediğin
        zaman “Daha sonra” diyebilirsin.
      </p>
    </div>
  )
}

const TITLES: Record<View, string> = {
  menu: 'Diğer',
  calendar: 'Takvim',
  settings: 'Ayarlar',
  history: 'Görev geçmişi',
  categories: 'Kategoriler',
  backup: 'Yedekleme',
}

export function MorePage() {
  const { today, open } = useApp()
  const [view, setView] = useState<View>('menu')
  return (
    <div className="page">
      <header className="page-head">
        <h1>{TITLES[view]}</h1>
        {view !== 'menu' && (
          <button className="btn ghost" onClick={() => setView('menu')}>
            ‹ Geri
          </button>
        )}
      </header>
      {view === 'menu' && (
        <ul className="menu card">
          <li>
            <button onClick={() => setView('calendar')}>Takvim</button>
          </li>
          <li>
            <button onClick={() => open({ type: 'review', date: today })}>Günü Toparla</button>
          </li>
          <li>
            <button onClick={() => setView('history')}>Görev geçmişi</button>
          </li>
          <li>
            <button onClick={() => setView('categories')}>Kategoriler</button>
          </li>
          <li>
            <button onClick={() => setView('backup')}>Yedekleme</button>
          </li>
          <li>
            <button onClick={() => setView('settings')}>Ayarlar</button>
          </li>
        </ul>
      )}
      {view === 'calendar' && <CalendarView />}
      {view === 'settings' && <Settings />}
      {view === 'history' && <History />}
      {view === 'categories' && <Categories />}
      {view === 'backup' && <Backup />}
    </div>
  )
}
