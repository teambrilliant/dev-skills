import type { BoxProps, ButtonProps, ElementConstructor, MarkdownProps, TextProps } from 'claude-code'

import type { ThoughtsPin, ThoughtsRun } from '../types'
import { ageOf, evidenceSummary, glyphFor, progressGlyph } from './evidence'
import type { EvidenceSummary, Glyph } from './evidence'
import type { Plan, PlanItem, PlanPhase } from './plan'
import { isPhaseDone, progressOf, shortName } from './plan'

export type Kit = {
  Box: ElementConstructor<BoxProps>
  Text: ElementConstructor<TextProps>
  Button: ElementConstructor<ButtonProps>
  Markdown: ElementConstructor<MarkdownProps>
}

export type Evidence = { ledger: readonly ThoughtsRun[]; editSeq: number; baselineTicks: readonly string[]; now: number }

const clip = (text: string, columns: number) => (text.length <= columns ? text : `${text.slice(0, Math.max(1, columns - 1))}…`)

/** Box-drawing lines are pictures: wrapping breaks them, so they truncate. Prose wraps. */
export const wrapFor = (line: string) => (/[│├└┌┐┘┬┴┼►▼◄▲]|──/u.test(line) ? 'truncate-end' : 'wrap')

const bodyOf = (pin: ThoughtsPin) => pin.text.split('\n').slice(1, -1)

const headingOf = (pin: ThoughtsPin) => (pin.target === null ? `★ ${pin.kind}` : `★ ${pin.kind} · ${pin.target}`)

export type PinnedActions = { discard: (kind: string) => void; reExplain: (target: string) => void }

const FENCE = /^\s*```/u

/**
 * A pin's body as markdown: bullets become a list, backticks become code. Runs of
 * box-drawing lines get a code fence so markdown keeps them line for line; a body
 * that already carries its own fences is passed through untouched.
 */
export function markdownOf(lines: readonly string[]): string {
  if (lines.some(line => FENCE.test(line))) return lines.join('\n')
  const out: string[] = []
  let isInDrawing = false
  for (const line of lines) {
    const isDrawing = wrapFor(line) === 'truncate-end'
    if (isDrawing !== isInDrawing) out.push('```')
    out.push(line)
    isInDrawing = isDrawing
  }
  if (isInDrawing) out.push('```')
  return out.join('\n').trim()
}

/** Newest first, as an open card; older pins follow, newest to oldest, folded to one dim line. */
export function PinnedPane({ kit, pins, columns, actions }: { kit: Kit; pins: readonly ThoughtsPin[]; columns: number; actions: PinnedActions }) {
  const { Box, Text, Button, Markdown } = kit
  if (pins.length === 0) return <Text dimColor>  ★ views pin here as they appear</Text>
  const newestFirst = [...pins].reverse()
  const controls = (pin: ThoughtsPin) => (
    <Box>
      {pin.isTargetChanged && pin.target !== null && <Text color="yellow">⚠ changed </Text>}
      {pin.isTargetChanged && pin.target !== null && (
        <Button key={`r-${pin.kind}`} label="r" plain onPress={() => actions.reExplain(pin.target ?? '')} />
      )}
      <Text> </Text>
      <Button key={`x-${pin.kind}`} label="x" plain dimColor onPress={() => actions.discard(pin.kind)} />
    </Box>
  )
  return (
    <Box flexDirection="column" gap={1}>
      {newestFirst.map((pin, at) =>
        at === 0 ? (
          <Box key={pin.kind} flexDirection="column" borderStyle="round" borderDimColor paddingX={1}>
            <Box justifyContent="space-between">
              <Text bold>{clip(headingOf(pin), Math.max(8, columns - 14))}</Text>
              {controls(pin)}
            </Box>
            <Box marginTop={1}>
              <Markdown key={`body-${pin.kind}`} text={markdownOf(bodyOf(pin))} />
            </Box>
          </Box>
        ) : (
          <Box key={pin.kind} justifyContent="space-between" paddingX={2}>
            <Text dimColor wrap="truncate-end">
              {clip(`▸ ${headingOf(pin)} · ${bodyOf(pin).find(line => line.trim() !== '')?.replace(/^[-•]\s*/u, '') ?? ''}`, Math.max(8, columns - 10))}
            </Text>
            {controls(pin)}
          </Box>
        ),
      )}
    </Box>
  )
}

const GLYPH_COLOR: Partial<Record<Glyph, 'red' | 'yellow'>> = { '✗': 'red', '◌': 'yellow' }

/** `4 of 4 verified` when everything is backed by runs; otherwise each non-zero kind of backing. */
function summaryParts(summary: EvidenceSummary, done: number, total: number): { text: string; isAlarm: boolean }[] {
  if (done === 0) return [{ text: 'not started', isAlarm: false }]
  if (done === total && summary.verified === total) return [{ text: `${total} of ${total} verified`, isAlarm: false }]
  return [
    { count: summary.verified, label: 'verified', isAlarm: false },
    { count: summary.earlier, label: 'earlier', isAlarm: false },
    { count: summary.selfReported, label: 'self-reported', isAlarm: false },
    { count: summary.stale, label: 'stale', isAlarm: false },
    { count: summary.failing, label: 'failing', isAlarm: true },
  ].flatMap(({ count, label, isAlarm }) => (count === 0 ? [] : [{ text: `${count} ${label}`, isAlarm }]))
}

/** Things-style card: done phases fold to one line with an evidence dot per check, the current phase opens, upcoming phases stay quiet. */
export function PlanPane({ kit, plan, path, columns, evidence }: { kit: Kit; plan: Plan; path: string; columns: number; evidence: Evidence }) {
  const { Box, Text } = kit
  const progress = progressOf(plan)
  const lastRun = evidence.ledger.at(-1)
  const glyphOf = (item: PlanItem) => glyphFor(item, evidence.ledger, evidence.editSeq, evidence.baselineTicks)
  const isComplete = progress.done === progress.total && progress.total > 0
  const summary = summaryParts(
    evidenceSummary(plan.phases.flatMap(phase => phase.items), evidence.ledger, evidence.editSeq, evidence.baselineTicks),
    progress.done,
    progress.total,
  )
  const nameOf = (phase: PlanPhase) => phase.name.replace(/^Phase \d+: /u, '')
  return (
    <Box flexDirection="column" borderStyle="round" borderDimColor paddingX={1}>
      <Box justifyContent="space-between">
        <Text bold>
          {progressGlyph(progress.done, progress.total)} {clip(plan.title, Math.max(8, columns - 14))}
        </Text>
        <Text dimColor>
          {progress.done}/{progress.total}
        </Text>
      </Box>
      <Text dimColor wrap="truncate-start">
        {'  '}
        {path}
      </Text>
      <Box flexDirection="column" marginTop={1} marginBottom={1}>
        {plan.phases.map(phase => {
          if (isPhaseDone(phase)) {
            return (
              <Box key={phase.name} justifyContent="space-between" paddingLeft={2}>
                <Text dimColor wrap="truncate-end">
                  ✓ {nameOf(phase)}
                </Text>
                <Box gap={1}>
                  {phase.items.map(item => (
                    <Text key={item.text} color={GLYPH_COLOR[glyphOf(item)]} dimColor={GLYPH_COLOR[glyphOf(item)] === undefined}>
                      {glyphOf(item)}
                    </Text>
                  ))}
                </Box>
              </Box>
            )
          }
          if (phase !== progress.current) {
            return (
              <Box key={phase.name} justifyContent="space-between" paddingLeft={2}>
                <Text dimColor wrap="truncate-end">
                  ○ {nameOf(phase)}
                </Text>
                <Text dimColor>{phase.layer ?? ''}</Text>
              </Box>
            )
          }
          return (
            <Box key={phase.name} flexDirection="column" paddingLeft={2}>
              <Box justifyContent="space-between">
                <Text bold wrap="truncate-end">
                  ▾ {nameOf(phase)}
                </Text>
                <Text dimColor>{phase.layer ?? ''}</Text>
              </Box>
              {phase.items.map(item => {
                const glyph = glyphOf(item)
                const isResume = item === progress.resume
                return (
                  <Box key={item.text} paddingLeft={4}>
                    <Text color={isResume ? 'cyan' : GLYPH_COLOR[glyph]} dimColor={glyph === '✓'} wrap="wrap">
                      {glyph}  {item.command ?? item.text}
                      {isResume ? '   ← now' : ''}
                    </Text>
                  </Box>
                )
              })}
            </Box>
          )
        })}
      </Box>
      <Box paddingLeft={2}>
        {isComplete && <Text dimColor>Complete · </Text>}
        {summary.map((part, at) => (
          <Text key={part.text} color={part.isAlarm ? 'red' : undefined} dimColor={!part.isAlarm}>
            {at === 0 ? '' : ' · '}
            {part.text}
          </Text>
        ))}
        {lastRun !== undefined && (
          <Text dimColor>
            {' · '}last {lastRun.isOk ? '✓' : '✗'} {ageOf(evidence.now - lastRun.at)} ago
          </Text>
        )}
      </Box>
    </Box>
  )
}

export type BandPins = { kinds: readonly string[]; isPaneShown: boolean }

/** `★ 2 pinned: Strategic, Product · /thoughts to view` while the pane is hidden; just the count while it shows them. */
function pinsText({ kinds, isPaneShown }: BandPins): string {
  const count = `★ ${kinds.length} pinned`
  if (isPaneShown) return count
  return `${count}: ${kinds.map(kind => kind.replace(/ View$/u, '')).join(', ')} · /thoughts to view`
}

export function bandText(plan: Plan | undefined, pins: BandPins, evidence: Evidence): string | null {
  const parts: string[] = []
  if (plan !== undefined) {
    const progress = progressOf(plan)
    const lastRun = evidence.ledger.at(-1)
    parts.push(`${progressGlyph(progress.done, progress.total)} ${plan.title}`)
    if (progress.current !== null) {
      parts.push(progress.current.layer === null ? shortName(progress.current) : `${shortName(progress.current)} ${progress.current.layer}`)
    }
    parts.push(`${progress.done}/${progress.total}`)
    if (lastRun !== undefined) parts.push(`${lastRun.isOk ? '✓' : '✗'} ${ageOf(evidence.now - lastRun.at)}`)
  }
  if (pins.kinds.length > 0) parts.push(pinsText(pins))
  return parts.length === 0 ? null : parts.join(' · ')
}
