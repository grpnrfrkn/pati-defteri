import type { RoomState } from './types'

export type ShopCategory = 'accessory' | 'furniture' | 'wallpaper' | 'rug' | 'toy' | 'decor'
export type Zone = 'floor' | 'wall'
export type Slot = 'neck' | 'head' | 'face'

export interface ShopItem {
  id: string
  name: string
  category: ShopCategory
  /** Pati parası. 0 ise baştan kullanıcınındır. */
  price: number
  /** Bu seviyede mağazada açılır; açılması ücretsiz olduğu anlamına gelmez. */
  minLevel?: number
  /** Odaya yerleştirilen eşyalar: çıkartma olarak çizilen emoji, oda genişliğinin yüzdesi olarak boyut ve durduğu yer. */
  emoji?: string
  size?: number
  zone?: Zone
  /** Aksesuarlar: kedinin neresine takıldığı. */
  slot?: Slot
  /** Duvar kâğıdı ve halılar: CSS arka planı. */
  style?: string
}

export const CATEGORY_LABELS: Record<ShopCategory, string> = {
  accessory: 'Aksesuar',
  furniture: 'Mobilya',
  wallpaper: 'Duvar kâğıdı',
  rug: 'Halı',
  toy: 'Oyuncak',
  decor: 'Dekorasyon',
}

/**
 * Mağaza kataloğu. Denge: bir görev yaklaşık 5 pati kazandırır; küçük eşyalar
 * 3–6 görev, büyükler 10–20 görev, seviye kilitli özel eşyalar 25–30 görev eder.
 */
export const CATALOG: ShopItem[] = [
  { id: 'acc-bow', name: 'Kırmızı kurdele', category: 'accessory', price: 15, slot: 'neck' },
  { id: 'acc-collar', name: 'Çıngıraklı tasma', category: 'accessory', price: 20, slot: 'neck' },
  { id: 'acc-beanie', name: 'Minik bere', category: 'accessory', price: 30, slot: 'head' },
  { id: 'acc-flowers', name: 'Çiçek tacı', category: 'accessory', price: 35, minLevel: 3, slot: 'head' },
  { id: 'acc-glasses', name: 'Yuvarlak gözlük', category: 'accessory', price: 40, minLevel: 5, slot: 'face' },
  { id: 'acc-crown', name: 'Altın taç', category: 'accessory', price: 150, minLevel: 10, slot: 'head' },

  { id: 'fur-plant', name: 'Saksı bitkisi', category: 'furniture', price: 30, emoji: '🪴', size: 15, zone: 'floor' },
  { id: 'fur-chair', name: 'Sandalye', category: 'furniture', price: 40, emoji: '🪑', size: 17, zone: 'floor' },
  { id: 'fur-clock', name: 'Duvar saati', category: 'furniture', price: 45, emoji: '🕰️', size: 11, zone: 'wall' },
  { id: 'fur-window', name: 'Pencere', category: 'furniture', price: 70, minLevel: 3, emoji: '🪟', size: 20, zone: 'wall' },
  { id: 'fur-mirror', name: 'Ayna', category: 'furniture', price: 60, minLevel: 4, emoji: '🪞', size: 14, zone: 'wall' },
  { id: 'fur-sofa', name: 'Kanepe', category: 'furniture', price: 80, emoji: '🛋️', size: 26, zone: 'floor' },
  { id: 'fur-bed', name: 'Yatak', category: 'furniture', price: 90, minLevel: 5, emoji: '🛏️', size: 26, zone: 'floor' },

  { id: 'wall-pink', name: 'Pembe duvar', category: 'wallpaper', price: 0, style: '#fdeef3' },
  {
    id: 'wall-stripes',
    name: 'Lila çizgili',
    category: 'wallpaper',
    price: 30,
    style: 'repeating-linear-gradient(90deg, #efe8fb 0 6%, #e2d6f6 6% 12%)',
  },
  {
    id: 'wall-dots',
    name: 'Puantiyeli',
    category: 'wallpaper',
    price: 40,
    style: 'radial-gradient(#f4c9d6 22%, transparent 24%) 0 0 / 9% 12%, #fff6f8',
  },
  { id: 'wall-sky', name: 'Gökyüzü', category: 'wallpaper', price: 60, minLevel: 4, style: 'linear-gradient(#cfe8fb, #f3f9ff)' },
  {
    id: 'wall-night',
    name: 'Yıldızlı gece',
    category: 'wallpaper',
    price: 120,
    minLevel: 8,
    style: 'radial-gradient(#fffbe0 9%, transparent 11%) 0 0 / 11% 15%, linear-gradient(#3d3566, #6a5a9c)',
  },

  { id: 'rug-pink', name: 'Pembe halı', category: 'rug', price: 25, style: '#f4c9d6' },
  {
    id: 'rug-lilac',
    name: 'Halkalı lila halı',
    category: 'rug',
    price: 35,
    style: 'radial-gradient(closest-side, #d9c9f5 0 45%, #b8a1e3 46% 70%, #d9c9f5 71%)',
  },
  {
    id: 'rug-stripes',
    name: 'Çizgili kilim',
    category: 'rug',
    price: 50,
    minLevel: 3,
    style: 'repeating-linear-gradient(90deg, #f4c9d6 0 8%, #fff6f8 8% 16%)',
  },

  { id: 'toy-yarn', name: 'Yün yumağı', category: 'toy', price: 15, emoji: '🧶', size: 8, zone: 'floor' },
  { id: 'toy-ball', name: 'Top', category: 'toy', price: 20, emoji: '⚽', size: 7, zone: 'floor' },
  { id: 'toy-fish', name: 'Oyuncak balık', category: 'toy', price: 20, emoji: '🐟', size: 8, zone: 'floor' },
  { id: 'toy-mouse', name: 'Oyuncak fare', category: 'toy', price: 25, emoji: '🐭', size: 8, zone: 'floor' },
  { id: 'toy-bear', name: 'Ayıcık', category: 'toy', price: 35, emoji: '🧸', size: 11, zone: 'floor' },

  { id: 'dec-candle', name: 'Mum', category: 'decor', price: 20, emoji: '🕯️', size: 8, zone: 'floor' },
  { id: 'dec-flowers', name: 'Çiçek buketi', category: 'decor', price: 25, emoji: '💐', size: 11, zone: 'floor' },
  { id: 'dec-picture', name: 'Tablo', category: 'decor', price: 35, emoji: '🖼️', size: 14, zone: 'wall' },
  { id: 'dec-balloon', name: 'Balon', category: 'decor', price: 30, emoji: '🎈', size: 12, zone: 'wall' },
  { id: 'dec-star', name: 'Yıldız süsü', category: 'decor', price: 30, emoji: '⭐', size: 9, zone: 'wall' },
  { id: 'dec-rainbow', name: 'Gökkuşağı', category: 'decor', price: 100, minLevel: 6, emoji: '🌈', size: 22, zone: 'wall' },
]

const BY_ID = new Map(CATALOG.map((item) => [item.id, item]))
export const findItem = (id: string | null | undefined): ShopItem | undefined => (id ? BY_ID.get(id) : undefined)

export const purchaseId = (itemId: string) => `satin:${itemId}`

export const DEFAULT_ROOM: RoomState = { wallpaper: 'wall-pink', rug: null, wearing: {}, placed: [] }

/** Odanın yüksekliğine oranla zeminin başladığı yer. Oda sabit en-boy oranıyla çizilir. */
export const FLOOR_TOP = 0.68

const ZONES: Record<Zone, { minY: number; maxY: number }> = {
  floor: { minY: 0.76, maxY: 0.98 },
  wall: { minY: 0.2, maxY: 0.62 },
}

/**
 * Eşyanın konumunu (alt-orta noktası, odaya oranla 0–1) kendi bölgesinde tutar:
 * zemin eşyası zeminde, duvar eşyası duvarda kalır ve hiçbiri oda dışına taşmaz.
 */
export function clampPosition(zone: Zone, x: number, y: number): { x: number; y: number } {
  const { minY, maxY } = ZONES[zone]
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Number.isFinite(v) ? v : lo))
  return { x: clamp(x, 0.08, 0.92), y: clamp(y, minY, maxY) }
}

export const defaultPosition = (zone: Zone, index: number) =>
  clampPosition(zone, 0.18 + ((index * 0.17) % 0.68), zone === 'floor' ? 0.9 : 0.42)

/** Kayıtlı odayı güvenli hâle getirir: bilinmeyen ya da sahip olunmayan eşyalar çizilmez. */
export function normalizeRoom(raw: Partial<RoomState> | null | undefined, owns: (id: string) => boolean): RoomState {
  const ok = (id: string | null | undefined, category: ShopCategory) => {
    const item = findItem(id)
    return !!item && item.category === category && owns(item.id)
  }
  const wearing: RoomState['wearing'] = {}
  for (const slot of ['neck', 'head', 'face'] as Slot[]) {
    const id = raw?.wearing?.[slot]
    if (ok(id, 'accessory') && findItem(id)!.slot === slot) wearing[slot] = id!
  }
  return {
    wallpaper: ok(raw?.wallpaper, 'wallpaper') ? raw!.wallpaper! : DEFAULT_ROOM.wallpaper,
    rug: ok(raw?.rug, 'rug') ? raw!.rug! : null,
    wearing,
    placed: (raw?.placed ?? []).flatMap((p) => {
      const item = findItem(p.itemId)
      return item?.zone && owns(item.id) ? [{ itemId: item.id, ...clampPosition(item.zone, p.x, p.y) }] : []
    }),
  }
}
