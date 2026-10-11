import type { Difficulty, Task } from './types'

/**
 * Ödül dengesi tek yerden ayarlanır. XP kedinin büyümesini, pati parası mağazayı besler;
 * ikisi de yalnızca görevlerden kazanılır.
 */
export const REWARDS = {
  /** Süre girilmemiş görevin XP'si. */
  baseXp: 10,
  /** [en fazla dakika, XP] */
  xpByMinutes: [
    [5, 6],
    [10, 8],
    [15, 10],
    [30, 15],
    [60, 22],
  ] as [number, number][],
  xpOverAnHour: 30,
  /** Zorluk belirtilmemişse çarpan 1'dir. */
  difficulty: { easy: 1, medium: 1.3, hard: 1.6 } as Record<Difficulty, number>,
  patiPerXp: 0.5,
  minPati: 3,
  subtask: { xp: 3, pati: 1 },
}

export interface Reward {
  xp: number
  pati: number
}

/** Bir görevin tamamlanma ödülü: tahmini süre ve zorluğa göre, her zaman sıfırdan büyük. */
export function rewardFor(task: Pick<Task, 'estimateMin' | 'difficulty'>): Reward {
  const min = task.estimateMin
  const base =
    min == null ? REWARDS.baseXp : (REWARDS.xpByMinutes.find(([limit]) => min <= limit)?.[1] ?? REWARDS.xpOverAnHour)
  const xp = Math.round(base * (task.difficulty ? REWARDS.difficulty[task.difficulty] : 1))
  return { xp, pati: Math.max(REWARDS.minPati, Math.round(xp * REWARDS.patiPerXp)) }
}

export type Stage = 'kitten' | 'young' | 'adult'

export const STAGES: { id: Stage; label: string; fromLevel: number }[] = [
  { id: 'kitten', label: 'Yavru', fromLevel: 1 },
  { id: 'young', label: 'Genç', fromLevel: 5 },
  { id: 'adult', label: 'Yetişkin', fromLevel: 10 },
]

/** Bu seviyeye ulaşmak için gereken toplam XP: 0, 40, 120, 240, 400 … */
export const xpToReach = (level: number): number => 20 * level * (level - 1)

export interface Progress {
  level: number
  stage: Stage
  stageLabel: string
  /** Bu seviyede biriken ve bir sonraki seviye için gereken XP. */
  intoLevel: number
  needed: number
}

/** Büyüme geçen güne değil, yalnızca toplam XP'ye bağlıdır. */
export function progressFor(xp: number): Progress {
  let level = 1
  while (xp >= xpToReach(level + 1)) level++
  const stage = [...STAGES].reverse().find((s) => level >= s.fromLevel)!
  return {
    level,
    stage: stage.id,
    stageLabel: stage.label,
    intoLevel: xp - xpToReach(level),
    needed: xpToReach(level + 1) - xpToReach(level),
  }
}
