import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import { recordRun } from './evidence'
import { parsePlan, ticksOf } from './plan'
import { PinnedPane, PlanPane, bandText } from './ui'
import type { Evidence } from './ui'
import { extractViews, hashText, pinViews, shrinkPinned } from './views'
import type { View } from './views'

const PANE = 'thoughts'
const PLAN_PATH = /(^|\/)thoughts\/plans\/[^/]+\.md$/u
const OUTSIDE_THOUGHTS = (path: string) => !/(^|\/)thoughts\//u.test(path)

const pins = atom({ plugin: 'thoughts', key: 'pins' }, [])
const isPaneShown = atom({ plugin: 'thoughts', key: 'isPaneShown' }, false)
const isSeeded = atom({ plugin: 'thoughts', key: 'isSeeded' }, false)
const activePlan = atom({ plugin: 'thoughts', key: 'activePlan' }, null)
const planText = atom({ plugin: 'thoughts', key: 'planText' }, null)
const baselineTicks = atom({ plugin: 'thoughts', key: 'baselineTicks' }, [])
const ledger = atom({ plugin: 'thoughts', key: 'ledger' }, [])
const editSeq = atom({ plugin: 'thoughts', key: 'editSeq' }, 0)

async function readOrNull($: EngineInterface, path: string): Promise<string | null> {
  try {
    return await $.fs.read(path)
  } catch {
    return null
  }
}

async function hashesOf($: EngineInterface, views: readonly View[]): Promise<Map<string, string>> {
  const hashes = new Map<string, string>()
  for (const { target } of views) {
    if (target === null || hashes.has(target)) continue
    const text = await readOrNull($, target)
    if (text !== null) hashes.set(target, hashText(text))
  }
  return hashes
}

async function pinAll($: EngineInterface, views: readonly View[]) {
  if (views.length === 0) return
  const hashes = await hashesOf($, views)
  const at = await $.clock.now()
  const isFirstPin = (await read($, pins)).length === 0
  await update($, pins, current => pinViews(current, views, at, target => hashes.get(target) ?? null))
  if (isFirstPin) await openPane($)
}

/** Opened unasked (first pin) it may wait undrawn on a narrow terminal; shrinking follows what's actually on screen. */
async function openPane($: EngineInterface) {
  await $.ui.open({ id: PANE, title: 'thoughts' })
  await refreshPaneShown($)
}

async function refreshPaneShown($: EngineInterface) {
  const isShown = (await $.ui.panes()).some(pane => pane.id === PANE && pane.isPlaced && pane.isShown)
  await update($, isPaneShown, () => isShown)
}

async function loadPlan($: EngineInterface, path: string) {
  const text = await readOrNull($, path)
  const isNewPlan = (await read($, activePlan)) !== path
  await update($, activePlan, () => path)
  await update($, planText, () => text)
  if (isNewPlan) {
    const plan = text === null ? undefined : parsePlan(text)
    await update($, baselineTicks, () => (plan === undefined ? [] : ticksOf(plan)))
  }
}

async function refreshTargets($: EngineInterface) {
  const current = await read($, pins)
  const changed = await Promise.all(
    current.map(async pin => {
      if (pin.target === null || pin.targetHash === null) return pin
      const text = await readOrNull($, pin.target)
      return { ...pin, isTargetChanged: text !== null && hashText(text) !== pin.targetHash }
    }),
  )
  await update($, pins, () => changed)
}

async function evidenceOf($: EngineInterface): Promise<Evidence> {
  return {
    ledger: await read($, ledger),
    editSeq: await read($, editSeq),
    baselineTicks: await read($, baselineTicks),
    now: await $.clock.now(),
  }
}

const textOf = (blocks: readonly { type: string; text?: string }[]) =>
  blocks.flatMap(block => (block.type === 'text' && typeof block.text === 'string' ? [block.text] : [])).join('\n')

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'thoughts',
      description: 'Open the thoughts pane · /thoughts plan <path> picks the plan',
    })
    if (!(await read($, isSeeded))) {
      const messages = await $.session.messages()
      await pinAll($, messages.filter(message => message.role === 'assistant').flatMap(message => extractViews(message.text)))
      await update($, isSeeded, () => true)
    }
    return next(e)
  })

  on('session.append', { door: 'response' }, async ($, e, next) => {
    const stored = await next(e)
    if (e.agentId === undefined && e.message.type === 'assistant') {
      const { content } = e.message
      await pinAll($, extractViews(typeof content === 'string' ? content : textOf(content)))
    }
    return stored
  }).catch(($, e, next) => next(e))

  on('session.end', async ($, e, next) => {
    if (e.reason === 'clear') await update($, pins, () => [])
    return next(e)
  })

  on('command.run', { command: 'thoughts' }, async ($, e) => {
    const planArg = /^plan\s+(\S+)/u.exec(e.args.trim())?.[1]
    if (planArg !== undefined) {
      await loadPlan($, planArg)
      const plan = await read($, planText)
      return { text: plan === null ? `thoughts: can't read ${planArg}` : `thoughts: tracking ${planArg}` }
    }
    await openPane($)
    return { text: 'thoughts: pane open.' }
  })

  on('ui.open', async ($, e, next) => {
    const opened = await next(e)
    await refreshPaneShown($)
    return opened
  }).catch(($, e, next) => next(e))

  on('ui.close', async ($, e, next) => {
    const closed = await next(e)
    await refreshPaneShown($)
    return closed
  }).catch(($, e, next) => next(e))

  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const ran = await next(e)
    if (ran.deny === undefined) {
      const run = { command: e.command, isOk: ran.isError !== true, at: await $.clock.now(), editSeq: await read($, editSeq) }
      await update($, ledger, current => recordRun(current, run))
    }
    return ran
  }).catch(($, e, next) => next(e))

  on('tool.call', { tool: 'Read' }, async ($, e, next) => {
    const ran = await next(e)
    if (PLAN_PATH.test(e.file_path)) await loadPlan($, e.file_path)
    return ran
  }).catch(($, e, next) => next(e))

  on('tool.call', { tool: 'Write' }, async ($, e, next) => {
    const ran = await next(e)
    if (ran.deny === undefined && ran.isError !== true) {
      if (PLAN_PATH.test(e.file_path)) await loadPlan($, e.file_path)
      if (OUTSIDE_THOUGHTS(e.file_path)) await update($, editSeq, seq => seq + 1)
      await refreshTargets($)
    }
    return ran
  }).catch(($, e, next) => next(e))

  on('tool.call', { tool: 'Edit' }, async ($, e, next) => {
    const ran = await next(e)
    if (ran.deny === undefined && ran.isError !== true) {
      if (PLAN_PATH.test(e.file_path)) await loadPlan($, e.file_path)
      if (OUTSIDE_THOUGHTS(e.file_path)) await update($, editSeq, seq => seq + 1)
      await refreshTargets($)
    }
    return ran
  }).catch(($, e, next) => next(e))

  on('turn.complete', async ($, e, next) => {
    const answer = await next(e)
    const path = await read($, activePlan)
    if (path !== null) await loadPlan($, path)
    await refreshTargets($)
    await refreshPaneShown($)
    return answer
  })

  on('ui.render', { component: 'AssistantMessage' }, async ($, e, next) => {
    if (!(await read($, isPaneShown))) return next(e)
    const pinnedTexts = (await read($, pins)).map(pin => pin.text)
    const text = shrinkPinned(e.props.text, pinnedTexts)
    return text === e.props.text ? next(e) : next({ ...e, props: { ...e.props, text } })
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const kit = $.ui.resolve(e)
    const { Box } = kit
    const path = await read($, activePlan)
    const root = `${await $.session.root()}/`
    const shownPath = path !== null && path.startsWith(root) ? path.slice(root.length) : path
    const text = await read($, planText)
    const plan = text === null ? undefined : parsePlan(text)
    const columns = e.props.bodyColumns
    return (
      <Box flexDirection="column" gap={1}>
        {shownPath !== null && plan !== undefined && PlanPane({ kit, plan, path: shownPath, columns, evidence: await evidenceOf($) })}
        {PinnedPane({
          kit,
          pins: await read($, pins),
          columns,
          actions: {
            discard: kind => void update($, pins, current => current.filter(pin => pin.kind !== kind)),
            reExplain: target => void $.prompt.fill({ text: `/dev-skills:explain ${target}` }),
          },
        })}
      </Box>
    )
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const text = await read($, planText)
    const bandPins = { kinds: (await read($, pins)).map(pin => pin.kind), isPaneShown: await read($, isPaneShown) }
    const line = bandText(text === null ? undefined : parsePlan(text), bandPins, await evidenceOf($))
    if (line === null) return next(e)
    const { Text } = $.ui.resolve(e)
    return (
      <Text dimColor wrap="truncate-end">
        {line}
      </Text>
    )
  })
}
