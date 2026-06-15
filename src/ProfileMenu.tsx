import { useEffect, useRef, useState } from 'react'
import ExperienceToggle, { type Role } from './ExperienceToggle'

// Clickable user profile that reveals the experience toggle in a popover.
// Self-contained inline styles so it renders consistently under either app's
// CSS. `onDark` flips the trigger text colors for the dark borrower nav.
export default function ProfileMenu({
  name,
  initials,
  title,
  active,
  onDark = false,
}: {
  name: string
  initials: string
  title?: string
  active: Role
  onDark?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const nameColor = onDark ? '#fff' : '#16161a'
  const titleColor = onDark ? 'rgba(255,255,255,.5)' : '#6f7480'
  const chevColor = onDark ? 'rgba(255,255,255,.6)' : '#6f7480'

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          fontFamily: 'inherit',
        }}
      >
        <span
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: '#c9c9f7',
            color: '#3c3c8c',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 700,
            fontSize: 13,
            flexShrink: 0,
          }}
        >
          {initials}
        </span>
        <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25, textAlign: 'left' }}>
          <strong style={{ fontSize: 14, color: nameColor }}>{name}</strong>
          {title && <span style={{ fontSize: 12, color: titleColor }}>{title}</span>}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke={chevColor}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            zIndex: 1000,
            background: '#fff',
            border: '1px solid #ececf0',
            borderRadius: 12,
            boxShadow: '0 12px 32px rgba(20,20,40,.16)',
            padding: 12,
            minWidth: 184,
          }}
        >
          <div
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              color: '#6f7480',
              textTransform: 'uppercase',
              letterSpacing: '.06em',
              marginBottom: 8,
            }}
          >
            Switch experience
          </div>
          <ExperienceToggle active={active} />
        </div>
      )}
    </div>
  )
}
