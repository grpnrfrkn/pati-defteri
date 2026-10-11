import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode, type RefObject } from 'react'
import { clampPosition, findItem, FLOOR_TOP, type ShopItem } from '../domain/shop'
import type { RoomState } from '../domain/types'

type Placed = RoomState['placed'][number]

/** Ok tuşuyla bir adımda taşınan mesafe (odaya oranla). */
const KEY_STEP = 0.03

function PlacedItem({
  placed,
  item,
  editing,
  roomRef,
  onMove,
}: {
  placed: Placed
  item: ShopItem
  editing: boolean
  roomRef: RefObject<HTMLDivElement | null>
  onMove?: (itemId: string, x: number, y: number) => void
}) {
  // Sürüklerken konum yerelde tutulur; bırakınca kaydedilir.
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null)
  const grab = useRef<{ dx: number; dy: number } | null>(null)
  const pos = drag ?? placed

  const toRoom = (e: PointerEvent) => {
    const rect = roomRef.current!.getBoundingClientRect()
    return { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height }
  }
  const down = (e: PointerEvent<HTMLButtonElement>) => {
    if (!editing) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const p = toRoom(e)
    grab.current = { dx: placed.x - p.x, dy: placed.y - p.y }
    setDrag({ x: placed.x, y: placed.y })
  }
  const move = (e: PointerEvent) => {
    if (!grab.current) return
    const p = toRoom(e)
    setDrag(clampPosition(item.zone!, p.x + grab.current.dx, p.y + grab.current.dy))
  }
  const up = () => {
    if (!grab.current) return
    grab.current = null
    if (drag && (drag.x !== placed.x || drag.y !== placed.y)) onMove?.(item.id, drag.x, drag.y)
    setDrag(null)
  }

  // Sürükleyemeyenler için: ok tuşlarıyla küçük adımlarla taşıma.
  const key = (e: KeyboardEvent) => {
    const step: Record<string, [number, number]> = {
      ArrowLeft: [-KEY_STEP, 0],
      ArrowRight: [KEY_STEP, 0],
      ArrowUp: [0, -KEY_STEP],
      ArrowDown: [0, KEY_STEP],
    }
    const delta = editing ? step[e.key] : undefined
    if (!delta) return
    e.preventDefault()
    const next = clampPosition(item.zone!, placed.x + delta[0], placed.y + delta[1])
    if (next.x !== placed.x || next.y !== placed.y) onMove?.(item.id, next.x, next.y)
  }

  return (
    <button
      className={`room-item${editing ? ' editing' : ''}${drag ? ' dragging' : ''}`}
      style={{
        left: `${pos.x * 100}%`,
        top: `${pos.y * 100}%`,
        fontSize: `${item.size}cqw`,
        zIndex: Math.round(pos.y * 100),
      }}
      aria-label={editing ? `${item.name}: sürükleyerek ya da ok tuşlarıyla taşı` : item.name}
      onKeyDown={key}
      tabIndex={editing ? 0 : -1}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
    >
      {item.emoji}
    </button>
  )
}

/**
 * Kedinin odası: duvar kâğıdı, zemin, halı ve yerleştirilen eşyalar. Sabit en-boy
 * oranıyla çizilir ve konumlar orana dayalıdır, bu yüzden her ekranda aynı görünür.
 */
export function Room({
  room,
  editing = false,
  onMove,
  children,
}: {
  room: RoomState
  editing?: boolean
  onMove?: (itemId: string, x: number, y: number) => void
  children?: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const rug = findItem(room.rug)
  return (
    <div ref={ref} className={`room${editing ? ' editing' : ''}`} style={{ background: findItem(room.wallpaper)?.style }}>
      <div className="room-floor" style={{ top: `${FLOOR_TOP * 100}%` }} />
      {rug && <div className="room-rug" style={{ background: rug.style }} />}
      {room.placed.map((placed) => {
        const item = findItem(placed.itemId)
        return item ? (
          <PlacedItem key={placed.itemId} placed={placed} item={item} editing={editing} roomRef={ref} onMove={onMove} />
        ) : null
      })}
      <div className="room-cat">{children}</div>
    </div>
  )
}
