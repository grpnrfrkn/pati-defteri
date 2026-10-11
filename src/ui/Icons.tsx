import type { ReactNode } from 'react'

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  )
}

export const SunIcon = () => (
  <Icon>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
  </Icon>
)

export const ListIcon = () => (
  <Icon>
    <path d="M9.5 6.5h10M9.5 12h10M9.5 17.5h10" />
    <path d="M4 6.3l1.1 1.1 2-2.2M4 11.8l1.1 1.1 2-2.2M4 17.3l1.1 1.1 2-2.2" />
  </Icon>
)

export const CatIcon = () => (
  <Icon>
    <path d="M5 10.5V4.5l4 3a8 8 0 0 1 6 0l4-3v6c1 3-1 8.5-7 8.5s-8-5.5-7-8.5z" />
    <path d="M9.3 12.2v.6M14.7 12.2v.6M11 15.2l1 .9 1-.9" />
  </Icon>
)

export const ShopIcon = () => (
  <Icon>
    <path d="M5.5 8.5h13l-1 11.5h-11z" />
    <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" />
  </Icon>
)

export const MoreIcon = () => (
  <Icon>
    <circle cx="5.5" cy="12" r="1.4" fill="currentColor" />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" />
    <circle cx="18.5" cy="12" r="1.4" fill="currentColor" />
  </Icon>
)
