import { describe, expect, test } from 'claude-code/testing'

import { glyphFor, progressGlyph, recordRun } from '../hooks/evidence'
import type { PlanItem } from '../hooks/plan'
import type { ThoughtsRun } from '../types'

const check = (isChecked: boolean): PlanItem => ({ text: '`pnpm vitest sync.test.ts` → pass', command: 'pnpm vitest sync.test.ts', isChecked })
const prose: PlanItem = { text: 'Acceptance criteria: each verified', command: null, isChecked: true }
const run = (isOk: boolean, editSeq: number): ThoughtsRun => ({ command: 'cd app &&  pnpm vitest   sync.test.ts 2>&1', isOk, at: 1, editSeq })

describe('glyphFor', () => {
  test('ticked with a passing run since the last edit → ●', async () => {
    expect(glyphFor(check(true), recordRun([], run(true, 3)), 3, [])).toBe('●')
  })

  test('an edit after the run makes it stale → ◌', async () => {
    expect(glyphFor(check(true), recordRun([], run(true, 3)), 4, [])).toBe('◌')
  })

  test('last matching run failed → ✗, ticked or not', async () => {
    const ledger = recordRun(recordRun([], run(true, 1)), run(false, 1))
    expect(glyphFor(check(true), ledger, 1, [])).toBe('✗')
    expect(glyphFor(check(false), ledger, 1, [])).toBe('✗')
  })

  test('ticked this session with no run → ◌; ticked before the mod watched → ✓', async () => {
    expect(glyphFor(check(true), [], 0, [])).toBe('◌')
    expect(glyphFor(check(true), [], 0, [check(true).text])).toBe('✓')
  })

  test('open → ○; a ticked prose item has nothing to verify → ✓', async () => {
    expect(glyphFor(check(false), [], 0, [])).toBe('○')
    expect(glyphFor(prose, [], 0, [])).toBe('✓')
  })
})

describe('progressGlyph', () => {
  test('quarters of the pie', async () => {
    expect([0, 1, 2, 3, 4].map(done => progressGlyph(done, 4))).toEqual(['○', '◔', '◑', '◕', '●'])
  })
})
