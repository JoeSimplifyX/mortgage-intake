import { useState } from 'react'
import Icon from './Icons'
import { C, PIPELINE, PRODS, fmt, pct, calcPI, stageBadgeStyle } from '../lib'
import type { Loan } from '../lib'

// ── per-loan derived metrics ────────────────────────────
function metrics(l: Loan) {
  const term = l.prod.includes('15') ? 15 : 30
  const pi = calcPI(l.loan, l.rate, term)
  const tax = (l.val * 0.0125) / 12, ins = (l.val * 0.004) / 12
  const ltv = (l.loan / l.val) * 100
  const pmi = ltv > 80 && !l.prod.includes('VA') ? (l.loan * 0.006) / 12 : 0
  const piti = pi + tax + ins + pmi
  const frontDTI = (piti / l.inc) * 100
  const backDTI = ((piti + l.dbt) / l.inc) * 100
  return { pi, piti, ltv, frontDTI, backDTI }
}

// ── shared per-loan header (amm card + KPI strip) ───────
function LoanHeader({ loan }: { loan: Loan }) {
  const m = metrics(loan)
  const kpis: [string, string, string | null][] = [
    [fmt(loan.loan), 'Loan', null],
    [pct(m.ltv), 'LTV', m.ltv > 90 ? C.coral : m.ltv > 80 ? C.orange : C.green],
    [String(loan.fico), 'FICO', loan.fico >= 740 ? C.green : loan.fico >= 680 ? C.orange : C.coral],
    [pct(m.frontDTI), 'Front DTI', m.frontDTI > 31 ? C.orange : C.green],
    [pct(m.backDTI), 'Back DTI', m.backDTI > 50 ? C.coral : m.backDTI > 45 ? C.orange : C.green],
    [fmt(Math.round(m.piti)), 'PITI/mo', null],
  ]
  return (
    <section className="card">
      <div className="lo-loanhead">
        <div className="who">
          <div className="avatar avatar-lg" data-initials={loan.ini} />
          <div>
            <h3>{loan.bwr}</h3>
            <div className="sub">{loan.id} · {loan.prod} · {fmt(loan.loan)} · Close {loan.close}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {loan.plaid && <span className="pill pill-ok">⚡ Plaid</span>}
          <span style={stageBadgeStyle(loan.stage)}>{loan.stage}</span>
          {loan.lock != null && <span className="pill" style={{ color: loan.lock <= 5 ? C.coral : loan.lock <= 14 ? C.orange : C.green, background: loan.lock <= 5 ? C.coralL : loan.lock <= 14 ? C.orangeL : C.greenL }}>🔒 {loan.lock}d lock</span>}
          <button className="btn btn-primary btn-sm">Move Stage →</button>
        </div>
      </div>
      <div className="lo-kpi-strip">
        {kpis.map(([v, l, c]) => (
          <div key={l} className="lo-kpi"><strong style={{ color: c || C.black }}>{v}</strong><span>{l}</span></div>
        ))}
      </div>
    </section>
  )
}

// ============================================================
//  Pipeline — amm KPI cards + amm-styled table
// ============================================================
const STAGES = ['All', 'Pre-Qual', 'Application', 'Disclosure', 'Documents', 'Processing', 'Underwriting', 'Conditions', 'Closing']

export function PipelinePage({ onSelect }: { onSelect: (id: string) => void }) {
  const [filter, setFilter] = useState('All')
  const rows = filter === 'All' ? PIPELINE : PIPELINE.filter((l) => l.stage === filter)
  const totalVol = PIPELINE.reduce((s, l) => s + l.loan, 0)
  const avgFico = Math.round(PIPELINE.reduce((s, l) => s + l.fico, 0) / PIPELINE.length)
  const lockAlerts = PIPELINE.filter((l) => l.lock && l.lock <= 7).length

  const kpis = [
    { label: 'Active Pipeline', value: '8 loans', sub: 'across 7 stages', icon: 'stats', theme: 'kpi-lavender', trend: 'trendUp' },
    { label: 'Total Volume', value: fmt(totalVol), sub: 'unpaid principal in flight', icon: 'dollar', theme: 'kpi-gray', trend: 'trendUp' },
    { label: 'Lock Alerts', value: lockAlerts > 0 ? `${lockAlerts} expiring` : '✓ None', sub: '1 expires within 2 days', icon: 'shield', theme: 'kpi-dark', trend: 'alert' },
    { label: 'Avg FICO', value: String(avgFico), sub: 'weighted pipeline average', icon: 'cpu', theme: 'kpi-light', trend: 'trendUp' },
  ]

  return (
    <main className="content">
      <div className="lo-page-head" style={{ marginBottom: 4 }}>
        <h1>Loan Pipeline</h1>
        <p>{PIPELINE.length} active loans · {fmt(totalVol)} total volume · sorted by close date</p>
      </div>

      <section className="kpi-row rise d1">
        {kpis.map((k) => (
          <article key={k.label} className={`kpi ${k.theme}`}>
            <div className="kpi-head"><span>{k.label}</span><span className="kpi-icon"><Icon name={k.icon} /></span></div>
            <h2 className="kpi-value">{k.value}</h2>
            <p className="kpi-trend"><Icon name={k.trend} />{k.sub}</p>
          </article>
        ))}
      </section>

      <div className="lo-filter-row rise d2">
        {STAGES.map((s) => <button key={s} className={`lo-chip${filter === s ? ' on' : ''}`} onClick={() => setFilter(s)}>{s}</button>)}
      </div>

      <section className="card rise d3">
        <div className="lo-thead">
          <span>Borrower</span><span>Product</span><span>Amount</span><span>LTV</span>
          <span>FICO</span><span>Back DTI</span><span>Stage</span><span>Close</span>
        </div>
        {rows.map((l) => {
          const m = metrics(l)
          return (
            <div key={l.id} className="lo-trow" onClick={() => onSelect(l.id)}>
              <span className="lo-bwr">
                <span className="avatar" data-initials={l.ini} />
                <span><strong>{l.bwr}</strong><br /><small>{l.id}</small></span>
              </span>
              <span className="lo-mono">{l.prod}</span>
              <span className="lo-num">{fmt(l.loan)}</span>
              <span className="lo-num" style={{ color: m.ltv > 90 ? C.coral : m.ltv > 80 ? C.orange : C.green }}>{pct(m.ltv)}</span>
              <span className="lo-num" style={{ color: l.fico >= 740 ? C.green : l.fico >= 680 ? C.orange : C.coral }}>{l.fico}</span>
              <span className="lo-num" style={{ color: m.backDTI > 50 ? C.coral : m.backDTI > 45 ? C.orange : C.green }}>{pct(m.backDTI)}</span>
              <span><span style={stageBadgeStyle(l.stage)}>{l.stage}</span></span>
              <span className="lo-mono">{l.lock != null && l.lock <= 5 ? `🔒 ${l.close}` : l.close}</span>
            </div>
          )
        })}
      </section>
    </main>
  )
}

// ============================================================
//  AI Briefing
// ============================================================
export function BriefingPage({ loan }: { loan: Loan }) {
  const m = metrics(loan)
  const quads = [
    { title: 'Income', color: C.teal, items: ['$7,153/mo qualifying', 'Base + OT (2-yr avg ↑)', 'FNMA B3-3 W-2 method', ...(loan.plaid ? ['⚡ Plaid Income verified'] : [])] },
    { title: 'Assets', color: C.blue, items: ['Total: $160,500', 'Liquid: $71,300', 'Down pmt: Chase ••4891', ...(loan.plaid ? ['⚡ Plaid Assets verified'] : ['⚠ $12,400 deposit LOE'])] },
    { title: 'Credit', color: C.purple, items: ['742/738/745 — using 742', '8 tradelines, 7.2yr avg', '22% utilization', 'No derogatory'] },
    { title: 'Collateral', color: C.orange, items: ['Appraised: $425,000', 'CU Score 2.5 — low risk', '3 strong comps in 0.5mi', 'C3 · No repairs required'] },
  ]
  return (
    <main className="content lo-page">
      <div className="lo-page-head"><h1>AI Pre-Review</h1><p>Underwriting pre-review summary · {loan.bwr}</p></div>
      <LoanHeader loan={loan} />

      <section className="card" style={{ background: C.black, color: '#fff', border: 'none' }}>
        <div style={{ display: 'flex', gap: 5, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {['⚙ Workflow', '📚 RAG', '📄 Doc'].map((a) => <span key={a} style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 6, background: 'rgba(201,201,247,.16)', color: C.lavender }}>{a}</span>)}
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginLeft: 'auto' }}>Generated 8:00 AM today</span>
        </div>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Underwriting Pre-Review Summary</div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', lineHeight: 1.6 }}>DU: Approve/Eligible · QM Safe Harbor · ATR verified · OFAC clear · Ready for underwriter review.</p>
      </section>

      <div className="lo-quad">
        {quads.map((q) => (
          <div key={q.title} className="lo-quad-card">
            <h4 style={{ color: q.color, borderColor: q.color }}>{q.title}</h4>
            {q.items.map((item) => <div key={item} className="qline"><span style={{ color: item.startsWith('⚡') ? C.teal : item.startsWith('⚠') ? C.orange : C.gray, flexShrink: 0 }}>›</span>{item}</div>)}
          </div>
        ))}
      </div>

      <section className="card">
        <div className="card-head"><h3>⚠ Risk flags requiring UW attention</h3></div>
        <div className="lo-flag" style={{ borderLeft: `3px solid ${C.orange}`, background: C.orangeL }}><strong style={{ color: C.orange }}>WARN · </strong>Back DTI {pct(m.backDTI)} approaching threshold — compensating factors: {loan.fico} FICO, 8.4mo reserves, 4yr employment.</div>
        <div className="lo-flag" style={{ borderLeft: `3px solid ${C.blue}`, background: C.blueL }}><strong style={{ color: C.blue }}>INFO · </strong>OT income trending ↑ 2 years. Eligible per FNMA B3-3.1-09.</div>
      </section>

      <section className="card" style={{ borderLeft: `3px solid ${C.green}`, background: C.greenL }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: C.green, marginBottom: 3 }}>✋ Human Gate: Underwriter Credit Decision</div>
        <div style={{ fontSize: 12.5, color: '#166534' }}>Agent pre-reviews — underwriter ALONE makes the credit decision.</div>
      </section>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="btn ai-btn-approve">✓ Approve</button>
        <button className="btn ai-btn-escalate">⏳ Suspend</button>
        <button className="btn ai-btn-reject">✕ Deny</button>
        <button className="btn btn-light">+ Add Condition</button>
      </div>
    </main>
  )
}

// ============================================================
//  Action List
// ============================================================
const ACTION_GROUPS = [
  { p: 'P1', label: 'Critical — act today', pill: 'pill-risk', items: [
    { id: 'a1', loan: 'LN-2026-1006', bwr: 'James Patel', text: 'Rate lock expires in 2 days. Final VOE needed before Jun 13 closing.', type: 'Rate Lock', auto: false, cta: 'Extend Lock' },
  ] },
  { p: 'P2', label: 'Auto-clearable — one click', pill: 'pill-watch', items: [
    { id: 'b1', loan: 'LN-2026-1001', bwr: 'Sarah Chen', text: 'VOE from Work Number matches UW condition C1 (Acme Corp). Confirm to clear?', type: 'Condition', auto: true, cta: 'Confirm & Clear' },
    { id: 'b2', loan: 'LN-2026-1001', bwr: 'Sarah Chen', text: '4506-C transcript matches 2024 & 2025 returns. No variance. Confirm?', type: 'Condition', auto: true, cta: 'Confirm Match' },
  ] },
  { p: 'P3', label: 'Borrower outreach needed', pill: 'pill-watch', items: [
    { id: 'c1', loan: 'LN-2026-1005', bwr: 'Amanda Foster', text: 'Bank statements outstanding 4 days. Pre-drafted SMS ready to send.', type: 'Document', auto: true, cta: 'Send Reminder' },
  ] },
  { p: 'P4', label: 'Third-party pending', pill: 'pill-blocked', items: [
    { id: 'd1', loan: 'LN-2026-1003', bwr: 'Emily Rodriguez', text: 'Appraisal ordered May 28 via Reggora. ETA Jun 5 — no update. Auto-follow-up sent.', type: 'Appraisal', auto: false, cta: 'Check Status' },
  ] },
]

export function ActionsPage() {
  const [cleared, setCleared] = useState<string[]>([])
  const done = new Set(cleared)
  return (
    <main className="content lo-page">
      <div className="lo-page-head"><h1>Daily Prioritized Action List</h1><p>Generated 8:00 AM · {PIPELINE.length} active loans · sorted by urgency</p></div>
      {ACTION_GROUPS.map((g) => (
        <section key={g.p} className="card list-card">
          <div className="card-head"><h3><span className={`pill ${g.pill}`} style={{ marginRight: 8 }}>{g.p}</span>{g.label}</h3></div>
          <ul className="ops-list">
            {g.items.map((item) => {
              const isDone = done.has(item.id)
              return (
                <li key={item.id} className="ops-row" style={{ opacity: isDone ? 0.55 : 1 }}>
                  <span className="ops-meta">
                    <strong>{item.bwr} <span style={{ fontFamily: 'monospace', fontSize: 11, color: C.purple, fontWeight: 700 }}>{item.loan}</span> <span className="pill pill-blocked" style={{ fontSize: 10, padding: '3px 9px' }}>{item.type}</span></strong>
                    <span className="ops-detail">{item.text}</span>
                  </span>
                  {isDone ? <span className="pill pill-ok">✓ Done</span> : <button className={`btn btn-sm ${item.auto ? 'btn-primary' : 'btn-light'}`} onClick={() => setCleared((c) => [...c, item.id])}>{item.cta}</button>}
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </main>
  )
}

// ============================================================
//  Conditions
// ============================================================
const CONDITION_COLS = [
  { status: 'Satisfied', pill: 'pill-ok', conds: [{ id: 'C2', text: '4506-C transcript matches 2024 & 2025 returns', doc: 'IRS 4506-C', date: 'Jun 8' }, { id: 'C6', text: 'Identity verified — OFAC clear', doc: 'LexisNexis', date: 'May 28' }] },
  { status: 'Pending', pill: 'pill-watch', conds: [{ id: 'C1', text: 'Verify employment within 10 biz days of closing', doc: 'VOE Work Number', date: 'Due Jun 13' }, { id: 'C3', text: 'Updated pay stub within 30 days of closing', doc: 'Recent pay stub', date: 'Due Jun 12' }, { id: 'C4', text: "Homeowner's insurance binder with lender clause", doc: 'Insurance binder', date: 'Due Jun 13' }] },
  { status: 'Borrower needed', pill: 'pill-risk', conds: [{ id: 'C5', text: 'Final title commitment — no exceptions', doc: 'Title commitment', date: 'In progress' }, { id: 'C7', text: 'LOE for $12,400 deposit on 2/15', doc: 'LOE + support docs', date: 'Under review' }] },
]

export function ConditionsPage({ loan }: { loan: Loan }) {
  return (
    <main className="content lo-page">
      <div className="lo-page-head"><h1>Conditions</h1><p>AUS conditions mapped to documents &amp; deadlines · {loan.bwr}</p></div>
      <LoanHeader loan={loan} />
      <div className="lo-cond-cols">
        {CONDITION_COLS.map((col) => (
          <div key={col.status}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span className={`pill ${col.pill}`}>{col.status}</span><span className="head-count">{col.conds.length}</span>
            </div>
            {col.conds.map((c) => (
              <article key={c.id} className="card" style={{ marginBottom: 10, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <strong style={{ fontFamily: 'monospace', fontSize: 12, color: C.purple }}>{c.id}</strong>
                  <span style={{ fontSize: 11, color: C.gray }}>{c.date}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, lineHeight: 1.45 }}>{c.text}</div>
                <div style={{ fontSize: 11.5, color: C.gray }}>{c.doc}</div>
              </article>
            ))}
          </div>
        ))}
      </div>
    </main>
  )
}

// ============================================================
//  Doc Freshness
// ============================================================
const FRESHNESS = [
  { doc: 'Credit Report', date: 'Feb 4', exp: 'Jun 4 (120-day window)', days: 22, status: 'ok' },
  { doc: 'Pay Stub (most recent)', date: 'May 31', exp: 'Jun 30 (30-day window)', days: 18, status: 'ok' },
  { doc: 'Bank Statement (April)', date: 'May 3', exp: 'Jun 2 (60-day window)', days: 6, status: 'warn' },
  { doc: 'VOE — Work Number', date: '—', exp: 'Within 10 biz days of close', days: null, status: 'pending' },
  { doc: "Homeowner's Insurance Binder", date: '—', exp: 'Must be effective on close date', days: null, status: 'missing' },
  { doc: 'Flood Certification', date: 'May 10', exp: 'Life of loan', days: 999, status: 'ok' },
  { doc: 'Appraisal', date: 'May 14', exp: 'May 2027 (12-month window)', days: 337, status: 'ok' },
]

export function FreshnessPage() {
  return (
    <main className="content lo-page">
      <div className="lo-page-head"><h1>Document Freshness Monitor</h1><p>Proactive alerts — never discover expired docs the day before closing.</p></div>
      <section className="card list-card">
        <ul className="ops-list">
          {FRESHNESS.map((d) => {
            const pillCls = d.status === 'missing' ? 'pill-risk' : d.status === 'warn' ? 'pill-watch' : d.status === 'pending' ? 'pill-blocked' : 'pill-ok'
            const label = d.status === 'ok' ? '✓ Valid' : d.status === 'pending' ? 'Pending' : d.status === 'missing' ? 'Missing' : 'Expiring'
            return (
              <li key={d.doc} className="ops-row">
                <span className="time-chip" style={{ color: d.days != null && d.days <= 7 ? C.coral : d.days != null && d.days <= 14 ? C.orange : undefined }}>{d.days != null && d.days < 999 ? `${d.days}d` : '—'}</span>
                <span className="ops-meta"><strong>{d.doc}</strong><span className="ops-detail">{(d.date !== '—' ? `Pulled ${d.date} · ` : '') + d.exp}</span></span>
                <span className={`pill ${pillCls}`}>{label}</span>
              </li>
            )
          })}
        </ul>
      </section>
    </main>
  )
}

// ============================================================
//  Structuring
// ============================================================
export function StructuringPage({ loan }: { loan: Loan }) {
  const scenarios = [{ label: 'Current — 30-Yr Fixed', prod: PRODS[0] }, { label: 'Alternative — FHA 30-Yr', prod: PRODS[2] }]
  return (
    <main className="content lo-page">
      <div className="lo-page-head"><h1>Loan Structuring Calculator</h1><p>Model scenarios side-by-side to find the best structure · {loan.bwr}</p></div>
      <LoanHeader loan={loan} />
      <div className="lo-2col">
        {scenarios.map((sc) => {
          const tYrs = sc.prod.term
          const pi = calcPI(loan.loan, sc.prod.rate, tYrs)
          const tax = (loan.val * 0.0125) / 12, ins = (loan.val * 0.004) / 12
          const ltv = (loan.loan / loan.val) * 100
          const pmi = sc.prod.pmi && ltv > 80 ? (loan.loan * 0.006) / 12 : 0
          const mip = sc.prod.mip ? (loan.loan * 0.0055) / 12 : 0
          const piti = pi + tax + ins + pmi + mip
          const backDTI = ((piti + loan.dbt) / loan.inc) * 100
          const totalInt = Math.round(pi * tYrs * 12 - loan.loan)
          const rows: [string, string, string | null][] = [['P&I', fmt(Math.round(pi)), null], ['Tax & insurance', fmt(Math.round(tax + ins)), null]]
          if (pmi > 0) rows.push(['PMI', fmt(Math.round(pmi)), null])
          if (mip > 0) rows.push(['FHA MIP', fmt(Math.round(mip)), null])
          rows.push(['Total PITI', fmt(Math.round(piti)), C.purple], ['Back DTI', pct(backDTI), backDTI > 45 ? C.orange : C.green], ['Total interest', fmt(totalInt), null])
          return (
            <article key={sc.label} className="card">
              <div style={{ fontWeight: 800, fontSize: 13, color: C.purple, marginBottom: 3 }}>{sc.label}</div>
              <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 14, letterSpacing: '-0.4px' }}>{sc.prod.rate}% <span style={{ fontSize: 13, color: C.gray, fontWeight: 400 }}>interest rate</span></div>
              {rows.map(([l, v, c]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px dashed ' + C.border, fontSize: 13 }}>
                  <span style={{ color: C.gray }}>{l}</span><strong style={{ color: c || C.black }}>{v}</strong>
                </div>
              ))}
              <div style={{ marginTop: 12, padding: '9px 12px', borderRadius: 10, fontSize: 12.5, fontWeight: 700, background: backDTI > 50 ? C.coralL : backDTI > 45 ? C.orangeL : C.greenL, color: backDTI > 50 ? C.coral : backDTI > 45 ? C.orange : C.green }}>
                DTI {pct(backDTI)} — {backDTI > 50 ? '✕ Exceeds limit' : backDTI > 45 ? '⚠ Needs comp factors' : '✓ Within guideline'}
              </div>
            </article>
          )
        })}
      </div>
    </main>
  )
}
