import type { ThoughtsRun } from '../types'
import type { PlanItem } from './plan'

export type Glyph = '○' | '●' | '✓' | '◌' | '✗'

const LEDGER_LIMIT = 200

const normalized = (command: string) => command.replace(/\s+/gu, ' ').trim()

export function recordRun(ledger: readonly ThoughtsRun[], run: ThoughtsRun): ThoughtsRun[] {
  return [...ledger, { ...run, command: normalized(run.command) }].slice(-LEDGER_LIMIT)
}

/** The latest run whose command contains the check's command. */
export function lastRunFor(item: PlanItem, ledger: readonly ThoughtsRun[]): ThoughtsRun | undefined {
  const { command } = item
  if (command === null) return undefined
  const wanted = normalized(command)
  return ledger.findLast(run => run.command.includes(wanted))
}

/**
 * ○ open · ● ticked, passing run since the last edit · ✓ ticked before the mod started watching
 * (or a prose item: nothing to verify) · ◌ ticked without fresh evidence · ✗ last run failed.
 */
export function glyphFor(item: PlanItem, ledger: readonly ThoughtsRun[], editSeq: number, baselineTicks: readonly string[]): Glyph {
  const last = lastRunFor(item, ledger)
  if (last !== undefined && !last.isOk) return '✗'
  if (!item.isChecked) return '○'
  if (last === undefined) return item.command === null || baselineTicks.includes(item.text) ? '✓' : '◌'
  return last.editSeq === editSeq ? '●' : '◌'
}

export type EvidenceSummary = { verified: number; earlier: number; selfReported: number; stale: number; failing: number }

/** What backs the ticks: runs seen this session, ticks from before it, prose ticks with nothing to run, stale or failing runs. */
export function evidenceSummary(items: readonly PlanItem[], ledger: readonly ThoughtsRun[], editSeq: number, baselineTicks: readonly string[]): EvidenceSummary {
  const summary: EvidenceSummary = { verified: 0, earlier: 0, selfReported: 0, stale: 0, failing: 0 }
  for (const item of items) {
    const glyph = glyphFor(item, ledger, editSeq, baselineTicks)
    if (glyph === '●') summary.verified += 1
    if (glyph === '◌') summary.stale += 1
    if (glyph === '✗') summary.failing += 1
    if (glyph === '✓') {
      if (baselineTicks.includes(item.text)) summary.earlier += 1
      else summary.selfReported += 1
    }
  }
  return summary
}

export function progressGlyph(done: number, total: number): '○' | '◔' | '◑' | '◕' | '●' {
  const ratio = total === 0 ? 0 : done / total
  if (ratio === 0) return '○'
  if (ratio >= 1) return '●'
  if (ratio < 0.375) return '◔'
  return ratio < 0.625 ? '◑' : '◕'
}

export function ageOf(ms: number): string {
  const seconds = Math.max(0, Math.round(ms / 1000))
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.round(seconds / 60)
  return minutes < 60 ? `${minutes}m` : `${Math.round(minutes / 60)}h`
}
