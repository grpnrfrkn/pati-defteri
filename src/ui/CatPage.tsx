import { useEffect, useRef, useState } from 'react'
import { saveCat } from '../db/actions'
import { progressFor, REWARDS, STAGES, type Stage } from '../domain/rewards'
import type { Cat } from '../domain/types'
import { CatSvg, EYES, FURS, PATTERNS, type CatAction } from './CatSvg'
import { useApp } from './context'
import { formatTimestamp } from './labels'
import { maybeNote } from './love'
import { meow, purr, setSoundEnabled, soundEnabled } from './sound'

const NEW_CAT: Cat = { name: '', fur: 'cream', eyes: 'green', pattern: 'plain', createdAt: 0 }

function Swatches({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { id: string; label: string; color?: string }[]
  value: string
  onChange: (id: string) => void
}) {
  return (
    <div className="field">
      <span>{label}</span>
      <div className="chips" role="group" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            className={`chip${o.id === value ? ' on' : ''}`}
            aria-pressed={o.id === value}
            onClick={() => onChange(o.id)}
          >
            {o.color && <span className="swatch" style={{ background: o.color }} />}
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function CatEditor({ initial, stage, onDone }: { initial: Cat; stage: Stage; onDone: () => void }) {
  const { act } = useApp()
  const [cat, setCat] = useState(initial)
  const isNew = !initial.createdAt
  const save = async () => {
    const ok = await act(
      () => saveCat({ ...cat, name: cat.name.trim(), createdAt: initial.createdAt || Date.now() }),
      isNew ? `${cat.name.trim()} artık seninle 🐾` : 'Kaydedildi',
    )
    if (ok) {
      if (isNew) meow()
      onDone()
    }
  }
  return (
    <div className="stack">
      <div className="cat-scene">
        <CatSvg cat={cat} stage={stage} />
      </div>
      <label className="field">
        <span>Adı</span>
        <input
          className="input big"
          placeholder="Kedinin adı"
          value={cat.name}
          maxLength={24}
          onChange={(e) => setCat((c) => ({ ...c, name: e.target.value }))}
        />
      </label>
      <Swatches
        label="Tüy rengi"
        value={cat.fur}
        onChange={(fur) => setCat((c) => ({ ...c, fur }))}
        options={Object.entries(FURS).map(([id, f]) => ({ id, label: f.label, color: f.base }))}
      />
      <Swatches
        label="Göz rengi"
        value={cat.eyes}
        onChange={(eyes) => setCat((c) => ({ ...c, eyes }))}
        options={Object.entries(EYES).map(([id, e]) => ({ id, label: e.label, color: e.color }))}
      />
      <Swatches
        label="Tüy deseni"
        value={cat.pattern}
        onChange={(pattern) => setCat((c) => ({ ...c, pattern }))}
        options={Object.entries(PATTERNS).map(([id, label]) => ({ id, label }))}
      />
      <div className="form-actions">
        <button className="btn ghost" onClick={onDone}>
          Vazgeç
        </button>
        <button className="btn primary" disabled={!cat.name.trim()} onClick={save}>
          {isNew ? 'Sahiplen' : 'Kaydet'}
        </button>
      </div>
    </div>
  )
}

/** Büyüdükçe açılan hareketler. Hiçbiri pati parası kazandırmaz ve hiçbiri zorunlu değildir. */
const ACTIONS: { id: CatAction; label: string; from: Stage; ms: number }[] = [
  { id: 'pet', label: 'Sev', from: 'kitten', ms: 2200 },
  { id: 'eat', label: 'Besle', from: 'kitten', ms: 2600 },
  { id: 'play', label: 'Oyna', from: 'kitten', ms: 2200 },
  { id: 'sleep', label: 'Uyut', from: 'kitten', ms: 0 },
  { id: 'stretch', label: 'Gerin', from: 'young', ms: 1800 },
  { id: 'roll', label: 'Yuvarlan', from: 'adult', ms: 1400 },
]

const stageIndex = (stage: Stage) => STAGES.findIndex((s) => s.id === stage)

export function CatPage() {
  const { data } = useApp()
  const [editing, setEditing] = useState(false)
  const [action, setAction] = useState<CatAction>('idle')
  const [sound, setSound] = useState(soundEnabled)
  const [note] = useState(() => maybeNote('genel', 0.35))
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const progress = progressFor(data.xp)
  const { cat } = data

  if (!cat || editing) {
    return (
      <div className="page">
        <header className="page-head">
          <h1>Kedim</h1>
        </header>
        {!cat && !editing ? (
          <div className="card panel stack">
            <div className="cat-scene">
              <CatSvg cat={NEW_CAT} stage="kitten" />
            </div>
            <p>
              Hazır olduğunda minik bir kedi seni bekliyor. Görev tamamladıkça büyüyecek; ona bakmak zorunda değilsin,
              canın istediğinde sevmen yeter.
            </p>
            {data.xp > 0 && <p className="sub">Şimdiye kadar biriktirdiğin {data.xp} XP onun olacak.</p>}
            <button className="btn primary" onClick={() => setEditing(true)}>
              Kedimi oluştur
            </button>
          </div>
        ) : (
          <CatEditor initial={cat ?? NEW_CAT} stage={progress.stage} onDone={() => setEditing(false)} />
        )}
      </div>
    )
  }

  const run = (next: (typeof ACTIONS)[number]) => {
    clearTimeout(timer.current)
    setAction(next.id)
    if (next.id === 'pet' || next.id === 'sleep') purr()
    else meow()
    if (next.ms) timer.current = setTimeout(() => setAction('idle'), next.ms)
  }

  const nextStage = STAGES[stageIndex(progress.stage) + 1]

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>{cat.name}</h1>
          <p className="sub">
            {progress.stageLabel} · Seviye {progress.level}
          </p>
        </div>
        <p className="counter" aria-label={`${data.pati} pati parası`}>
          🐾 <strong>{Math.max(0, data.pati)}</strong> pati
        </p>
      </header>

      <button className="cat-scene tappable" aria-label={`${cat.name} adlı kediyi sev`} onClick={() => run(ACTIONS[0])}>
        <CatSvg cat={cat} stage={progress.stage} action={action} />
      </button>

      <div className="chips" role="group" aria-label="Kediyle etkileşim">
        {ACTIONS.map((a) => {
          const locked = stageIndex(progress.stage) < stageIndex(a.from)
          return (
            <button key={a.id} className={`chip${action === a.id ? ' on' : ''}`} disabled={locked} onClick={() => run(a)}>
              {a.label}
              {locked && ` · ${STAGES[stageIndex(a.from)].label} olunca`}
            </button>
          )
        })}
      </div>

      <section className="card panel stack">
        <div className="progress" aria-label={`Seviye ${progress.level}: ${progress.intoLevel}/${progress.needed} XP`}>
          <span className="progress-bar wide">
            <span style={{ width: `${(progress.intoLevel / progress.needed) * 100}%` }} />
          </span>
          <span className="progress-text">
            {progress.intoLevel}/{progress.needed} XP
          </span>
        </div>
        <p className="sub">
          Toplam {data.xp} XP.
          {nextStage && ` ${cat.name}, seviye ${nextStage.fromLevel} olunca ${nextStage.label.toLocaleLowerCase('tr')} bir kedi olacak.`}
        </p>
        <details>
          <summary>Ödüller nasıl hesaplanıyor?</summary>
          <p className="sub">
            Her tamamlanan görev XP ve pati kazandırır: süre girilmemiş bir görev {REWARDS.baseXp} XP, 5 dakikalık bir
            görev {REWARDS.xpByMinutes[0][1]} XP, bir saatlik bir görev {REWARDS.xpByMinutes[4][1]} XP. Orta zorluk
            XP’yi {REWARDS.difficulty.medium} ile, zor {REWARDS.difficulty.hard} ile çarpar. Pati, XP’nin yarısı kadardır
            (en az {REWARDS.minPati}). Her alt görev ayrıca {REWARDS.subtask.xp} XP ve {REWARDS.subtask.pati} pati verir.
            Atlamak ya da ertelemek hiçbir şey eksiltmez.
          </p>
        </details>
      </section>

      {note && <p className="love-note">💌 {note}</p>}

      {data.flowers.length > 0 && (
        <section className="stack">
          <h2>Çiçeklerim · {data.flowers.length}</h2>
          <ul className="flowers">
            {[...data.flowers].reverse().map((f) => (
              <li key={f.id} className="card">
                <span className="flower" aria-hidden>
                  {f.kind}
                </span>
                <span>
                  {f.note}
                  <small>{formatTimestamp(f.at)}</small>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="row-actions">
        <button className="btn ghost" onClick={() => setEditing(true)}>
          Görünümünü düzenle
        </button>
        <button
          className="btn ghost"
          aria-pressed={sound}
          onClick={() => {
            setSoundEnabled(!sound)
            setSound(!sound)
          }}
        >
          Ses: {sound ? 'açık' : 'kapalı'}
        </button>
      </div>
    </div>
  )
}
