import { AGENT_COLORS, AGENT_DATA } from '../agentData'

export default function AgentPanel({ agentKey, open, onClose }: { agentKey: string; open: boolean; onClose: () => void }) {
  const data = AGENT_DATA[agentKey] || AGENT_DATA['pipeline']

  return (
    <div id="agent-panel" className={open ? 'open' : ''}>
      <div id="agent-panel-head">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg,#4646a8,#7c7cf0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🤖</div>
            <div style={{ fontWeight: 800, fontSize: 13.5, color: '#16161a' }}>Agentic Layer</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 16, color: '#6f7480', cursor: 'pointer', padding: '2px 5px' }}>✕</button>
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#4646a8', background: '#dcdcfa', padding: '3px 9px', borderRadius: 5, display: 'inline-block' }}>{data.title}</div>
        <div style={{ marginTop: 7, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {data.steps.map((s) => <span key={s} style={{ fontSize: 10, fontWeight: 700, background: '#16161a', color: '#c9c9f7', padding: '2px 8px', borderRadius: 4 }}>{s}</span>)}
        </div>
      </div>

      <div id="agent-panel-body">
        <div className="ap-section">
          <div className="ap-section-title">Active agents at this step</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 14 }}>
            {data.agents.map((a, i) => {
              const ac = AGENT_COLORS[a.type]
              return <span key={i} className={'agent-tag ' + a.type} style={{ background: ac.bg, color: ac.c }}>{ac.label}</span>
            })}
          </div>
        </div>

        <div className="ap-section">
          <div className="ap-section-title">What each agent does here</div>
          {data.agents.map((a, i) => {
            const ac = AGENT_COLORS[a.type]
            return (
              <div key={i} className="action-row">
                <div className="action-row-head" style={{ background: ac.bg }}>
                  <span className={'agent-tag ' + a.type} style={{ margin: 0, background: 'transparent', color: ac.c }}>{ac.label}</span>
                </div>
                <div className="action-row-body">{a.action}</div>
              </div>
            )
          })}
        </div>

        <div className="ap-divider" />

        {data.hitl && (
          <div className="ap-section">
            <div className="ap-section-title">✋ Human-in-the-loop gate</div>
            <div className="hitl-box">
              <div style={{ fontWeight: 700, fontSize: 11.5, color: '#15803d', marginBottom: 3 }}>Human oversight required:</div>
              <div style={{ fontSize: 12, color: '#166534', lineHeight: 1.6 }}>{data.hitl}</div>
            </div>
          </div>
        )}

        {data.apis.length > 0 && (
          <>
            <div className="ap-divider" />
            <div className="ap-section">
              <div className="ap-section-title">🔗 API integrations</div>
              <div style={{ marginBottom: 10 }}>{data.apis.map((a, i) => <span key={i} className="api-pill">{a}</span>)}</div>
            </div>
          </>
        )}

        {data.compliance.length > 0 && (
          <div className="ap-section">
            <div className="ap-section-title">⚖ Compliance guardrails</div>
            <div style={{ marginBottom: 10 }}>{data.compliance.map((c, i) => <span key={i} className="comp-pill">{c}</span>)}</div>
          </div>
        )}

        <div className="ap-divider" />
        <div className="ap-section">
          <div style={{ fontSize: 11.5, color: '#6f7480', lineHeight: 1.6, padding: '8px 12px', background: '#faf9fe', borderRadius: 8, border: '1px solid #c9c9f7' }}>
            <strong style={{ color: '#4646a8' }}>Design principle:</strong> Agents gather, analyze, draft, and recommend — humans review, approve, and decide. No agent autonomously makes a credit decision, issues a denial, or approves a disclosure.
          </div>
        </div>
      </div>
    </div>
  )
}

export function AgentToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return <button id="agent-toggle" className={open ? 'panel-open' : ''} onClick={onToggle}>🤖<span>AGENTS</span></button>
}
