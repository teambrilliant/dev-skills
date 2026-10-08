import { describe, expect, test } from 'claude-code/testing'

import { markdownOf, wrapFor } from '../hooks/ui'

describe('wrapFor', () => {
  test('prose wraps; box-drawing lines truncate so the picture stays intact', async () => {
    expect(wrapFor('- Fine in Codex: the mod runs only inside Claude Code; Codex only sees the skills')).toBe('wrap')
    expect(wrapFor('├─ Phase 1: Stripe client        [layer: outbound I/O]')).toBe('truncate-end')
    expect(wrapFor(' browser ──POST /invoices──► API')).toBe('truncate-end')
  })
})

describe('markdownOf', () => {
  test('bullets stay prose; a run of drawing lines is fenced so it keeps its shape', async () => {
    const lines = ['- Building: a thing', '- Risk: replay', '', 'Plan: x', '├─ Phase 1', '└─ Phase 2', '', 'Full plan → a.md']
    expect(markdownOf(lines)).toBe('- Building: a thing\n- Risk: replay\n\nPlan: x\n```\n├─ Phase 1\n└─ Phase 2\n```\n\nFull plan → a.md')
  })

  test('a body with its own fences passes through', async () => {
    expect(markdownOf(['```', ' a ──► b', '```'])).toBe('```\n a ──► b\n```')
  })
})
