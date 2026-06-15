// ============================================================
//  Agentic-layer reference data (Loan Officer scope).
//  Keys: wb_<tab> (workbench tabs) and pipeline.
// ============================================================
export type AgentType = 'voice' | 'rag' | 'doc' | 'chat' | 'web' | 'ui' | 'workflow'

export interface AgentEntry { type: AgentType; label: string; action: string }
export interface AgentStep {
  title: string
  agents: AgentEntry[]
  hitl: string
  apis: string[]
  compliance: string[]
  steps: string[]
}

export const AGENT_COLORS: Record<AgentType, { bg: string; c: string; label: string }> = {
  voice: { bg: '#ede8fc', c: '#5b21b6', label: '🎙 Voice Agent' },
  rag: { bg: '#dff4fb', c: '#086789', label: '📚 RAG Agent' },
  doc: { bg: '#fce4f3', c: '#9d174d', label: '📄 Doc Agent' },
  chat: { bg: '#ccfbf1', c: '#0d9488', label: '💬 Chat Agent' },
  web: { bg: '#fef3c7', c: '#92400e', label: '🌐 Web Agent' },
  ui: { bg: '#e0f7fa', c: '#086789', label: '🖥 UI Agent' },
  workflow: { bg: '#f1f5f9', c: '#475569', label: '⚙ Workflow Agent' },
}

export const AGENT_DATA: Record<string, AgentStep> = {
  wb_briefing: {
    title: 'I3.1 — AI Pre-Review & Risk Flag Summary',
    agents: [
      { type: 'workflow', label: 'Workflow Agent', action: 'Prepares complete underwriting package for human review. Pulls all loan data from LOS, assembles documents, and orchestrates the pre-review generation. Routes decision downstream: Conditional Approval → triggers borrower outreach + third-party ordering; Suspended → notifies processor + MLO only; Denied → generates Adverse Action Notice draft for MLO review.' },
      { type: 'rag', label: 'RAG Agent', action: 'Generates Underwriting Pre-Review Summary — a single-page executive brief covering: loan summary, income analysis, asset analysis, credit analysis, collateral summary, risk flags, and conditions status. Applies loan-type-specific rules: FHA (flip rule, MIP, community property), VA (COE verification, funding fee, MPRs), USDA (geographic eligibility, income limits), Conventional (PMI threshold, seller concession limits). Every cited number links to the source document and page.' },
      { type: 'doc', label: 'Doc Agent', action: 'Performs automated compliance checks: TRID tolerance (LE vs. CD comparison), HMDA data accuracy, QM/ATR safe harbor verification (DTI within limits, no negative amortization, loan term ≤30 years, points and fees within 3% threshold).' },
    ],
    hitl: 'Underwriter is the SOLE credit decision maker. Agent never approves, suspends, or denies. Underwriter reviews every document and validates every data point — the pre-review is a starting point, not a substitute for underwriter judgment. Adverse Action Notice requires MLO review before delivery to borrower.',
    apis: ['FNMA Collateral Underwriter (CU) score — appraisal risk', 'LexisNexis FraudGuard — identity + fraud verification', 'OFAC/SDN re-screening (required before closing)'],
    compliance: ['ATR/QM: Reg Z §1026.43 — Ability to Repay verification', 'HMDA: Reg C — data accuracy before submission', 'ECOA/Reg B §1002.9 — Adverse Action Notice within 30 days'],
    steps: ['I3.1', 'I3.2'],
  },
  wb_actions: {
    title: 'I2.0 — Daily Prioritized Action List',
    agents: [
      { type: 'workflow', label: 'Workflow Agent', action: 'Generates the Daily Prioritized Action List for each processor overnight. Rank-orders by urgency: P1 (expiring 48h — rate locks, doc windows, closing dates with open conditions), P2 (auto-clearable — conditions matched to documents already in file), P3 (borrower outreach — missing docs with pre-drafted messages), P4 (third-party pending — appraisals, title, flood certs, transcripts). Eliminates the 30–60 min manual triage processors spend every morning opening every file.' },
      { type: 'rag', label: 'RAG Agent', action: 'Enriches each action item with context: flags approaching rate lock expiry, complex income scenarios, first-time homebuyer nuances. Auto-matches AUS conditions to documents already uploaded — presents one-click processor confirmation rather than manual search across 200+ documents per file.' },
      { type: 'ui', label: 'UI Agent', action: 'Renders the action list as an interactive dashboard. Processor can expand any item, click to open the file, approve auto-clearances, send borrower outreach, or reassign to another processor. Shows real-time pipeline stats: total files, files in UW, files pending conditions, projected closings this week.' },
    ],
    hitl: 'Processor reviews top-down and validates every recommendation. Agent sorts, matches, and drafts — processor approves. Processor can override any priority ranking at any time with documented rationale.',
    apis: ['LOS workflow engine — condition tracking + document matching', 'Twilio / SendGrid — pre-drafted outreach delivery on approval'],
    compliance: [],
    steps: ['I2.0'],
  },
  wb_conditions: {
    title: 'I2.3 + B4.1 — AUS Conditions Mapping & Resolution',
    agents: [
      { type: 'workflow', label: 'Workflow Agent', action: 'Packages loan data in MISMO XML and submits to Fannie Mae DU or Freddie Mac LPA. Receives AUS findings. Builds prioritized conditions tracker with deadlines calibrated to target closing date. Auto-checks off conditions as documents are uploaded and validated. Sends borrower reminders for outstanding items.' },
      { type: 'rag', label: 'RAG Agent', action: 'Parses AUS conditions and maps each to: (a) a document already collected and auto-satisfies if on file, (b) a document needed from borrower — triggers Chat Agent outreach, or (c) a third-party verification to order — triggers Web Agent. Validates each condition against FNMA Selling Guide, FHA 4000.1, or VA Handbook.' },
      { type: 'doc', label: 'Doc Agent', action: 'Auto-generates templated documents for conditions where possible: gift letter template (pre-filled with borrower name, donor name, amount), LOE (Letter of Explanation) template, authorization forms. Validates format and completeness of borrower-submitted condition responses.' },
      { type: 'chat', label: 'Chat Agent', action: 'Translates underwriter conditions into plain English for borrower: instead of "Provide LOE for 2/15/25 deposit of $12,400 to Chase account ending 4521" — borrower sees "We noticed a $12,400 deposit on Feb 15th. Can you tell us where that came from?"' },
    ],
    hitl: 'Processor reviews each condition response before marking as satisfied. Agent collects and validates format/completeness — human processor confirms the condition is actually met (e.g., the gift letter has the right donor, the LOE is credible). AUS Refer/Caution or Ineligible: processor and MLO determine path forward — agent cannot make this determination.',
    apis: ['FNMA DU / FHLMC LPA — MISMO XML AUS submission', 'AUS returns: Approve/Eligible, Refer/Caution, Ineligible + conditions list'],
    compliance: ['FNMA Selling Guide B3-2-01 — AUS decision review', 'Reg B — processor cannot deny based on AUS alone if manual underwriting is possible'],
    steps: ['I2.3', 'B4.1'],
  },
  wb_freshness: {
    title: 'B2.4 — Document Freshness Monitor (Continuous)',
    agents: [
      { type: 'workflow', label: 'Workflow Agent', action: 'Runs a continuous Document Freshness Monitor across all active files. Tracks validity windows for every document type and proactively triggers re-collection BEFORE expiry: pay stubs alert at Day 23 (7 days before 30-day expiry), bank statements alert at Day 50 (10 days before 60-day expiry), credit report alerts at Day 100 (20 days before 120-day expiry), VOE auto-ordered at T-12 business days from closing.' },
      { type: 'chat', label: 'Chat Agent', action: 'Sends proactive re-collection requests to borrower 7 days before any document expires: "Hi Sarah, your pay stub from April 15 will expire on May 15. Can you upload your most recent pay stub? Just take a photo and upload here: [link]." Eliminates discovering expired documents the day before closing.' },
    ],
    hitl: 'Not required for standard re-collection (agent handles proactively). Required if: critical document (credit report, appraisal) is about to expire and closing cannot occur before expiry — processor and MLO must decide whether to re-pull credit or request appraisal update.',
    apis: ['LOS document registry — validity window tracking', 'Twilio — automated re-collection SMS/email', 'Equifax Work Number — auto-ordered final VOE at T-12 business days'],
    compliance: ['FNMA B1-1-03 — credit report valid 120 days', 'FNMA B3-3.1-01 — income docs no more than 120 days old at note date', 'FNMA B3-3.1-07 — final VOE within 10 business days of note date'],
    steps: ['B2.4'],
  },
  wb_calculator: {
    title: 'I1.2 — Scenario Structuring for Complex Deals',
    agents: [
      { type: 'rag', label: 'RAG Agent', action: 'Answers complex structuring questions in natural language: "Can this borrower use rental income from their investment property to qualify?" Agent searches FNMA Selling Guide B3-3 and returns the specific guideline answer with section citation. Covers: self-employed income calculation, non-occupant co-borrower eligibility, gift fund requirements, community property state debt rules, non-QM parameters.' },
      { type: 'doc', label: 'Doc Agent', action: 'Generates comparison worksheets: side-by-side product comparison (conventional vs. FHA vs. portfolio), rate/payment scenarios at different loan amounts, closing cost estimates under different structures. Produces income calculation worksheets with every source cited to the specific document, page, and line item.' },
    ],
    hitl: 'MLO makes all structuring decisions. Agent provides data and guideline answers — MLO determines the best loan structure for the borrower. Agent never recommends a specific product; it presents options with pros/cons and the applicable guidelines.',
    apis: ['PPE — rate scenario modeling', 'RAG index: FNMA Selling Guide, FHA 4000.1, VA Handbook, CU-specific overlays'],
    compliance: ['FNMA Selling Guide B3-3 — income calculation methodology', 'QM/ATR Reg Z §1026.43 — DTI and fee thresholds'],
    steps: ['I1.2', 'I2.2'],
  },
  pipeline: {
    title: 'I1.1 — Pipeline Dashboard & Lead Intelligence',
    agents: [
      { type: 'ui', label: 'UI Agent', action: 'Presents MLO/processor pipeline dashboard: active loans by stage, alerts requiring attention (approval gates, lock expirations, overdue conditions), loan-level risk indicators (DTI elevated, appraisal risk, rate lock expiration approaching).' },
      { type: 'rag', label: 'RAG Agent', action: "Generates daily pipeline briefing: \"You have 8 active loans. 3 need attention today: James Patel's rate lock expires in 2 days, Amanda Foster's bank statements are 4 days outstanding, Emily Rodriguez's appraisal ETA has passed.\" Provides context for each flag." },
      { type: 'workflow', label: 'Workflow Agent', action: 'Routes all human-in-the-loop approval requests to the correct loan officer: pre-qual letters, rate lock approvals, LE approvals, complex scenario escalations. Monitors SLA timers and escalates overdue items.' },
    ],
    hitl: 'Pipeline view is informational. Action items from the pipeline route to the Action List tab for processor approval. Rate lock extensions and LE approvals require MLO sign-off.',
    apis: ['LOS (Encompass / MeridianLink / nCino) — real-time pipeline data', 'Push alerts: lock expiration, condition deadlines, appraisal receipt'],
    compliance: ['TRID compliance clock monitoring — 3-day LE, 3-day CD waiting periods'],
    steps: ['I1.1', 'I2.0'],
  },
}
