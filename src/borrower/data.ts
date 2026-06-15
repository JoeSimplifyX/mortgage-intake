// ============================================================
//  SimplifyX™ Borrower Portal — brand tokens, products, utils.
//  Ported 1:1 from demo/prototype.html.
// ============================================================

// Palette aligned to the loan-officer theme (mirrors src/lib.ts `C`).
export const C = {
  purple: '#4646a8', purpleD: '#33337a', purpleL: '#dcdcfa', purpleLL: '#f3f3fb',
  lavender: '#c9c9f7', black: '#16161a', white: '#ffffff',
  teal: '#1f9d55', tealD: '#177e43', tealL: '#e8f7ee',
  green: '#1f9d55', greenL: '#e8f7ee',
  orange: '#b7791f', orangeL: '#fdf3d7',
  coral: '#d64545', coralL: '#fdeaea',
  blue: '#3b5bdb', blueL: '#e8ecfb',
  neutral: '#ececf0', bg: '#f7f7f9',
  gray: '#6f7480', dgray: '#3a3a42', border: '#ececf0',
}

// ── Types ───────────────────────────────────────────────
export interface Product {
  id: string; name: string; rate: number; term: number
  minFico: number; minDown: number; maxDti: number; apr: number
  tag: string; tagC: string; who: string; pros: string[]
  pmi?: boolean; mip?: boolean
}

export interface BankAccount { t: string; n: string; mask: string; bal: number }

export interface BorrowerData {
  purpose: string; price: number; down: number; propType: string; occ: string
  firstName: string; lastName: string; email: string; phone: string; dob: string
  empType: string; salary: number; bonus: number
  debtAuto: number; debtStudent: number; debtCC: number
  plaidIncome: boolean; plaidAssets: boolean; plaidAccounts: BankAccount[]
  selectedProd: string; sliderLoan: number
  fico?: number
}

export const INITIAL_DATA: BorrowerData = {
  purpose: 'purchase', price: 425000, down: 85000, propType: 'sfr', occ: 'primary',
  firstName: 'Sarah', lastName: 'Chen', email: 'sarah.chen@email.com', phone: '(404) 555-0192', dob: '1989-03-15',
  empType: 'w2', salary: 78400, bonus: 5680, debtAuto: 350, debtStudent: 280, debtCC: 180,
  plaidIncome: false, plaidAssets: false, plaidAccounts: [], selectedProd: 'conv30', sliderLoan: 340000,
  fico: 742,
}

export const PRODS: Product[] = [
  { id: 'conv30', name: '30-Year Fixed', rate: 6.875, term: 30, minFico: 620, minDown: 3, maxDti: 50, apr: 6.991, tag: 'Most Popular', tagC: C.purple, who: 'Best for buyers wanting payment stability long-term.', pros: ['Predictable payments for 30 years', 'Lower monthly payment vs 15-yr', 'Maximum budget flexibility'], pmi: true },
  { id: 'conv15', name: '15-Year Fixed', rate: 6.125, term: 15, minFico: 620, minDown: 3, maxDti: 50, apr: 6.284, tag: 'Pay Off Faster', tagC: C.blue, who: 'Best for buyers who want to build equity fast.', pros: ['Save tens of thousands in interest', 'Build equity 2× faster', 'Rate ~0.75% lower than 30-yr'], pmi: true },
  { id: 'fha30', name: 'FHA 30-Year', rate: 6.5, term: 30, minFico: 580, minDown: 3.5, maxDti: 56.9, apr: 7.612, tag: 'Low Down Payment', tagC: C.teal, who: 'Best for first-time buyers with limited savings.', pros: ['Only 3.5% down required', 'Flexible credit requirements', 'Gift funds allowed'], pmi: false, mip: true },
  { id: 'arm51', name: '5/1 ARM', rate: 6.0, term: 30, minFico: 680, minDown: 5, maxDti: 50, apr: 7.124, tag: 'Lower Start Rate', tagC: C.orange, who: 'Best for buyers planning to move within 5 years.', pros: ['Lowest initial rate available', 'Fixed for first 5 years', 'Save vs 30-yr fixed'], pmi: true },
]

// ── Utilities ───────────────────────────────────────────
export const fmt = (n: number) => '$' + Math.round(n || 0).toLocaleString()
export const fmtK = (n: number) =>
  n >= 1e6 ? '$' + (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? '$' + Math.round(n / 1e3) + 'K' : fmt(n)
export const pct = (n: number) => (+n || 0).toFixed(1) + '%'

export function calcPI(p: number, r: number, years: number) {
  const n = years * 12
  const m = r / 100 / 12
  if (!m || !n) return p / (n || 360)
  return (p * (m * Math.pow(1 + m, n))) / (Math.pow(1 + m, n) - 1)
}

export function calcEq5(p: number, r: number, t: number) {
  const n = t * 12
  const m = r / 100 / 12
  if (!m) return (p * 5) / t
  const rem = (p * (Math.pow(1 + m, n) - Math.pow(1 + m, 60))) / (Math.pow(1 + m, n) - 1)
  return Math.max(0, p - rem)
}
