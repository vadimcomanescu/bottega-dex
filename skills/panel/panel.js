export const meta = {
  name: 'panel',
  description: 'Fan one task to independent frontier panelists, blind, judge, return the comparison',
  phases: [{ title: 'Draft' }, { title: 'Judge' }],
}

const PANELIST = {
  type: 'object',
  required: ['draft', 'claims', 'assumptions', 'would_change'],
  properties: {
    draft: { type: 'string', description: 'the complete answer, self-contained' },
    claims: { type: 'array', items: { type: 'string' }, description: 'claims the draft stands on' },
    assumptions: { type: 'array', items: { type: 'string' } },
    would_change: { type: 'array', items: { type: 'string' }, description: 'what would change this answer' },
  },
}

const JUDGE = {
  type: 'object',
  required: ['consensus', 'contradictions', 'partial_coverage', 'unique_insights', 'blind_spots'],
  properties: {
    consensus: { type: 'array', items: { type: 'string' }, description: 'where the drafts agree, with the evidence' },
    contradictions: { type: 'array', items: { type: 'string' }, description: 'where they disagree, quoting each side' },
    partial_coverage: { type: 'array', items: { type: 'string' }, description: 'what each draft covers only partly' },
    unique_insights: { type: 'array', items: { type: 'string' }, description: 'what only one draft saw' },
    blind_spots: { type: 'array', items: { type: 'string' }, description: 'what no draft addressed' },
  },
}

phase('Draft')
// Barrier is correct here: the judge needs every draft before it can compare.
const [a, b] = await parallel([
  // Panelist A — gpt-5.6-sol at ultra: a cheap agent executes the pinned headless codex
  // command and returns its answer parsed to PANELIST.
  () => agent(`Run the pinned headless codex command from skills/run/references/codex-dispatch.md — model gpt-5.6-sol, effort ultra, read-only, bounded — passing the task below verbatim, then return its answer in the schema.\n\nTask:\n${args.task}`,
              { label: 'panelist:sol', model: 'sonnet', effort: 'low', schema: PANELIST }),
  // Panelist B — fable at xhigh, the panelist identity.
  () => agent(args.task, { label: 'panelist:fable', agentType: 'bottega-panelist', model: 'fable', schema: PANELIST }),
])

// Blind in code: fixed labels, model names never reach the judge.
const blinded = `Task:\n${args.task}\n\nDraft A:\n${a.draft}\n\nDraft B:\n${b.draft}`

phase('Judge')
const judge = await agent(`${blinded}\n\nCompare draft A and draft B.`,
  { label: 'judge', agentType: 'bottega-panel-judge', model: 'fable', schema: JUDGE })

return { A: a, B: b, judge }
