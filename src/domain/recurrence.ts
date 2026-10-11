import { addDays, dayOfMonth, daysInMonth, diffDays, isoWeekday, WEEKDAYS, WEEKDAYS_SHORT } from './dates'
import type { ISODate, Recurrence, Task } from './types'

/**
 * Tekrarlı görev bu takvim gününe denk geliyor mu? Günler yalnızca kuraldan
 * hesaplanır; bir tekrarın ne zaman tamamlandığı sonrakileri etkilemez.
 */
export function occursOn(task: Pick<Task, 'recurrence' | 'plannedDate'>, date: ISODate): boolean {
  const rule = task.recurrence
  const start = task.plannedDate
  if (!rule || !start || date < start) return false
  switch (rule.type) {
    case 'daily':
      return true
    case 'weekly':
      return rule.days.includes(isoWeekday(date))
    case 'monthly':
      return dayOfMonth(date) === Math.min(rule.day, daysInMonth(date))
    case 'interval':
      return diffDays(start, date) % (rule.every * (rule.unit === 'week' ? 7 : 1)) === 0
  }
}

/** `from` dahil, sonraki ilk tekrar günü. */
export function nextOnOrAfter(
  task: Pick<Task, 'recurrence' | 'plannedDate'>,
  from: ISODate,
  horizonDays = 800,
): ISODate | null {
  if (!task.recurrence || !task.plannedDate) return null
  let d = from < task.plannedDate ? task.plannedDate : from
  for (let i = 0; i <= horizonDays; i++, d = addDays(d, 1)) {
    if (occursOn(task, d)) return d
  }
  return null
}

export function describeRecurrence(rule: Recurrence): string {
  switch (rule.type) {
    case 'daily':
      return 'Her gün'
    case 'weekly': {
      const days = [...rule.days].sort((a, b) => a - b)
      if (days.length === 7) return 'Her gün'
      if (days.length === 1) return `Her ${WEEKDAYS[days[0] - 1]}`
      return `Her ${days.map((d) => WEEKDAYS_SHORT[d - 1]).join(', ')}`
    }
    case 'monthly':
      return `Her ayın ${rule.day}. günü`
    case 'interval':
      return `${rule.every} ${rule.unit === 'week' ? 'haftada' : 'günde'} bir`
  }
}
