// Segmented control to switch between the loan-officer and borrower apps.
// Setting the hash triggers the `hashchange` → reload handler in main.tsx,
// which boots the other experience (and loads only its stylesheet).
// Styled inline so it renders identically under either app's CSS.

export type Role = 'officer' | 'borrower'

const OPTIONS: { role: Role; label: string }[] = [
  { role: 'officer', label: 'Officer' },
  { role: 'borrower', label: 'Borrower' },
]

function go(role: Role) {
  const target = '#' + role
  if (window.location.hash === target) return
  window.location.hash = target
}

export default function ExperienceToggle({ active }: { active: Role }) {
  return (
    <div
      role="group"
      aria-label="Switch experience"
      style={{
        display: 'inline-flex',
        background: '#f3f3fb',
        border: '1px solid #ececf0',
        borderRadius: 8,
        padding: 2,
        gap: 2,
      }}
    >
      {OPTIONS.map((o) => {
        const on = o.role === active
        return (
          <button
            key={o.role}
            type="button"
            onClick={on ? undefined : () => go(o.role)}
            aria-pressed={on}
            style={{
              border: 'none',
              cursor: on ? 'default' : 'pointer',
              background: on ? '#4646a8' : 'transparent',
              color: on ? '#fff' : '#6f7480',
              fontFamily: 'inherit',
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: '.02em',
              padding: '4px 11px',
              borderRadius: 6,
              transition: 'all .15s',
            }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
