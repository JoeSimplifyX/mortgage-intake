import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Two apps live in this project. Pick one by URL hash so their (conflicting)
// global stylesheets never load together:
//   #borrower  → borrower pre-qualification flow
//   #officer   → loan-officer origination console (default)
// Switching hash reloads the page so only one app's CSS is ever active.
window.addEventListener('hashchange', () => window.location.reload())

const role = window.location.hash.replace(/^#\/?/, '') === 'borrower' ? 'borrower' : 'officer'

async function boot() {
  const root = createRoot(document.getElementById('root')!)

  if (role === 'borrower') {
    document.title = 'SimplifyX™ Mortgage — Get Pre-Qualified'
    await import('./borrower/styles.css')
    const { default: Borrower } = await import('./App')
    root.render(<StrictMode><Borrower /></StrictMode>)
  } else {
    document.title = 'SimplifyX™ Mortgage Origination'
    await import('./theme.css')
    const { default: LoanOfficer } = await import('./LoanOfficer')
    root.render(<StrictMode><LoanOfficer /></StrictMode>)
  }
}

boot()
