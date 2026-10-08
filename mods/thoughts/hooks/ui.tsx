import type { BoxProps, ButtonProps, ElementConstructor, TextProps } from 'claude-code'

import type { ThoughtsPin, ThoughtsRun } from '../types'
import { ageOf, glyphFor, progressGlyph } from './evidence'
import type { Plan } from './plan'
import { isPhaseDone, progressOf, shortName } from './plan'

export type Kit = {
  Box: ElementConstructor<BoxProps>
  Text: ElementConstructor<TextProps>
  Button: ElementConstructor<ButtonProps>
}

export type Evidence = { ledger: readonly ThoughtsRun[]; editSeq: number; baselineTicks: readonly string[]; now: number }

const clip = (text: string, columns: number) => (text.length <= columns ? text : `${text.slice(0, Math.max(1, columns - 1))}…`)

/** Box-drawing lines are pictures: wrapping breaks them, so they truncate. Prose wraps. */
export const wrapFor = (line: string) => (/[│├└┌┐┘┬┴┼►▼◄▲]|──/u.test(line) ? 'truncate-end' : 'wrap')

const bodyOf = (pin: ThoughtsPin) => pin.text.split('\n').slice(1, -1)

const headingOf = (pin: ThoughtsPin) => (pin.target === null ? `★ ${pin.kind}` : `★ ${pin.kind} · ${pin.target}`)

export type PinnedActions = { discard: (kind: string) => void; reExplain: (target: string) => void }

/** Arrival order, newest last and open; older pins fold to their heading and first line. */
export function PinnedPane({ kit, pins, columns, actions }: { kit: Kit; pins: readonly ThoughtsPin[]; columns: number; actions: PinnedActions }) {
  const { Box, Text, Button } = kit
  if (pins.length === 0) return <Text dimColor>Nothing pinned. ★ blocks pin here as they appear.</Text>
  const newest = pins.length - 1
  return (
    <Box flexDirection="column">
      {pins.map((pin, at) => (
        <Box key={pin.kind} flexDirection="column" marginBottom={at === newest ? 0 : 1}>
          <Box>
            <Text bold={at === newest} dimColor={at !== newest}>
              {clip(headingOf(pin), Math.max(8, columns - 16))}
            </Text>
            {pin.isTargetChanged && pin.target !== null && <Text color="yellow"> ⚠ changed </Text>}
            {pin.isTargetChanged && pin.target !== null && (
              <Button key={`r-${pin.kind}`} label="r" plain onPress={() => actions.reExplain(pin.target ?? '')} />
            )}
            <Text> </Text>
            <Button key={`x-${pin.kind}`} label="x" plain onPress={() => actions.discard(pin.kind)} />
          </Box>
          {at === newest ? (
            bodyOf(pin).map((line, row) => (
              <Text key={`${pin.kind}-${row}`} wrap={wrapFor(line)}>
                {line}
              </Text>
            ))
          ) : (
            <Text dimColor wrap="truncate-end">
              {'  '}
              {bodyOf(pin).find(line => line.trim() !== '') ?? ''}
            </Text>
          )}
        </Box>
      ))}
    </Box>
  )
}

/** Things-style: done phases fold to one dim line, the current phase lists its checks, upcoming phases stay quiet. */
export function PlanPane({ kit, plan, path, columns, evidence }: { kit: Kit; plan: Plan; path: string; columns: number; evidence: Evidence }) {
  const { Box, Text } = kit
  const progress = progressOf(plan)
  const lastRun = evidence.ledger.at(-1)
  return (
    <Box flexDirection="column">
      <Box justifyContent="space-between">
        <Text bold>
          {progressGlyph(progress.done, progress.total)}  {clip(plan.title, Math.max(8, columns - 12))}
        </Text>
        <Text dimColor>
          {progress.done}/{progress.total}
        </Text>
      </Box>
      <Text dimColor wrap="truncate-end">
        {'   '}
        {path}
      </Text>
      <Text> </Text>
      {plan.phases.map(phase => {
        const label = shortName(phase) === 'Final' ? phase.name : `${shortName(phase)} · ${phase.name.replace(/^Phase \d+: /u, '')}`
        if (isPhaseDone(phase)) {
          return (
            <Text key={phase.name} dimColor wrap="truncate-end">
              {'   ✓ '}
              {label} · {phase.items.length} checks
            </Text>
          )
        }
        if (phase !== progress.current) {
          return (
            <Text key={phase.name} dimColor wrap="truncate-end">
              {'     '}
              {label}
            </Text>
          )
        }
        return (
          <Box key={phase.name} flexDirection="column" marginTop={1} marginBottom={1}>
            <Text bold wrap="truncate-end">
              {'   '}
              {label}
              {phase.layer === null ? '' : `   ${phase.layer}`}
            </Text>
            {phase.items.map(item => {
              const glyph = glyphFor(item, evidence.ledger, evidence.editSeq, evidence.baselineTicks)
              const isResume = item === progress.resume
              return (
                <Text key={item.text} color={isResume ? 'cyan' : undefined} dimColor={glyph === '✓'} wrap="wrap">
                  {'   '}
                  {glyph}  {item.command ?? item.text}
                  {isResume ? '   ← now' : ''}
                </Text>
              )
            })}
          </Box>
        )
      })}
      <Text> </Text>
      <Text dimColor wrap="wrap">
        {'   '}
        {progress.resume === null ? 'all checks ticked' : `resume: ${progress.resume.command ?? progress.resume.text}`}
        {lastRun === undefined ? '' : ` · last check ${lastRun.isOk ? '✓' : '✗'} ${ageOf(evidence.now - lastRun.at)} ago`}
      </Text>
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
