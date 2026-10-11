import type { ISODate } from './types'

const DAY = 86_400_000
const pad = (n: number) => String(n).padStart(2, '0')

export const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
]
const MONTHS_FROM = [
  'Ocak’tan', 'Şubat’tan', 'Mart’tan', 'Nisan’dan', 'Mayıs’tan', 'Haziran’dan',
  'Temmuz’dan', 'Ağustos’tan', 'Eylül’den', 'Ekim’den', 'Kasım’dan', 'Aralık’tan',
]
export const WEEKDAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']
export const WEEKDAYS_SHORT = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

export function todayISO(now = new Date()): ISODate {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

// Gün hesapları UTC üzerinden yapılır; yaz saati geçişleri günü kaydırmasın.
function toUTC(d: ISODate): number {
  const [y, m, day] = d.split('-').map(Number)
  return Date.UTC(y, m - 1, day)
}
function fromUTC(ms: number): ISODate {
  const d = new Date(ms)
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
}

export const addDays = (d: ISODate, n: number): ISODate => fromUTC(toUTC(d) + n * DAY)
export const diffDays = (from: ISODate, to: ISODate): number => Math.round((toUTC(to) - toUTC(from)) / DAY)
/** 1 = Pazartesi … 7 = Pazar */
export const isoWeekday = (d: ISODate): number => new Date(toUTC(d)).getUTCDay() || 7
export const dayOfMonth = (d: ISODate): number => Number(d.slice(8, 10))
export const monthOf = (d: ISODate): number => Number(d.slice(5, 7))
export function daysInMonth(d: ISODate): number {
  const [y, m] = d.split('-').map(Number)
  return new Date(Date.UTC(y, m, 0)).getUTCDate()
}

/** "8 Ekim" */
export const formatDay = (d: ISODate): string => `${dayOfMonth(d)} ${MONTHS[monthOf(d) - 1]}`
/** "8 Ekim Perşembe" */
export const formatLong = (d: ISODate): string => `${formatDay(d)} ${WEEKDAYS[isoWeekday(d) - 1]}`
/** "8 Ekim’den" */
export const formatFrom = (d: ISODate): string => `${dayOfMonth(d)} ${MONTHS_FROM[monthOf(d) - 1]}`

export function relativeDay(d: ISODate, today: ISODate): string {
  const diff = diffDays(today, d)
  if (diff === 0) return 'Bugün'
  if (diff === 1) return 'Yarın'
  if (diff === -1) return 'Dün'
  return formatDay(d)
}
