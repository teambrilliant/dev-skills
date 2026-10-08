import { describe, expect, test } from 'claude-code/testing'

import { wrapFor } from '../hooks/ui'

describe('wrapFor', () => {
  test('prose wraps; box-drawing lines truncate so the picture stays intact', async () => {
    expect(wrapFor('- Fine in Codex: the mod runs only inside Claude Code; Codex only sees the skills')).toBe('wrap')
    expect(wrapFor('├─ Phase 1: Stripe client        [layer: outbound I/O]')).toBe('truncate-end')
    expect(wrapFor(' browser ──POST /invoices──► API')).toBe('truncate-end')
  })
})
