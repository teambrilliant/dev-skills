import { describe, expect, test } from 'claude-code/testing'

import { parsePlan, progressOf, shortName, ticksOf } from '../hooks/plan'
import { PLANS } from './fixtures/fixtures.gen'

describe('parsePlan', () => {
  test('phases and Final Verification, with their checks; other sections ignored', async () => {
    const plan = parsePlan(PLANS.midrun)
    expect(plan?.title).toBe('Billing invoices')
    expect(plan?.phases.map(phase => [shortName(phase), phase.layer, phase.items.length])).toEqual([
      ['P1', 'outbound I/O, State', 2],
      ['P2', 'Function', 2],
      ['P3', 'UI', 1],
      ['Final', null, 2],
    ])
  })

  test('the command is the backticked span an item starts with; prose items have none', async () => {
    const final = parsePlan(PLANS.midrun)?.phases.at(-1)
    expect(final?.items.map(item => item.command)).toEqual(['pnpm test', null])
  })

  test('current phase is the first with an unticked item; resume is its first unticked item', async () => {
    const plan = parsePlan(PLANS.midrun)
    const progress = plan === undefined ? undefined : progressOf(plan)
    expect(progress?.current?.name).toBe('Phase 2: syncInvoices')
    expect(progress?.resume?.command).toBe('pnpm vitest sync-replay.test.ts')
    expect([progress?.done, progress?.total]).toEqual([3, 7])
  })

  test('ticks are the texts of checked items', async () => {
    const plan = parsePlan(PLANS.midrun)
    expect(plan === undefined ? [] : ticksOf(plan)).toHaveLength(3)
  })

  test('the tick fixture parses with nothing ticked', async () => {
    const plan = parsePlan(PLANS.tick)
    expect(plan === undefined ? undefined : progressOf(plan).done).toBe(0)
    expect(plan?.phases).toHaveLength(2)
  })

  test('text that is not a plan parses to undefined', async () => {
    expect(parsePlan('just prose\n- [ ] a box')).toBeUndefined()
  })
})
