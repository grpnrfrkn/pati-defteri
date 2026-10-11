import { NOTLAR } from '../data/notlar'

/** Sevgi notlarının çıktığı yerler; bkz. docs/SEVGI-NOTLARI.md. */
export type NoteContext = 'acilis' | 'gorev-tamamlandi' | 'buyuk-kutlama' | 'gun-sonu' | 'genel' | 'cicek'

// scripts/notlar.mjs içindeki anahtarla aynı olmalı.
const KEY = 'pati-defteri-minik-notlar'
/** Bir bağlamda en son gösterilen bu kadar not yeniden seçilmez. */
const AVOID_RECENT = 3

export const FLOWERS = ['🌷', '🌹', '🌻', '🌸', '💐', '🌼', '🪻']

let library: Record<string, string[]> | null = null

function notes(): Record<string, string[]> {
  if (library) return library
  try {
    const bytes = Uint8Array.from(atob(NOTLAR), (c) => c.charCodeAt(0)).map((b, i) => b ^ KEY.charCodeAt(i % KEY.length))
    library = JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    library = {}
  }
  return library!
}

const pick = <T>(list: T[]): T => list[Math.floor(Math.random() * list.length)]

/** Bağlama uygun rastgele bir not; yakın zamanda gösterilenleri tekrar etmez. */
export function pickNote(context: NoteContext): string | null {
  const own = notes()[context] ?? []
  const general = notes().genel ?? []
  // Bağlama özel notlar azdır; sık tekrar etmesinler diye yarı yarıya genel notlardan seçilir.
  const list = own.length > 0 && (general.length === 0 || Math.random() < 0.5) ? own : general
  if (list.length === 0) return null
  const storageKey = `pati.not.son.${context}`
  let recent: string[] = []
  try {
    recent = JSON.parse(localStorage.getItem(storageKey) ?? '[]')
  } catch {
    // Kayıt okunamazsa yalnızca tekrar önleme çalışmaz.
  }
  const fresh = list.filter((text) => !recent.includes(text))
  const text = pick(fresh.length > 0 ? fresh : list)
  try {
    localStorage.setItem(storageKey, JSON.stringify([...recent, text].slice(-AVOID_RECENT)))
  } catch {
    // yoksay
  }
  return text
}

/** Notlar her seferinde değil, ara sıra çıkar; yoksa etkisi kaybolur. */
export const maybeNote = (context: NoteContext, chance: number): string | null =>
  Math.random() < chance ? pickNote(context) : null

/** Günün açılış notu: gün içinde aynı kalır. */
export function openingNote(today: string): string | null {
  const storageKey = 'pati.not.acilis'
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? 'null')
    if (saved?.day === today) return saved.text
    const text = pickNote('acilis')
    localStorage.setItem(storageKey, JSON.stringify({ day: today, text }))
    return text
  } catch {
    return pickNote('acilis')
  }
}

const FLOWER_GAP_MS = 2 * 86_400_000
const FLOWER_CHANCE = 0.25

/** Çiçekler rastgele zamanlarda gelir: en az iki gün arayla ve her fırsatta değil. */
export function shouldGiveFlower(lastFlowerAt: number | undefined): boolean {
  if (lastFlowerAt && Date.now() - lastFlowerAt < FLOWER_GAP_MS) return false
  return Math.random() < FLOWER_CHANCE
}

export const pickFlower = () => pick(FLOWERS)
