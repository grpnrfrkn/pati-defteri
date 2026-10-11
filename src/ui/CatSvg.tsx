import type { Stage } from '../domain/rewards'
import type { Cat } from '../domain/types'

export const FURS: Record<string, { label: string; base: string; dark: string }> = {
  cream: { label: 'Krem', base: '#f3dfc1', dark: '#d2ae7e' },
  orange: { label: 'Turuncu', base: '#f2b279', dark: '#cf8442' },
  gray: { label: 'Gri', base: '#bcbbcc', dark: '#8d8ca3' },
  black: { label: 'Siyah', base: '#5a5269', dark: '#3b354a' },
  white: { label: 'Beyaz', base: '#fbf8f3', dark: '#d9d0c4' },
  brown: { label: 'Kahve', base: '#b98866', dark: '#8a5d40' },
}

export const EYES: Record<string, { label: string; color: string }> = {
  green: { label: 'Yeşil', color: '#7fb685' },
  blue: { label: 'Mavi', color: '#79b4d9' },
  amber: { label: 'Kehribar', color: '#e0a84a' },
  hazel: { label: 'Ela', color: '#a98458' },
}

export const PATTERNS: Record<string, string> = {
  plain: 'Düz',
  tabby: 'Tekir',
  spots: 'Benekli',
  tuxedo: 'Smokin',
}

export type CatAction = 'idle' | 'pet' | 'eat' | 'play' | 'sleep' | 'stretch' | 'roll'

/** Büyüdükçe gövde uzar, baş gövdeye göre küçülür; renkler ve desen aynı kalır. */
const SHAPE: Record<Stage, { all: number; head: number; headDy: number }> = {
  kitten: { all: 0.76, head: 1.16, headDy: 10 },
  young: { all: 0.9, head: 1.05, headDy: 4 },
  adult: { all: 1, head: 1, headDy: 0 },
}

const INK = '#2b2536'
const WHITE = '#fffdfb'
const PINK = '#f0a9b8'

export function CatSvg({
  cat,
  stage,
  action = 'idle',
}: {
  cat: Pick<Cat, 'fur' | 'eyes' | 'pattern' | 'name'>
  stage: Stage
  action?: CatAction
}) {
  const fur = FURS[cat.fur] ?? FURS.cream
  const eye = (EYES[cat.eyes] ?? EYES.green).color
  const shape = SHAPE[stage]
  const tuxedo = cat.pattern === 'tuxedo'
  const outline = { stroke: fur.dark, strokeWidth: 2 }
  const eyesClosed = action === 'pet' || action === 'sleep'

  return (
    <svg viewBox="0 0 200 210" className={`cat cat-${action}`} role="img" aria-label={cat.name ? `${cat.name} adlı kedi` : 'Kedi'}>
      <ellipse cx="100" cy="197" rx="56" ry="7" fill="rgba(61,53,80,0.12)" />
      <g transform={`translate(100 196) scale(${shape.all}) translate(-100 -196)`}>
        <g className="cat-move">
          <g className="cat-tail">
            <path d="M138 176 C 186 178, 188 124, 162 114" fill="none" stroke={fur.dark} strokeWidth="20" strokeLinecap="round" />
            <path d="M138 176 C 186 178, 188 124, 162 114" fill="none" stroke={fur.base} strokeWidth="16" strokeLinecap="round" />
            {tuxedo && <circle cx="162" cy="114" r="8" fill={WHITE} />}
          </g>

          <g className="cat-body">
            <ellipse cx="100" cy="150" rx="48" ry="44" fill={fur.base} {...outline} />
            {cat.pattern === 'tabby' && (
              <g fill="none" stroke={fur.dark} strokeWidth="5" strokeLinecap="round">
                <path d="M56 138 q10 5 20 0" />
                <path d="M54 154 q10 5 20 0" />
                <path d="M124 138 q10 5 20 0" />
                <path d="M126 154 q10 5 20 0" />
              </g>
            )}
            {cat.pattern === 'spots' && (
              <g fill={fur.dark}>
                <circle cx="128" cy="138" r="10" />
                <circle cx="72" cy="160" r="7" />
                <circle cx="118" cy="168" r="5" />
              </g>
            )}
            {tuxedo && <ellipse cx="100" cy="162" rx="24" ry="30" fill={WHITE} />}
            <ellipse cx="80" cy="190" rx="15" ry="9" fill={tuxedo ? WHITE : fur.base} {...outline} />
            <ellipse cx="120" cy="190" rx="15" ry="9" fill={tuxedo ? WHITE : fur.base} {...outline} />
          </g>

          <g transform={`translate(0 ${shape.headDy}) translate(100 90) scale(${shape.head}) translate(-100 -90)`}>
            <g className="cat-head">
              <path d="M60 64 L56 22 L94 46 Z" fill={fur.base} {...outline} strokeLinejoin="round" />
              <path d="M140 64 L144 22 L106 46 Z" fill={fur.base} {...outline} strokeLinejoin="round" />
              <path d="M66 54 L64 34 L82 47 Z" fill={PINK} />
              <path d="M134 54 L136 34 L118 47 Z" fill={PINK} />
              <ellipse cx="100" cy="82" rx="48" ry="42" fill={fur.base} {...outline} />
              {cat.pattern === 'tabby' && (
                <g fill="none" stroke={fur.dark} strokeWidth="5" strokeLinecap="round">
                  <path d="M90 46 v10" />
                  <path d="M100 43 v13" />
                  <path d="M110 46 v10" />
                  <path d="M56 84 h9" />
                  <path d="M135 84 h9" />
                </g>
              )}
              {cat.pattern === 'spots' && (
                <g fill={fur.dark}>
                  <circle cx="126" cy="58" r="10" />
                  <circle cx="70" cy="66" r="6" />
                </g>
              )}
              {tuxedo && <ellipse cx="100" cy="100" rx="22" ry="16" fill={WHITE} />}

              {eyesClosed ? (
                <g fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round">
                  <path d={action === 'sleep' ? 'M72 82 q8 6 16 0' : 'M72 85 q8 -8 16 0'} />
                  <path d={action === 'sleep' ? 'M112 82 q8 6 16 0' : 'M112 85 q8 -8 16 0'} />
                </g>
              ) : (
                <g className="cat-eyes">
                  <ellipse cx="80" cy="82" rx="8.5" ry="9.5" fill={eye} />
                  <ellipse cx="120" cy="82" rx="8.5" ry="9.5" fill={eye} />
                  <ellipse cx="80" cy="83" rx="3.6" ry="6.5" fill={INK} />
                  <ellipse cx="120" cy="83" rx="3.6" ry="6.5" fill={INK} />
                  <circle cx="82.5" cy="79" r="2" fill="#fff" />
                  <circle cx="122.5" cy="79" r="2" fill="#fff" />
                </g>
              )}

              <ellipse cx="64" cy="98" rx="7" ry="4" fill={PINK} opacity="0.55" />
              <ellipse cx="136" cy="98" rx="7" ry="4" fill={PINK} opacity="0.55" />
              <path d="M96 94 h8 l-4 5 z" fill="#e58fa3" />
              <path d="M100 99 q-5 6 -10 2 M100 99 q5 6 10 2" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
              <g stroke={INK} strokeWidth="1.2" strokeLinecap="round" opacity="0.55">
                <path d="M58 92 h-16" />
                <path d="M58 98 l-15 4" />
                <path d="M142 92 h16" />
                <path d="M142 98 l15 4" />
              </g>
            </g>
          </g>
        </g>
      </g>

      {action === 'pet' && (
        <g className="cat-hearts" aria-hidden fill="#e58fa3" fontSize="18">
          <text x="46" y="60">♥</text>
          <text x="148" y="50">♥</text>
          <text x="100" y="30">♥</text>
        </g>
      )}
      {action === 'sleep' && (
        <g className="cat-zzz" aria-hidden fill="#8f7fc0" fontWeight="700">
          <text x="140" y="60" fontSize="14">z</text>
          <text x="152" y="44" fontSize="18">z</text>
          <text x="166" y="24" fontSize="22">z</text>
        </g>
      )}
      {action === 'eat' && (
        <g>
          <ellipse cx="100" cy="200" rx="26" ry="6" fill="#cbb8ef" />
          <path d="M76 198 h48 l-5 9 h-38 z" fill="#b8a1e3" />
          <ellipse cx="100" cy="197" rx="20" ry="4" fill="#c98a5a" />
        </g>
      )}
      {action === 'play' && (
        <g className="cat-yarn">
          <circle cx="168" cy="186" r="13" fill="#f4c9d6" stroke="#e39ab0" strokeWidth="2" />
          <path d="M158 182 q10 -8 20 2 M158 190 q10 -6 20 -2" fill="none" stroke="#e39ab0" strokeWidth="1.5" />
        </g>
      )}
    </svg>
  )
}
