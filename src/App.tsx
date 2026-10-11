import { useLiveQuery } from 'dexie-react-hooks'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { seedDefaults, type Undo } from './db/actions'
import { db } from './db/db'
import { addDays, nowHM, todayISO } from './domain/dates'
import { itemsForDate } from './domain/derive'
import type { ISODate } from './domain/types'
import { AppContext, type AppCtx, type AppData, type SheetState } from './ui/context'
import { DayReview } from './ui/DayReview'
import { MorePage } from './ui/MorePage'
import { Onboarding } from './ui/Onboarding'
import { QuickAdd } from './ui/QuickAdd'
import { Reminders } from './ui/Reminders'
import { TaskDetail } from './ui/TaskDetail'
import { TaskForm } from './ui/TaskForm'
import { TasksPage } from './ui/TasksPage'
import { TodayPage } from './ui/TodayPage'

type Tab = 'bugun' | 'gorevler' | 'kedim' | 'magaza' | 'diger'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'bugun', label: 'Bugün', icon: '☀' },
  { id: 'gorevler', label: 'Görevler', icon: '☰' },
  { id: 'kedim', label: 'Kedim', icon: '🐾' },
  { id: 'magaza', label: 'Mağaza', icon: '✿' },
  { id: 'diger', label: 'Diğer', icon: '⋯' },
]

const DEFAULT_DAY_END = '21:00'
/** "Daha sonra" denince Günü Toparla bu kadar süre kendiliğinden açılmaz. */
const REVIEW_SNOOZE_MS = 60 * 60_000

interface Toast {
  id: number
  message: string
  undo?: Undo
}

function useData(): AppData | undefined {
  return useLiveQuery(async () => {
    const [tasksAll, subtasks, occs, categories, metaRows] = await Promise.all([
      db.tasks.toArray(),
      db.subtasks.toArray(),
      db.occurrences.toArray(),
      db.categories.toArray(),
      db.meta.toArray(),
    ])
    const meta = new Map(metaRows.map((m) => [m.key, m.value]))
    return {
      tasksAll,
      tasks: tasksAll.filter((t) => !t.deletedAt),
      subtasks: subtasks.filter((s) => !s.deletedAt),
      occs,
      categories: categories.filter((c) => !c.deletedAt).sort((a, b) => a.order - b.order),
      onboarded: !!meta.get('onboarded'),
      dayEndTime: typeof meta.get('dayEndTime') === 'string' ? (meta.get('dayEndTime') as string) : DEFAULT_DAY_END,
      reviewedDays: new Set(
        metaRows.filter((m) => m.key.startsWith('review:') && m.value === 'done').map((m) => m.key.slice(7)),
      ),
    }
  }, [])
}

/** Günü ve saati izler: gün değişince Bugün ekranı, saat gelince hatırlatmalar güncellenir. */
function useClock() {
  const [clock, setClock] = useState(() => ({ today: todayISO(), now: nowHM() }))
  useEffect(() => {
    const check = () =>
      setClock((prev) => {
        const next = { today: todayISO(), now: nowHM() }
        return next.today === prev.today && next.now === prev.now ? prev : next
      })
    const timer = setInterval(check, 30_000)
    document.addEventListener('visibilitychange', check)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', check)
    }
  }, [])
  return clock
}

/**
 * Kendiliğinden sunulacak Günü Toparla günü: gün sonu saati geldiyse bugün,
 * dün kapatılmadıysa ve bekleyen iş kaldıysa dün.
 */
function dueReview(data: AppData, today: ISODate, now: string): ISODate | null {
  const snap = { tasks: data.tasks, occs: data.occs }
  if (now >= data.dayEndTime && !data.reviewedDays.has(today)) {
    return itemsForDate(snap, today).length > 0 ? today : null
  }
  const yesterday = addDays(today, -1)
  if (data.reviewedDays.has(yesterday)) return null
  // Dünden kalan iş yoksa sormaya gerek yok; ama o gün uygulama hiç kullanılmadıysa da sorma.
  const items = itemsForDate(snap, yesterday)
  const used = items.some((i) => i.task.createdAt < new Date(`${today}T00:00`).getTime())
  return used && items.some((i) => i.status === 'pending') ? yesterday : null
}

function ComingSoon({ title, text }: { title: string; text: string }) {
  return (
    <div className="page">
      <header className="page-head">
        <h1>{title}</h1>
      </header>
      <div className="empty">
        <p>{text}</p>
        <p className="sub">Bu bölüm yakında açılacak.</p>
      </div>
    </div>
  )
}

export function App() {
  const data = useData()
  const { today, now } = useClock()
  const [tab, setTab] = useState<Tab>('bugun')
  const [sheet, setSheet] = useState<SheetState>(null)
  const [toast, setToast] = useState<Toast | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const [reviewSnoozedUntil, setReviewSnoozedUntil] = useState(0)

  useEffect(() => {
    seedDefaults().catch(() => setToast({ id: Date.now(), message: 'Veriler bu cihazda açılamadı.' }))
    // Tarayıcıdan bu verileri kendiliğinden silmemesini iste.
    navigator.storage?.persist?.().catch(() => {})
  }, [])

  const notify = useCallback((message: string, undo?: Undo) => {
    clearTimeout(toastTimer.current)
    const id = Date.now()
    setToast({ id, message, undo })
    toastTimer.current = setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 5000)
  }, [])

  const act = useCallback<AppCtx['act']>(
    async (fn, message) => {
      try {
        const result = await fn()
        if (message) notify(message, typeof result === 'function' ? (result as Undo) : undefined)
        return true
      } catch (error) {
        console.error(error)
        notify(error instanceof Error && error.message.includes('yedeği') ? error.message : 'Kaydedilemedi. Tekrar dener misin?')
        return false
      }
    },
    [notify],
  )

  const ctx = useMemo<AppCtx | null>(
    () => (data ? { data, today, open: setSheet, act, notify } : null),
    [data, today, act, notify],
  )

  // Günü Toparla'yı kendiliğinden sun; başka bir pencere açıkken araya girme.
  const review = data?.onboarded ? dueReview(data, today, now) : null
  useEffect(() => {
    if (review && !sheet && Date.now() >= reviewSnoozedUntil) setSheet({ type: 'review', date: review })
  }, [review, sheet, reviewSnoozedUntil, now])

  if (!ctx) return null

  const closeSheet = () => setSheet(null)
  const closeReview = () => {
    setReviewSnoozedUntil(Date.now() + REVIEW_SNOOZE_MS)
    setSheet(null)
  }

  return (
    <AppContext.Provider value={ctx}>
      {!ctx.data.onboarded ? (
        <Onboarding />
      ) : (
        <div className="app">
          <nav className="nav" aria-label="Ana menü">
            <div className="brand">Pati Defteri</div>
            {TABS.map((t) => (
              <button
                key={t.id}
                className={tab === t.id ? 'on' : undefined}
                aria-current={tab === t.id ? 'page' : undefined}
                onClick={() => setTab(t.id)}
              >
                <span className="nav-icon" aria-hidden>
                  {t.icon}
                </span>
                {t.label}
              </button>
            ))}
          </nav>

          <main>
            <Reminders now={now} />
            {tab === 'bugun' && <TodayPage />}
            {tab === 'gorevler' && <TasksPage />}
            {tab === 'kedim' && <ComingSoon title="Kedim" text="Minik kedin yolda 🐾" />}
            {tab === 'magaza' && <ComingSoon title="Mağaza" text="Raflar diziliyor ✿" />}
            {tab === 'diger' && <MorePage />}
          </main>

          {(tab === 'bugun' || tab === 'gorevler') && (
            <button className="fab" aria-label="Görev ekle" onClick={() => setSheet({ type: 'quick' })}>
              +
            </button>
          )}
        </div>
      )}

      {sheet?.type === 'quick' && <QuickAdd onClose={closeSheet} />}
      {sheet?.type === 'form' && (
        <TaskForm key={sheet.taskId ?? 'new'} taskId={sheet.taskId} defaults={sheet.defaults} onClose={closeSheet} />
      )}
      {sheet?.type === 'detail' && (
        <TaskDetail taskId={sheet.taskId} originalDate={sheet.originalDate} onClose={closeSheet} />
      )}

      {sheet?.type === 'review' && <DayReview date={sheet.date} onLater={closeReview} onFinished={closeReview} />}

      {toast && (
        <div className="toast" role="status">
          <span>{toast.message}</span>
          {toast.undo && (
            <button
              onClick={() => {
                const undo = toast.undo!
                setToast(null)
                act(undo, 'Geri alındı')
              }}
            >
              Geri al
            </button>
          )}
        </div>
      )}
    </AppContext.Provider>
  )
}
