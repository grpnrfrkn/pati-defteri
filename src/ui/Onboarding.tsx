import { useState } from 'react'
import { createTask, setMeta, type TaskInput } from '../db/actions'
import { describeRecurrence } from '../domain/recurrence'
import { useApp } from './context'
import { InstallHint } from './InstallHint'
import { formatMinutes } from './labels'

interface Sample extends TaskInput {
  category: string
}

const SAMPLES: Sample[] = [
  { category: 'Ev', title: 'Çamaşırları makineye at', estimateMin: 5 },
  { category: 'Ev', title: 'Nevresimleri değiştir', estimateMin: 15, recurrence: { type: 'weekly', days: [7] } },
  { category: 'Kişisel bakım', title: 'Cilt bakımı', estimateMin: 10, recurrence: { type: 'daily' } },
  { category: 'Kişisel bakım', title: 'Bir bardak su iç', estimateMin: 5 },
  { category: 'Kediler', title: 'Mama ve su kaplarını tazele', estimateMin: 5, recurrence: { type: 'daily' } },
  { category: 'Kediler', title: 'Kum kabını temizle', estimateMin: 10, recurrence: { type: 'daily' } },
  { category: 'Hobiler', title: '10 sayfa kitap oku', estimateMin: 15 },
]

/** İlk açılış: örnek görevler yalnızca seçilirse eklenir, tamamen atlanabilir. */
export function Onboarding() {
  const { data, today, act } = useApp()
  const [picked, setPicked] = useState<number[]>([])

  const finish = (indexes: number[]) =>
    act(async () => {
      for (const i of indexes) {
        const { category, ...input } = SAMPLES[i]
        await createTask({
          ...input,
          plannedDate: today,
          categoryId: data.categories.find((c) => c.name === category)?.id ?? null,
        })
      }
      await setMeta('onboarded', true)
    })

  return (
    <div className="onboarding">
      <div className="card onboarding-card">
        <h1>Hoş geldin 🌷</h1>
        <p>
          Burası senin defterin. İşlerini küçük adımlara bölüp bugüne, yarına ya da “bir ara”ya yazabilirsin. Yapamadığın
          bir şey olursa sorun değil; başka bir güne almak tek dokunuş.
        </p>
        <InstallHint dismissable={false} />
        <h2>İstersen birkaç örnekle başla</h2>
        <p className="sub">Seçtiklerin bugüne eklenir; sonra hepsini değiştirebilir ya da silebilirsin.</p>
        <ul className="plain-list">
          {SAMPLES.map((s, i) => (
            <li key={s.title}>
              <label className="check-field">
                <input
                  type="checkbox"
                  checked={picked.includes(i)}
                  onChange={(e) => setPicked((list) => (e.target.checked ? [...list, i] : list.filter((x) => x !== i)))}
                />
                <span>
                  {s.title}
                  <small>
                    {s.category}
                    {s.recurrence && ` · ${describeRecurrence(s.recurrence)}`}
                    {s.estimateMin && ` · ${formatMinutes(s.estimateMin)}`}
                  </small>
                </span>
              </label>
            </li>
          ))}
        </ul>
        <div className="form-actions">
          <button className="btn ghost" onClick={() => finish([])}>
            Boş başla
          </button>
          <button className="btn primary" disabled={picked.length === 0} onClick={() => finish(picked)}>
            Seçtiklerimi ekle
          </button>
        </div>
      </div>
    </div>
  )
}
