import { describe, expect, mock, test } from 'claude-code/testing'
import type { RenderPropsOf } from 'claude-code'
import type { Engine } from 'claude-code/testing'

import { PLANS, REPLIES } from './fixtures/fixtures.gen'
import { world } from './world'
import type { World } from './world'

const reply = (name: string) => REPLIES[name] ?? ''
const PANE_PROPS: RenderPropsOf['Pane'] = { title: 'thoughts', isFocused: false, bodyColumns: 72, placement: 'dock', scroll: { offset: 0, bodyRows: 40 }, view: {} }
const BAND_PROPS: RenderPropsOf['AbovePrompt'] = { hasSurvey: false, isWorking: false, maxRows: 3, bodyColumns: 100, scroll: { offset: 0, bodyRows: 3 }, view: {} }
const EXPLAIN = (target: string) => `★ Explain · ${target} ─────────\n drawing\n words\n───────────── ★`

async function start($: Engine) {
  await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })
}

const mountPane = ($: Engine) => $.ui.mount({ plugin: 'thoughts', surface: 'terminal', component: 'Pane', requestId: 'thoughts', props: PANE_PROPS })
const mountBand = ($: Engine) => $.ui.mount({ plugin: 'thoughts', surface: 'terminal', component: 'AbovePrompt', props: BAND_PROPS })
const mountMessage = ($: Engine, text: string) =>
  $.ui.mount({ plugin: 'thoughts', surface: 'terminal', component: 'AssistantMessage', props: { text, isFirstOfReply: true } })

const textOf = async (ui: { findAll: (q: { type: 'Text' }) => Promise<{ text?: string }[]> }) =>
  (await ui.findAll({ type: 'Text' })).map(found => found.text ?? '').join('\n')

describe('pinned views', () => {
  test('views in the transcript are pinned at session start; same kind replaces, kinds stack', async ($, on) => {
    mock.clock(on)
    world(on, new Map(), [
      { role: 'assistant', text: reply('multi') },
      { role: 'user', text: 'ok' },
      { role: 'assistant', text: reply('product-thinker') },
    ])
    await start($)
    const pane = await mountPane($)
    const shown = await textOf(pane)
    expect(shown.indexOf('★ Strategic View')).toBeLessThan(shown.indexOf('★ Product View'))
    expect(shown.match(/★ Product View/g)).toHaveLength(1)
  })

  test('[x] discards a pin and the transcript draws it in full again', async ($, on) => {
    mock.clock(on)
    world(on, new Map(), [{ role: 'assistant', text: reply('multi') }])
    await start($)
    const message = await mountMessage($, reply('multi'))
    expect(await textOf(message)).toContain('★ Strategic View · pinned')
    const pane = await mountPane($)
    await pane.press({ key: 'x-Strategic View' })
    expect(await textOf(pane)).not.toContain('★ Strategic View')
    expect(await textOf(message)).toContain('- Expand-contract, not a flag')
  })

  test('while the pane is not shown, pinned blocks draw in full', async ($, on) => {
    mock.clock(on)
    const w: World = world(on, new Map(), [{ role: 'assistant', text: reply('multi') }])
    w.hidden.add('thoughts')
    await start($)
    const message = await mountMessage($, reply('multi'))
    expect(await textOf(message)).toContain('- Build it: the pain is real')
    expect(await textOf(message)).not.toContain('· pinned')
  })

  test('/clear empties the stack', async ($, on) => {
    mock.clock(on)
    world(on, new Map(), [{ role: 'assistant', text: reply('multi') }])
    on('session.end', () => ({ sessionId: 's' }))
    await start($)
    await $.session.end({ reason: 'clear', sessionId: 's', resume: { id: 's' } })
    expect(await textOf(await mountPane($))).toContain('Nothing pinned')
  })

  test('an explain pin goes stale when its file changes; [r] fills the prompt', async ($, on) => {
    mock.clock(on)
    const files = new Map([['thoughts/plans/a.md', 'v1']])
    const w = world(on, files, [{ role: 'assistant', text: EXPLAIN('thoughts/plans/a.md') }])
    on('tool.call', () => ({ result: { filePath: 'thoughts/plans/a.md' }, text: 'ok' }))
    await start($)
    const pane = await mountPane($)
    expect(await textOf(pane)).not.toContain('⚠ changed')
    files.set('thoughts/plans/a.md', 'v2')
    await $.tool.call({ tool: 'Edit', file_path: 'thoughts/plans/a.md', old_string: 'v1', new_string: 'v2' })
    expect(await textOf(pane)).toContain('⚠ changed')
    await pane.press({ key: 'r-Explain' })
    expect(w.filled).toEqual(['/dev-skills:explain thoughts/plans/a.md'])
  })
})

describe('band', () => {
  test('pins hidden: the band names them and says how to see them', async ($, on) => {
    mock.clock(on)
    const w = world(on, new Map(), [{ role: 'assistant', text: reply('multi') }])
    w.hidden.add('thoughts')
    await start($)
    expect(await textOf(await mountBand($))).toBe('★ 2 pinned: Product, Strategic · /thoughts to view')
  })

  test('pins shown in the pane: just the count', async ($, on) => {
    mock.clock(on)
    world(on, new Map(), [{ role: 'assistant', text: reply('multi') }])
    await start($)
    expect(await textOf(await mountBand($))).toBe('★ 2 pinned')
  })
})

describe('plan view', () => {
  test('nothing active and nothing pinned: the band draws nothing of its own', async ($, on) => {
    mock.clock(on)
    world(on)
    await start($)
    expect(await textOf(await mountBand($))).toBe('')
  })

  test('reading a plan makes it active: band and pane show progress; prior ticks read as done earlier', async ($, on) => {
    mock.clock(on)
    world(on, new Map([['thoughts/plans/billing.md', PLANS.midrun]]))
    on('tool.call', () => ({ result: { type: 'text' }, text: 'ok' }))
    await start($)
    await $.tool.call({ tool: 'Read', file_path: 'thoughts/plans/billing.md' })
    expect(await textOf(await mountBand($))).toMatch(/^◑ Billing invoices · P2 Function · 3\/7/)
    const pane = await textOf(await mountPane($))
    expect(pane).toContain('✓ P1 · Stripe client + table · 2 checks')
    expect(pane).toContain('✓  pnpm vitest sync-invoices.test.ts')
    expect(pane).toContain('○  pnpm vitest sync-replay.test.ts   ← now')
  })

  test('a passing run → ●, an edit after it → ◌, a failing run → ✗', async ($, on) => {
    mock.clock(on)
    const files = new Map([['thoughts/plans/billing.md', PLANS.midrun]])
    world(on, files)
    let isFailing = false
    on('tool.call', ($, e) => (isFailing && e.tool === 'Bash' ? { isError: true, result: 'Exit code 1', text: 'Exit code 1' } : { result: { type: 'text' }, text: 'ok' }))
    await start($)
    await $.tool.call({ tool: 'Read', file_path: 'thoughts/plans/billing.md' })
    await $.tool.call({ tool: 'Bash', command: 'pnpm vitest sync-invoices.test.ts' })
    const pane = await mountPane($)
    expect(await textOf(pane)).toContain('●  pnpm vitest sync-invoices.test.ts')
    expect(await textOf(await mountBand($))).toMatch(/ · ✓ 0s$/)
    await $.tool.call({ tool: 'Edit', file_path: 'src/sync.ts', old_string: 'a', new_string: 'b' })
    expect(await textOf(pane)).toContain('◌  pnpm vitest sync-invoices.test.ts')
    isFailing = true
    await $.tool.call({ tool: 'Bash', command: 'pnpm vitest sync-invoices.test.ts' })
    expect(await textOf(pane)).toContain('✗  pnpm vitest sync-invoices.test.ts')
  })
})
