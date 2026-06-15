import { useState } from 'react'
import Sidebar, { type Page } from './components/Sidebar'
import Topbar from './components/Topbar'
import AgentPanel, { AgentToggle } from './components/AgentPanel'
import {
  PipelinePage,
  BriefingPage,
  ActionsPage,
  ConditionsPage,
  FreshnessPage,
  StructuringPage,
} from './components/Pages'
import { PIPELINE } from './lib'

// Page → agentic-layer key (see AGENT_DATA in agentData.ts)
const AGENT_KEY: Record<Page, string> = {
  pipeline: 'pipeline',
  briefing: 'wb_briefing',
  actions: 'wb_actions',
  conditions: 'wb_conditions',
  freshness: 'wb_freshness',
  structuring: 'wb_calculator',
}

export default function LoanOfficer() {
  const [page, setPage] = useState<Page>('pipeline')
  const [loanId, setLoanId] = useState(PIPELINE[0].id)
  const [agentOpen, setAgentOpen] = useState(false)

  const loan = PIPELINE.find((l) => l.id === loanId) ?? PIPELINE[0]

  function selectLoan(id: string) {
    setLoanId(id)
    setPage('briefing')
  }

  return (
    <div className="app">
      <Sidebar page={page} onNavigate={setPage} loan={loan} />

      <div className="main">
        <Topbar />
        {page === 'pipeline' && <PipelinePage onSelect={selectLoan} />}
        {page === 'briefing' && <BriefingPage loan={loan} />}
        {page === 'actions' && <ActionsPage />}
        {page === 'conditions' && <ConditionsPage loan={loan} />}
        {page === 'freshness' && <FreshnessPage />}
        {page === 'structuring' && <StructuringPage loan={loan} />}
      </div>

      <AgentPanel agentKey={AGENT_KEY[page]} open={agentOpen} onClose={() => setAgentOpen(false)} />
      <AgentToggle open={agentOpen} onToggle={() => setAgentOpen((o) => !o)} />
    </div>
  )
}
