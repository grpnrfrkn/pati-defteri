import { addFlower, completeItem } from '../db/actions'
import { rewardFor } from '../domain/rewards'
import type { ISODate, Item } from '../domain/types'
import type { AppCtx } from './context'
import { maybeNote, pickFlower, pickNote, shouldGiveFlower } from './love'

/** Büyük iş: alt görevleri olan, uzun vadeli ya da bir saat ve üzeri süren görev. */
const isBig = (item: Item, subtaskCount: number) =>
  subtaskCount > 0 || item.task.longTerm || (item.task.estimateMin ?? 0) >= 60

/** Ara sıra, sebepsiz bir çiçek. */
export async function maybeGiveFlower(ctx: AppCtx): Promise<boolean> {
  if (!shouldGiveFlower(ctx.data.flowers.at(-1)?.at)) return false
  const note = pickNote('cicek')
  if (!note) return false
  const kind = pickFlower()
  await addFlower(kind, note)
  ctx.celebrate({ emoji: kind, title: 'Sana bir çiçek var', note })
  return true
}

/** Görevi tamamlar ve tamamlamaya eşlik eden küçük ya da büyük kutlamayı gösterir. */
export async function completeAndCheer(ctx: AppCtx, item: Item, subtaskCount: number, on: ISODate = ctx.today) {
  const reward = rewardFor(item.task)
  const big = isBig(item, subtaskCount)
  const note = big ? null : maybeNote('gorev-tamamlandi', 0.25)
  const ok = await ctx.act(() => completeItem(item, on), `Tamamlandı 🐾  +${reward.xp} XP · +${reward.pati} pati`, note)
  if (!ok) return false
  // Aynı anda tek bir sürpriz: büyük kutlama, not ya da çiçek.
  if (big) ctx.celebrate({ emoji: '🎉', title: 'Büyük bir iş bitti!', note: pickNote('buyuk-kutlama') })
  else if (!note) await maybeGiveFlower(ctx).catch(() => false)
  return true
}
