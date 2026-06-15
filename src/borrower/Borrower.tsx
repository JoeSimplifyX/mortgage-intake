import { useState, type CSSProperties, type ReactNode } from 'react'
import {
  C, PRODS, INITIAL_DATA, fmt, fmtK, pct, calcPI, calcEq5,
  type BorrowerData,
} from './data'
import ProfileMenu from '../ProfileMenu'

// ============================================================
//  SimplifyX™ Borrower Portal — pre-qualification flow.
//  Screens 0–7 ported from demo/prototype.html (borrower side).
// ============================================================

const TOTAL_STEPS = 7

interface ScreenProps {
  data: BorrowerData
  update: (patch: Partial<BorrowerData>) => void
  setStep: (n: number) => void
}

// ── Top navigation bar ───────────────────────────────────
function Nav({ data }: { data: BorrowerData }) {
  const name = `${data.firstName} ${data.lastName}`.trim() || 'Your account'
  const initials = ((data.firstName[0] || '') + (data.lastName[0] || '')).toUpperCase() || '·'
  return (
    <div className="app-nav" style={{ background: C.black, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: 64, flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 30, height: 30, borderRadius: 7, background: 'linear-gradient(135deg,#4646a8,#7c7cf0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✦</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: '#fff', lineHeight: 1 }}>SimplifyX™</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', letterSpacing: '.08em' }}>MORTGAGE</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,.35)' }}>📞 (800) 555-2947</span>
        <ProfileMenu name={name} initials={initials} active="borrower" onDark />
      </div>
    </div>
  )
}

// ── Shared building blocks ───────────────────────────────
function ProgBar({ step }: { step: number }) {
  return (
    <div className="pbar-wrap">
      <div className="pbar-fill" style={{ width: Math.round((step / TOTAL_STEPS) * 100) + '%' }} />
    </div>
  )
}

function QHead({ eyebrow, question, sub, icon }: { eyebrow?: string; question: ReactNode; sub?: string; icon?: string }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 22 }}>
      {icon && <div style={{ fontSize: 38, marginBottom: 10 }}>{icon}</div>}
      {eyebrow && <div style={{ fontSize: 11, fontWeight: 700, color: C.purple, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>{eyebrow}</div>}
      <h2 style={{ fontSize: 24, fontWeight: 800, color: C.black, lineHeight: 1.2, marginBottom: sub ? 8 : 0 }}>{question}</h2>
      {sub && <p style={{ fontSize: 14, color: C.gray, lineHeight: 1.6, maxWidth: 440, margin: '0 auto' }}>{sub}</p>}
    </div>
  )
}

function NavRow({ onBack, onNext, nextLabel, nextDisabled }: { onBack?: () => void; onNext: () => void; nextLabel?: string; nextDisabled?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 16, borderTop: '1px solid ' + C.border }}>
      {onBack ? <button className="btn-ghost" onClick={onBack}>← Back</button> : <div />}
      <button className="btn-primary" onClick={nextDisabled ? undefined : onNext} disabled={nextDisabled}>{nextLabel || 'Continue →'}</button>
    </div>
  )
}

function ChoiceCard({ icon, title, desc, selected, onClick }: { icon: string; title: string; desc?: string; selected: boolean; onClick: () => void }) {
  return (
    <button className={'choice-card ' + (selected ? 'selected' : 'unselected')} onClick={onClick}>
      <div style={{ width: 38, height: 38, borderRadius: 9, background: selected ? C.purple : C.neutral, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, transition: 'all .15s' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: selected ? C.purple : C.black }}>{title}</div>
        {desc && <div style={{ fontSize: 12, color: C.gray, marginTop: 2 }}>{desc}</div>}
      </div>
      <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid ' + (selected ? C.purple : C.border), background: selected ? C.purple : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, flexShrink: 0 }}>{selected ? '✓' : ''}</div>
    </button>
  )
}

function PlaidBtn({ connected, onConnect, label }: { connected: boolean; onConnect: () => void; label: string }) {
  return (
    <div className={'plaid-btn ' + (connected ? 'connected' : 'idle')} onClick={connected ? undefined : onConnect}>
      <div style={{ width: 38, height: 38, borderRadius: 9, background: connected ? C.teal : '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {connected
          ? <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>✓</span>
          : <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="7" width="5" height="9" rx="1" fill="white" /><rect x="7.5" y="3" width="5" height="13" rx="1" fill="white" opacity=".7" /><rect x="13" y="5" width="5" height="11" rx="1" fill="white" opacity=".5" /></svg>}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 13.5, color: connected ? C.tealD : C.black }}>{connected ? 'Connected to Plaid ✓' : label}</div>
        <div style={{ fontSize: 11.5, color: C.gray, marginTop: 2 }}>{connected ? 'Verified. No manual entry needed.' : 'Bank-level security · 256-bit encrypted · Instant'}</div>
      </div>
      {!connected && <span style={{ fontSize: 12, fontWeight: 700, color: C.blue, flexShrink: 0 }}>Connect →</span>}
    </div>
  )
}

function MoneyField({ label, value, onChange, placeholder }: { label: string; value: number; onChange: (n: number) => void; placeholder?: string }) {
  return (
    <div>
      <label className="lbl">{label}</label>
      <div className="money-wrap">
        <span className="dollar">$</span>
        <input className="inp inp-money" type="number" value={value || ''} placeholder={placeholder} onChange={(e) => onChange(+e.target.value)} />
      </div>
    </div>
  )
}

function TextField({ label, value, onChange, type, placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="lbl">{label}</label>
      <input className="inp" type={type || 'text'} value={value || ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

function Trust({ items }: { items: string[] }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginTop: 12 }}>
      {items.map((t) => (
        <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.gray }}>
          <span style={{ color: C.green }}>✓</span> {t}
        </div>
      ))}
    </div>
  )
}

// ─── Screen 0: Landing ───────────────────────────────────
function S0({ setStep }: ScreenProps) {
  const rates: [string, string, string][] = [
    ['30-Year Fixed', '6.875%', fmt(calcPI(340000, 6.875, 30))],
    ['15-Year Fixed', '6.125%', fmt(calcPI(340000, 6.125, 15))],
    ['FHA 30-Year', '6.500%', fmt(calcPI(340000, 6.5, 30))],
    ['5/1 ARM', '6.000%', fmt(calcPI(340000, 6.0, 30))],
  ]
  const colStyle: CSSProperties = { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.2fr', padding: '13px 18px', cursor: 'pointer', transition: '.12s' }
  return (
    <div>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#16161a 0%,#26266b 55%,#4646a8 100%)', padding: '52px 28px 68px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(124,124,240,.16)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1060, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 52, alignItems: 'center' }}>
          <div className="su">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'rgba(201,201,247,.18)', borderRadius: 20, fontSize: 11, fontWeight: 600, color: '#c9c9f7', marginBottom: 16, letterSpacing: '.04em' }}>✦ AI-Powered · Human-Verified</div>
            <h1 style={{ fontSize: 40, fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: 12, letterSpacing: '-.02em' }}>
              Your mortgage,<br /> <span style={{ color: '#c9c9f7' }}>without the headache.</span>
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,.55)', lineHeight: 1.7, maxWidth: 440, marginBottom: 30 }}>
              Connect your bank. Answer a few questions. Get pre-qualified in minutes — with real options and real numbers.
            </p>
            <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
              {([['$2.4B+', "Funded '25"], ['97%', 'Satisfaction'], ['~20 min', 'Pre-Qual'], ['47', 'States']] as [string, string][]).map(([v, l]) => (
                <div key={l}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#c9c9f7' }}>{v}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Lead card */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 26, boxShadow: '0 12px 40px rgba(0,0,0,.25)' }}>
            <h2 style={{ fontSize: 19, fontWeight: 800, marginBottom: 4 }}>Get your personalized rate</h2>
            <p style={{ fontSize: 12.5, color: C.gray, marginBottom: 18 }}>No credit score impact. Takes about 20 minutes.</p>
            <button className="btn-primary" style={{ width: '100%', padding: 14, fontSize: 15 }} onClick={() => setStep(1)}>Start My Pre-Qualification →</button>
            <Trust items={['No hard credit pull', '256-bit encrypted', 'No spam']} />
          </div>
        </div>
      </div>
      {/* Rates table */}
      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '36px 28px 20px' }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Today's rates</h2>
        <p style={{ color: C.gray, fontSize: 12.5, marginBottom: 16 }}>June 12, 2026 · $340K loan, 20% down, 740 FICO · Subject to change</p>
        <div style={{ background: '#fff', border: '1px solid ' + C.border, borderRadius: 13, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.2fr', padding: '9px 18px', background: C.bg, borderBottom: '1px solid ' + C.border }}>
            {['Loan Type', 'Rate', 'APR', 'Est. P&I/mo'].map((h) => (
              <div key={h} style={{ fontSize: 10, fontWeight: 700, color: C.gray, textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</div>
            ))}
          </div>
          {rates.map(([name, rate, mo], i) => (
            <div
              key={name}
              style={{ ...colStyle, borderBottom: i < rates.length - 1 ? '1px solid ' + C.border : 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = C.purpleLL)}
              onMouseLeave={(e) => (e.currentTarget.style.background = '')}
            >
              <div style={{ fontWeight: 600, fontSize: 14 }}>{name}</div>
              <div style={{ fontWeight: 800, fontSize: 15, color: C.purple }}>{rate}</div>
              <div style={{ fontSize: 12.5, color: C.gray }}>{(parseFloat(rate) + 0.116).toFixed(3)}%</div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{mo}/mo</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Screen 1: Purpose ───────────────────────────────────
function S1({ data, update, setStep }: ScreenProps) {
  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '24px 16px 60px' }}>
      <ProgBar step={1} />
      <QHead eyebrow="Let's get started" question="What would you like to do?" icon="🏡" />
      <ChoiceCard icon="🏡" title="Buy a home" desc="Purchase a primary, second, or investment property" selected={data.purpose === 'purchase'} onClick={() => update({ purpose: 'purchase' })} />
      <ChoiceCard icon="🔄" title="Refinance my mortgage" desc="Lower your rate or payment on your current home" selected={data.purpose === 'refi'} onClick={() => update({ purpose: 'refi' })} />
      <ChoiceCard icon="💰" title="Cash-out refinance" desc="Tap your home equity for renovations or other needs" selected={data.purpose === 'cashout'} onClick={() => update({ purpose: 'cashout' })} />
      <NavRow onBack={() => setStep(0)} onNext={() => setStep(2)} nextDisabled={!data.purpose} />
    </div>
  )
}

// ─── Screen 2: Property ──────────────────────────────────
function S2({ data, update, setStep }: ScreenProps) {
  const loan = Math.max(0, (data.price || 0) - (data.down || 0))
  const dnPct = data.price ? (data.down / data.price) * 100 : 0
  return (
    <div style={{ maxWidth: 540, margin: '0 auto', padding: '24px 16px 60px' }}>
      <ProgBar step={2} />
      <QHead eyebrow="The property" question="How much is the home?" sub="An estimate is fine — update it later." />
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="g2" style={{ marginBottom: 14 }}>
          <MoneyField label="Purchase price" value={data.price} onChange={(v) => update({ price: v })} placeholder="425,000" />
          <MoneyField label="Down payment" value={data.down} onChange={(v) => update({ down: v })} placeholder="85,000" />
        </div>
        {data.price > 0 && data.down > 0 && (
          <div className="pi" style={{ background: 'linear-gradient(135deg,' + C.purpleL + ',' + C.tealL + ')', borderRadius: 10, padding: '13px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {([[fmt(loan), 'Loan amount'], [pct(dnPct), 'Down'], [pct(100 - dnPct), 'LTV']] as [string, string][]).map(([v, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.purple }}>{v}</div>
                <div style={{ fontSize: 10.5, color: C.gray, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="card">
        <div className="g2">
          <div>
            <label className="lbl">Property type</label>
            <select className="inp sel" value={data.propType} onChange={(e) => update({ propType: e.target.value })}>
              {[['sfr', 'Single family home'], ['condo', 'Condo'], ['townhome', 'Townhome']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="lbl">How will you use it?</label>
            <select className="inp sel" value={data.occ} onChange={(e) => update({ occ: e.target.value })}>
              {[['primary', 'Primary residence'], ['second', 'Second home'], ['investment', 'Investment']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>
      </div>
      <NavRow onBack={() => setStep(1)} onNext={() => setStep(3)} nextDisabled={!data.price || !data.down} />
    </div>
  )
}

// ─── Screen 3: Contact ───────────────────────────────────
function S3({ data, update, setStep }: ScreenProps) {
  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '24px 16px 60px' }}>
      <ProgBar step={3} />
      <QHead eyebrow="About you" question="What's your name and email?" sub="We'll send your pre-qualification results here." />
      <div className="card">
        <div className="g2" style={{ marginBottom: 12 }}>
          <TextField label="First name" value={data.firstName} onChange={(v) => update({ firstName: v })} placeholder="Sarah" />
          <TextField label="Last name" value={data.lastName} onChange={(v) => update({ lastName: v })} placeholder="Chen" />
        </div>
        <div className="g2" style={{ marginBottom: 12 }}>
          <TextField label="Email address" value={data.email} onChange={(v) => update({ email: v })} type="email" placeholder="sarah@email.com" />
          <TextField label="Mobile phone" value={data.phone} onChange={(v) => update({ phone: v })} type="tel" placeholder="(404) 555-0192" />
        </div>
        <TextField label="Date of birth" value={data.dob} onChange={(v) => update({ dob: v })} type="date" />
      </div>
      <Trust items={['No spam', 'No credit impact', 'Unsubscribe anytime']} />
      <NavRow onBack={() => setStep(2)} onNext={() => setStep(4)} nextDisabled={!data.firstName || !data.email} />
    </div>
  )
}

// ─── Screen 4: Income ────────────────────────────────────
function S4({ data, update, setStep }: ScreenProps) {
  const gross = ((data.salary || 0) + (data.bonus || 0)) / 12
  const debts = (data.debtAuto || 0) + (data.debtStudent || 0) + (data.debtCC || 0)
  const pi = calcPI((data.price || 425000) - (data.down || 85000), 6.875, 30)
  const dti = gross > 0 ? ((pi + debts) / gross) * 100 : 0

  function connectPlaidIncome() {
    setTimeout(() => update({ plaidIncome: true, salary: 78400, bonus: 5680 }), 2000)
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px 60px' }}>
      <ProgBar step={4} />
      <QHead eyebrow="Your income" question="How do you earn your income?" sub="Connect your payroll for instant verification — no pay stubs needed yet." />
      <div className="card" style={{ marginBottom: 12 }}>
        <div>
          <label className="lbl">Employment type</label>
          <select className="inp sel" style={{ marginBottom: 12 }} value={data.empType} onChange={(e) => update({ empType: e.target.value })}>
            {[['w2', 'W-2 employee'], ['self', 'Self-employed / 1099'], ['retired', 'Retired'], ['military', 'Military / VA']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label className="lbl">Verify income instantly</label>
          <PlaidBtn connected={data.plaidIncome} onConnect={connectPlaidIncome} label="Connect payroll with Plaid" />
        </div>
        {data.plaidIncome ? (
          <div className="pi" style={{ background: C.tealL, border: '1.5px solid ' + C.teal, borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
            <div style={{ fontWeight: 700, color: C.tealD, marginBottom: 8, fontSize: 13 }}>✓ Income verified from Acme Corp</div>
            <div className="g3" style={{ fontSize: 12, gap: 10 }}>
              {([['Base salary', fmt(data.salary) + '/yr'], ['Overtime/bonus', fmt(data.bonus) + '/yr'], ['Monthly income', fmt(gross) + '/mo']] as [string, string][]).map(([l, v]) => (
                <div key={l}>
                  <div style={{ color: C.gray, fontSize: 10.5 }}>{l}</div>
                  <div style={{ fontWeight: 700, color: l === 'Monthly income' ? C.purple : C.black }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '10px 0', color: C.gray, fontSize: 12.5 }}>
              <div style={{ flex: 1, height: 1, background: C.border }} /><span>or enter manually</span><div style={{ flex: 1, height: 1, background: C.border }} />
            </div>
            <div className="g2">
              <MoneyField label="Annual base salary" value={data.salary} onChange={(v) => update({ salary: v })} placeholder="78,400" />
              <MoneyField label="Overtime / bonus" value={data.bonus} onChange={(v) => update({ bonus: v })} placeholder="5,680" />
            </div>
          </div>
        )}
      </div>
      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>Monthly debt payments</div>
        <p style={{ fontSize: 12.5, color: C.gray, marginBottom: 12 }}>Minimum payments only — don't include current rent.</p>
        <div className="g3">
          <MoneyField label="Auto loans" value={data.debtAuto} onChange={(v) => update({ debtAuto: v })} placeholder="350" />
          <MoneyField label="Student loans" value={data.debtStudent} onChange={(v) => update({ debtStudent: v })} placeholder="280" />
          <MoneyField label="Credit cards" value={data.debtCC} onChange={(v) => update({ debtCC: v })} placeholder="180" />
        </div>
        {gross > 0 && (
          <div style={{ marginTop: 12, padding: '10px 13px', background: C.purpleLL, borderRadius: 9, display: 'flex', gap: 20 }}>
            {([['Income', fmt(gross) + '/mo', C.purple], ['Debts', fmt(debts) + '/mo', C.black], ['Back DTI', pct(dti), dti > 45 ? C.orange : C.green]] as [string, string, string][]).map(([l, v, c]) => (
              <div key={l}>
                <div style={{ fontSize: 10.5, color: C.gray }}>{l}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: c }}>{v}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <NavRow onBack={() => setStep(3)} onNext={() => setStep(5)} nextDisabled={!data.salary && !data.plaidIncome} />
    </div>
  )
}

// ─── Screen 5: Pre-Qual — the "wow" screen ───────────────
function S5({ data, update, setStep }: ScreenProps) {
  const price = data.price || 425000
  const down = data.down || 85000
  const sliderLoan = data.sliderLoan || 340000
  const ltv = (sliderLoan / price) * 100

  const eligible = PRODS.filter((p) => {
    if ((data.fico || 742) < p.minFico) return false
    if (100 - ltv < p.minDown) return false
    return true
  })

  const selProd = eligible.find((p) => p.id === data.selectedProd) || eligible[0]
  const selPI = selProd ? calcPI(sliderLoan, selProd.rate, selProd.term) : 0
  const selPITI = selPI + (price * 0.0125) / 12 + (price * 0.004) / 12
  const selPMI = selProd?.pmi && ltv > 80 ? (sliderLoan * 0.006) / 12 : 0
  const selTotal = selPITI + selPMI
  const selEq5 = selProd ? down + calcEq5(sliderLoan, selProd.rate, selProd.term) : down

  const [open, setOpen] = useState<string | null>(null)

  const confettiColors = [C.purple, C.teal, C.green, C.orange, C.lavender]

  return (
    <div>
      <div style={{ height: 3, background: C.neutral }}>
        <div style={{ height: '100%', background: 'linear-gradient(90deg,' + C.purple + ',' + C.teal + ')', width: '60%', borderRadius: 2 }} />
      </div>
      {confettiColors.flatMap((c, ci) => [0, 1].map((j) => {
        const idx = ci * 2 + j
        return <div key={idx} className="confetti-piece" style={{ top: 48, left: 4 + idx * 6 + '%', background: c, animationDuration: 1.2 + idx * 0.1 + 's', animationDelay: idx * 0.06 + 's' }} />
      }))}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px 60px' }}>
        {/* Hero moment */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: C.black, letterSpacing: '-.01em', marginBottom: 6 }}>
            You pre-qualify for <span style={{ color: C.purple }}>{eligible.length} loan options!</span>
          </h2>
          <p style={{ fontSize: 14, color: C.gray, maxWidth: 460, margin: '0 auto' }}>Same numbers you'll see in your official Loan Estimate.</p>
        </div>
        {/* Live slider */}
        <div style={{ background: 'linear-gradient(135deg,#16161a,#26266b)', borderRadius: 15, padding: '18px 20px', marginBottom: 20, color: '#fff' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.4)', marginBottom: 8 }}>Drag to explore different loan amounts</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)' }}>Loan amount</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#c9c9f7' }}>{fmt(Math.round(sliderLoan))}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)' }}>Est. total payment</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: C.teal }}>{fmt(Math.round(selTotal))}/mo</div>
            </div>
          </div>
          <input type="range" min={50000} max={750000} step={5000} value={sliderLoan} style={{ width: '100%', accentColor: C.teal, cursor: 'pointer' }} onChange={(e) => update({ sliderLoan: +e.target.value })} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'rgba(255,255,255,.25)', marginTop: 3 }}>
            <span>$50K</span><span>$750K</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, borderTop: '1px solid rgba(255,255,255,.1)', paddingTop: 13, marginTop: 13 }}>
            {([[fmt(Math.round(selPI)), 'P&I payment'], [fmt(Math.round(selPITI - selPI)), 'Tax & insurance'], [fmt(Math.round(selEq5)), '5-yr equity']] as [string, string][]).map(([v, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginBottom: 2 }}>{l}</div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Product cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 13, marginBottom: 20 }}>
          {eligible.map((pr) => {
            const mo = calcPI(sliderLoan, pr.rate, pr.term)
            const piti2 = mo + (price * 0.0125) / 12 + (price * 0.004) / 12
            const pmi2 = pr.pmi && ltv > 80 ? (sliderLoan * 0.006) / 12 : 0
            const mip2 = pr.mip ? (sliderLoan * 0.0055) / 12 : 0
            const total2 = piti2 + pmi2 + mip2
            const eq5 = down + calcEq5(sliderLoan, pr.rate, pr.term)
            const totalInt = Math.max(0, mo * pr.term * 12 - sliderLoan)
            const isSel = data.selectedProd === pr.id
            const isOpen = open === pr.id
            const lines: [string, string][] = [
              ['P&I', fmt(Math.round(mo))],
              ['Property taxes', fmt(Math.round((price * 0.0125) / 12))],
              ["Homeowner's insurance", fmt(Math.round((price * 0.004) / 12))],
            ]
            if (pmi2 > 0) lines.push(['PMI (removed at 80% LTV)', fmt(Math.round(pmi2))])
            if (mip2 > 0) lines.push(['FHA annual MIP', fmt(Math.round(mip2))])
            return (
              <div key={pr.id} className={'prod-card' + (isSel ? ' selected' : '')} onClick={() => update({ selectedProd: pr.id })}>
                {isSel && <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: C.purple, color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 12px', borderRadius: 9, whiteSpace: 'nowrap' }}>✓ Selected</div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 11 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: C.black }}>{pr.name}</div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: pr.tagC + '18', color: pr.tagC, marginTop: 3, display: 'inline-block' }}>{pr.tag}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: C.purple }}>{fmt(Math.round(total2))}<span style={{ fontSize: 10.5, color: C.gray, fontWeight: 400 }}>/mo</span></div>
                    <div style={{ fontSize: 10, color: C.gray }}>incl. tax & ins</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 11 }}>
                  {([['Rate', pr.rate + '%'], ['APR', pr.apr + '%'], ['5-yr equity', fmtK(Math.round(eq5))], ['Total interest', fmtK(Math.round(totalInt))]] as [string, string][]).map(([l, v]) => (
                    <div key={l} style={{ background: C.bg, borderRadius: 7, padding: '6px 8px' }}>
                      <div style={{ fontSize: 10, color: C.gray }}>{l}</div>
                      <div style={{ fontWeight: 700, fontSize: 12.5 }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: C.dgray, lineHeight: 1.5, marginBottom: 9, borderTop: '1px solid ' + C.border, paddingTop: 9 }}>{pr.who}</div>
                <button style={{ width: '100%', padding: 6, border: '1px solid ' + C.border, borderRadius: 7, background: 'none', fontSize: 12, fontWeight: 600, color: C.gray, cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setOpen(isOpen ? null : pr.id) }}>
                  {isOpen ? 'Hide details ↑' : 'See full breakdown ↓'}
                </button>
                {isOpen && (
                  <div className="su" style={{ marginTop: 9, paddingTop: 9, borderTop: '1px solid ' + C.border }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: C.dgray, marginBottom: 6 }}>What's in {fmt(Math.round(total2))}/mo</div>
                    {lines.map(([l, v]) => (
                      <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed ' + C.border, fontSize: 12 }}>
                        <span style={{ color: C.dgray }}>{l}</span><strong>{v}</strong>
                      </div>
                    ))}
                    <div style={{ marginTop: 8 }}>
                      {pr.pros.map((p2) => (
                        <div key={p2} style={{ display: 'flex', gap: 5, fontSize: 12, marginBottom: 3 }}>
                          <span style={{ color: C.green }}>✓</span><span style={{ color: C.dgray }}>{p2}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        {/* LE notice */}
        <div style={{ background: 'linear-gradient(135deg,' + C.purpleL + ',' + C.tealL + ')', border: '1px solid ' + C.lavender, borderRadius: 13, padding: '16px 18px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 26, flexShrink: 0 }}>📋</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>These numbers match your official Loan Estimate</div>
            <p style={{ fontSize: 12.5, color: C.dgray, lineHeight: 1.55 }}>Payment breakdowns use real rates and the same methodology as your federally-required LE. Your loan officer will issue the official Loan Estimate within 3 business days.</p>
          </div>
        </div>
        {/* Bottom nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn-ghost" onClick={() => setStep(4)}>← Back</button>
          {selProd && <div style={{ textAlign: 'center', fontSize: 12, color: C.gray }}>{selProd.name} · {fmt(Math.round(selTotal))}/mo</div>}
          <button className="btn-primary" style={{ fontSize: 15, padding: '13px 28px' }} onClick={() => setStep(6)}>Start Full Application →</button>
        </div>
      </div>
    </div>
  )
}

// ─── Screen 6: Assets / Plaid ────────────────────────────
function S6({ data, update, setStep }: ScreenProps) {
  const price = data.price || 425000
  const down = data.down || 85000
  const needed = down + Math.round(price * 0.025)
  const total = (data.plaidAccounts || []).reduce((s, a) => s + a.bal, 0)
  const liquid = (data.plaidAccounts || []).filter((a) => a.t !== 'Investment').reduce((s, a) => s + a.bal, 0)

  function connectPlaidAssets() {
    setTimeout(() => update({
      plaidAssets: true,
      plaidAccounts: [
        { t: 'Checking', n: 'Chase Total Checking', mask: '4891', bal: 42800 },
        { t: 'Savings', n: 'Chase Savings', mask: '2204', bal: 28500 },
        { t: 'Investment', n: 'Fidelity 401(k)', mask: '7823', bal: 89200 },
      ],
    }), 2000)
  }

  return (
    <div style={{ maxWidth: 540, margin: '0 auto', padding: '24px 16px 60px' }}>
      <ProgBar step={6} />
      <QHead eyebrow="Verify your assets" question="Show us your down payment funds" sub="Connect your bank accounts for instant, paperless verification." />
      <div className="card" style={{ marginBottom: 12 }}>
        <PlaidBtn connected={data.plaidAssets} onConnect={connectPlaidAssets} label="Connect bank accounts with Plaid" />
        {data.plaidAssets && data.plaidAccounts.length > 0 && (
          <div className="su" style={{ marginTop: 14 }}>
            <div className="g3" style={{ marginBottom: 13 }}>
              {([[fmt(total), 'Total assets'], [fmt(liquid), 'Liquid'], [total >= needed ? '✓ Sufficient' : '⚠ Review', 'Down + closing']] as [string, string][]).map(([v, l], i) => (
                <div key={l} style={{ background: C.bg, borderRadius: 9, padding: '10px 11px', textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: i === 2 && total >= needed ? C.green : i === 2 ? C.orange : C.purple }}>{v}</div>
                  <div style={{ fontSize: 10, color: C.gray, marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
            {data.plaidAccounts.map((a) => (
              <div key={a.mask} style={{ display: 'flex', gap: 11, alignItems: 'center', padding: '10px 12px', background: C.bg, borderRadius: 9, marginBottom: 7 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: a.t === 'Checking' ? C.purple : a.t === 'Savings' ? C.teal : C.blue, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                  {a.t === 'Checking' ? '🏦' : a.t === 'Savings' ? '💰' : '📈'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{a.n}</div>
                  <div style={{ fontSize: 11, color: C.gray }}>•••• {a.mask} · {a.t}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{fmt(a.bal)}</div>
                  <div style={{ fontSize: 10, color: C.tealD, fontWeight: 700 }}>✓ Plaid verified</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {!data.plaidAssets && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '13px 0', color: C.gray, fontSize: 12.5 }}>
              <div style={{ flex: 1, height: 1, background: C.border }} /><span>or enter manually</span><div style={{ flex: 1, height: 1, background: C.border }} />
            </div>
            {['🏦|Checking|Chase Bank|42,800', '💰|Savings|Chase Bank|28,500', '📈|401(k)|Fidelity|89,200'].map((s) => {
              const [ico, t, inst, bal] = s.split('|')
              return (
                <div key={t} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 12px', border: '1px solid ' + C.border, borderRadius: 9, marginBottom: 7 }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{ico}</span>
                  <div style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{t} · {inst}</div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>${bal}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 15px', background: C.purpleLL, borderRadius: 10, border: '1px solid ' + C.lavender, marginBottom: 12 }}>
        <span style={{ fontSize: 15, flexShrink: 0 }}>ℹ️</span>
        <p style={{ fontSize: 12.5, color: C.dgray, lineHeight: 1.6 }}>
          <strong>Why we verify assets: </strong>
          Lenders confirm you have enough for the down payment ({fmt(down)}) plus closing costs (est. {fmt(Math.round(price * 0.025))}). Plaid is faster and more secure than uploading paper statements.
        </p>
      </div>
      <NavRow onBack={() => setStep(5)} onNext={() => setStep(7)} />
    </div>
  )
}

// ─── Screen 7: Done ──────────────────────────────────────
function S7({ data, setStep }: ScreenProps) {
  const rows: [string, string][] = [
    ['Application #', 'LN-2026-1001'],
    ['Status', 'Under review'],
    ['Next step', 'Official LE in 3 biz days'],
    ['Income', data.plaidIncome ? '✓ Plaid verified' : 'Manual entry'],
    ['Assets', data.plaidAssets ? '✓ Plaid verified' : 'Manual entry'],
  ]
  return (
    <div style={{ maxWidth: 460, margin: '0 auto', padding: '36px 16px 60px', textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,' + C.purple + ',' + C.teal + ')', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, margin: '0 auto 18px' }}>🎉</div>
      <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 10, letterSpacing: '-.01em' }}>Application submitted!</h2>
      <p style={{ fontSize: 14, color: C.gray, lineHeight: 1.7, marginBottom: 22 }}>Your loan officer will review your file and send your official Loan Estimate within 3 business days.</p>
      <div className="card" style={{ textAlign: 'left', marginBottom: 18 }}>
        {rows.map(([l, v]) => (
          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid ' + C.border, fontSize: 13 }}>
            <span style={{ color: C.gray }}>{l}</span>
            <strong style={{ color: v.includes('✓') ? C.green : C.black }}>{v}</strong>
          </div>
        ))}
      </div>
      <button className="btn-primary" style={{ width: '100%', padding: 13, marginBottom: 8 }}>Download Pre-Qual Letter</button>
      <button className="btn-ghost" style={{ width: '100%' }} onClick={() => setStep(0)}>Start Over</button>
    </div>
  )
}

// ── Flow container ───────────────────────────────────────
const SCREENS = [S0, S1, S2, S3, S4, S5, S6, S7]

export default function Borrower() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<BorrowerData>(INITIAL_DATA)
  const update = (patch: Partial<BorrowerData>) => setData((d) => ({ ...d, ...patch }))

  const Screen = SCREENS[Math.min(step, SCREENS.length - 1)]

  return (
    <div className="app-shell">
      <Nav data={data} />
      <div className="app-main">
        <div className="app-view">
          <div className="su" key={step}>
            <Screen data={data} update={update} setStep={setStep} />
          </div>
        </div>
      </div>
    </div>
  )
}
