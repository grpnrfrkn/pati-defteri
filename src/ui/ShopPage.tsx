import { useState } from 'react'
import { buyItem } from '../db/actions'
import { progressFor } from '../domain/rewards'
import { CATALOG, CATEGORY_LABELS, type ShopCategory, type ShopItem } from '../domain/shop'
import { CatSvg } from './CatSvg'
import { useApp } from './context'
import { Chips } from './Sheet'

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ShopCategory[]
const PREVIEW_CAT = { name: '', fur: 'cream', eyes: 'green', pattern: 'plain' }

export function ItemArt({ item }: { item: ShopItem }) {
  const { data } = useApp()
  if (item.slot) {
    return (
      <div className="item-art">
        <CatSvg cat={data.cat ?? PREVIEW_CAT} stage="adult" wearing={{ [item.slot]: item.id }} />
      </div>
    )
  }
  if (item.emoji) {
    return (
      <div className="item-art">
        <span className="sticker" aria-hidden>
          {item.emoji}
        </span>
      </div>
    )
  }
  return (
    <div className="item-art">
      <span className={item.category === 'rug' ? 'swatch-rug' : 'swatch-wall'} style={{ background: item.style }} />
    </div>
  )
}

export function ShopPage() {
  const { data, act } = useApp()
  const [category, setCategory] = useState<ShopCategory>('accessory')
  const level = progressFor(data.xp).level
  const balance = Math.max(0, data.pati)

  return (
    <div className="page">
      <header className="page-head">
        <h1>Mağaza</h1>
        <p className="counter" aria-label={`${balance} pati parası`}>
          🐾 <strong>{balance}</strong> pati
        </p>
      </header>

      <Chips
        label="Kategori"
        value={category}
        onChange={setCategory}
        options={CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }))}
      />

      <ul className="shop-grid">
        {CATALOG.filter((item) => item.category === category).map((item) => {
          const owned = item.price === 0 || data.owned.has(item.id)
          const locked = !!item.minLevel && level < item.minLevel
          const missing = item.price - balance
          return (
            <li key={item.id} className="card shop-item">
              <ItemArt item={item} />
              <strong>{item.name}</strong>
              {owned ? (
                <span className="tag">✓ Sende var</span>
              ) : (
                <>
                  <span className="price">🐾 {item.price} pati</span>
                  {locked ? (
                    <span className="hint">🔒 Seviye {item.minLevel} olunca açılır</span>
                  ) : missing > 0 ? (
                    <span className="hint">{missing} pati daha</span>
                  ) : (
                    <button
                      className="btn primary"
                      onClick={() =>
                        act(
                          () => buyItem(item.id),
                          `${item.name} artık senin 🐾`,
                          'Kedim sayfasında “Odayı düzenle” ile kullanabilirsin.',
                        )
                      }
                    >
                      Satın al
                    </button>
                  )}
                </>
              )}
            </li>
          )
        })}
      </ul>
      <p className="hint">Aldığın her şey kalıcıdır; istediğin zaman takıp çıkarabilir, odada yerini değiştirebilirsin.</p>
    </div>
  )
}
