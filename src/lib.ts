// ============================================================
//  Brand tokens — amm-dashboard (AssetIQ) palette.
//  Keys mirror the prototype so inline styles map 1:1 to the theme.
// ============================================================
export const C = {
  purple: '#4646a8',      // deep lavender — primary accent (values, selected)
  purpleD: '#33337a',
  purpleL: '#dcdcfa',     // lavender-soft — light selected surface
  purpleLL: '#f3f3fb',    // very light hover surface
  lavender: '#c9c9f7',
  black: '#16161a',
  white: '#ffffff',
  teal: '#1f9d55',        // amm success green (Plaid / verified)
  tealD: '#177e43',
  tealL: '#e8f7ee',
  green: '#1f9d55',
  greenL: '#e8f7ee',
  orange: '#b7791f',      // amm amber
  orangeL: '#fdf3d7',
  coral: '#d64545',       // amm red
  coralL: '#fdeaea',
  blue: '#3b5bdb',
  blueL: '#e8ecfb',
  neutral: '#ececf0',
  bg: '#f7f7f9',
  gray: '#6f7480',
  dgray: '#3a3a42',
  border: '#ececf0',
}

export const GRAD_DARK = 'linear-gradient(135deg,#16161a,#26266b)'

// ── Types ───────────────────────────────────────────────
export interface Product { id: string; name: string; rate: number; term: number; pmi?: boolean; mip?: boolean }
export interface Loan {
  id: string; bwr: string; ini: string; prod: string; loan: number; val: number
  fico: number; inc: number; dbt: number; stage: string; days: number
  lock: number | null; close: string; rate: number; plaid: boolean
}

export const PRODS: Product[] = [
  { id: 'conv30', name: '30-Year Fixed', rate: 6.875, term: 30, pmi: true },
  { id: 'conv15', name: '15-Year Fixed', rate: 6.125, term: 15, pmi: true },
  { id: 'fha30', name: 'FHA 30-Year', rate: 6.5, term: 30, pmi: false, mip: true },
  { id: 'arm51', name: '5/1 ARM', rate: 6.0, term: 30, pmi: true },
]

export const PIPELINE: Loan[] = [
  { id: 'LN-2026-1001', bwr: 'Sarah Chen', ini: 'SC', prod: '30-Yr Fixed', loan: 340000, val: 425000, fico: 742, inc: 7153, dbt: 810, stage: 'Underwriting', days: 2, lock: 28, close: 'Jun 15', rate: 6.875, plaid: true },
  { id: 'LN-2026-1002', bwr: 'Marcus Johnson', ini: 'MJ', prod: 'FHA 30-Yr', loan: 280000, val: 309900, fico: 698, inc: 6200, dbt: 680, stage: 'Conditions', days: 1, lock: 12, close: 'Jun 20', rate: 6.5, plaid: false },
  { id: 'LN-2026-1003', bwr: 'Emily Rodriguez', ini: 'ER', prod: '30-Yr Fixed', loan: 520000, val: 650000, fico: 780, inc: 11800, dbt: 920, stage: 'Processing', days: 3, lock: 28, close: 'Jun 25', rate: 6.875, plaid: true },
  { id: 'LN-2026-1004', bwr: 'David Kim', ini: 'DK', prod: 'VA 30-Yr', loan: 380000, val: 400000, fico: 715, inc: 8500, dbt: 550, stage: 'Disclosure', days: 0, lock: 28, close: 'Jun 18', rate: 6.375, plaid: false },
  { id: 'LN-2026-1005', bwr: 'Amanda Foster', ini: 'AF', prod: 'FHA 30-Yr', loan: 195000, val: 219900, fico: 665, inc: 4800, dbt: 490, stage: 'Documents', days: 4, lock: null, close: 'Jul 10', rate: 6.5, plaid: false },
  { id: 'LN-2026-1006', bwr: 'James Patel', ini: 'JP', prod: 'Jumbo 30-Yr', loan: 680000, val: 850000, fico: 755, inc: 14200, dbt: 1100, stage: 'Closing', days: 1, lock: 2, close: 'Jun 13', rate: 7.125, plaid: true },
  { id: 'LN-2026-1007', bwr: 'Lisa Thompson', ini: 'LT', prod: '15-Yr Fixed', loan: 365000, val: 420000, fico: 720, inc: 8100, dbt: 640, stage: 'Application', days: 0, lock: null, close: 'Jul 20', rate: 6.125, plaid: false },
  { id: 'LN-2026-1008', bwr: 'Robert Garcia', ini: 'RG', prod: 'USDA 30-Yr', loan: 210000, val: 240000, fico: 690, inc: 5400, dbt: 420, stage: 'Pre-Qual', days: 0, lock: null, close: 'Aug 1', rate: 6.25, plaid: false },
]

// ── Utilities ───────────────────────────────────────────
export const fmt = (n: number) => '$' + Math.round(n || 0).toLocaleString()
export const pct = (n: number) => (+n || 0).toFixed(1) + '%'

export function calcPI(p: number, r: number, years: number) {
  const n = years * 12
  const m = r / 100 / 12
  if (!m || !n) return p / (n || 360)
  return (p * (m * Math.pow(1 + m, n))) / (Math.pow(1 + m, n) - 1)
}

const STAGE_MAP: Record<string, [string, string]> = {
  'Pre-Qual': ['#eef0f4', '#475569'],
  Application: ['#e8ecfb', '#3b5bdb'],
  Disclosure: ['#dcdcfa', '#5b21b6'],
  Documents: ['#fce4f3', '#be185d'],
  Processing: ['#e8ecfb', '#2155a8'],
  Underwriting: ['#dcdcfa', '#33337a'],
  Conditions: ['#fdf3d7', '#b45309'],
  Closing: ['#e8f7ee', '#15803d'],
  Funded: ['#d1fae5', '#064e3b'],
}

export function stageBadgeStyle(s: string): React.CSSProperties {
  const [bg, c] = STAGE_MAP[s] || STAGE_MAP['Pre-Qual']
  return { display: 'inline-block', padding: '2px 9px', borderRadius: 20, fontSize: 10.5, fontWeight: 700, background: bg, color: c, whiteSpace: 'nowrap' }
}
