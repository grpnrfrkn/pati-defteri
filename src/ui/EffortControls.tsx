import { useState } from 'react'
import type { EffortFilter } from '../domain/filter'
import type { Difficulty } from '../domain/types'
import { DIFFICULTY } from './labels'
import { Chips } from './Sheet'

const MINUTES = [
  { value: '5', label: '5 dk veya az' },
  { value: '15', label: '15 dk veya az' },
  { value: '30', label: '30 dk veya az' },
  { value: 'any', label: 'Süre fark etmez' },
]

const DIFFICULTIES = [
  ...(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => ({ value: d as string, label: DIFFICULTY[d] })),
  { value: 'any', label: 'Hepsi' },
]

/** Süre ve zorluk seçimi. Bilgisi girilmemiş görevlere ne olduğunu açıkça söyler. */
export function EffortControls({
  value,
  onChange,
  hiddenUnspecified,
}: {
  value: EffortFilter
  onChange: (value: EffortFilter) => void
  /** Süresi/zorluğu belirtilmediği için şu an gizlenen görev sayısı. */
  hiddenUnspecified: number
}) {
  return (
    <div className="stack">
      <div className="field">
        <span>Süre</span>
        <Chips
          label="Süre"
          options={MINUTES}
          value={value.maxMinutes ? String(value.maxMinutes) : 'any'}
          onChange={(v) => onChange({ ...value, maxMinutes: v === 'any' ? null : Number(v) })}
        />
      </div>
      <div className="field">
        <span>Zorluk</span>
        <Chips
          label="Zorluk"
          options={DIFFICULTIES}
          value={value.difficulty ?? 'any'}
          onChange={(v) => onChange({ ...value, difficulty: v === 'any' ? null : (v as Difficulty) })}
        />
      </div>
      {(hiddenUnspecified > 0 || value.includeUnspecified) && (
        <label className="check-field">
          <input
            type="checkbox"
            checked={value.includeUnspecified}
            onChange={(e) => onChange({ ...value, includeUnspecified: e.target.checked })}
          />
          <span>
            Süresi ya da zorluğu belirtilmemiş görevleri de göster
            {hiddenUnspecified > 0 && <small>Şu an {hiddenUnspecified} görev bu yüzden gizli.</small>}
          </span>
        </label>
      )}
    </div>
  )
}

/** Sekme değişse de korunan, tarayıcı oturumu boyunca saklanan durum. */
export function useSessionState<T>(key: string, initial: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = sessionStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })
  return [
    value,
    (next) => {
      setValue(next)
      try {
        sessionStorage.setItem(key, JSON.stringify(next))
      } catch {
        // Saklanamazsa yalnızca bu ekran için geçerli kalır.
      }
    },
  ]
}
