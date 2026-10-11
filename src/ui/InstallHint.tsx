import { useState } from 'react'

const KEY = 'pati.kurulum.ipucu'

/** iPhone/iPad'de Safari sekmesinde mi açık (ana ekrana eklenmemiş)? */
function inIosBrowserTab(): boolean {
  const ios =
    /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const standalone =
    (navigator as { standalone?: boolean }).standalone === true || matchMedia('(display-mode: standalone)').matches
  return ios && !standalone
}

/**
 * iPhone'da ana ekrana eklenen uygulamanın verisi Safari sekmesindekinden ayrıdır ve
 * Safari, kullanılmayan sitelerin verisini silebilir. Bu yüzden baştan ana ekrandan
 * kullanılması önerilir.
 */
export function InstallHint({ dismissable = true }: { dismissable?: boolean }) {
  const [hidden, setHidden] = useState(() => !inIosBrowserTab() || (dismissable && localStorage.getItem(KEY) === '1'))
  if (hidden) return null
  return (
    <aside className="callout">
      <p>
        <strong>Önce ana ekranına ekle 🌷</strong>
      </p>
      <p>
        Safari’de alttaki Paylaş düğmesine, sonra “Ana Ekrana Ekle”ye dokun ve defteri oradaki simgeden aç. Uygulama
        gibi açılır ve yazdıkların güvende kalır. Safari sekmesinde eklediklerin ana ekrandaki deftere taşınmaz.
      </p>
      {dismissable && (
        <div className="row-actions">
          <button
            className="btn ghost"
            onClick={() => {
              localStorage.setItem(KEY, '1')
              setHidden(true)
            }}
          >
            Tamam
          </button>
        </div>
      )}
    </aside>
  )
}
