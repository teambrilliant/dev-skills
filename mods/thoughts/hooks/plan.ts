export type PlanItem = { text: string; command: string | null; isChecked: boolean }
export type PlanPhase = { name: string; layer: string | null; items: PlanItem[] }
export type Plan = { title: string; phases: PlanPhase[] }

const TITLE = /^# (.+?)(?:\s+-\s+Implementation Plan)?\s*$/u
const PHASE = /^## (Phase \d+: .+?)\s*$/u
const FINAL = /^## Final Verification\s*$/u
const SECTION = /^## /u
const LAYER = /^\*\*Layer:\*\*\s*(.+?)(?:\s+·\s+.*)?$/u
const ITEM = /^- \[( |x)\] (.+)$/u
const LEADING_COMMAND = /^`([^`]+)`/u

function itemOf(mark: string, text: string): PlanItem {
  const command = LEADING_COMMAND.exec(text)?.[1]?.replace(/\\$/u, '') ?? null
  return { text, command, isChecked: mark === 'x' }
}

/** The phases and their checks; sections other than phases and Final Verification are ignored. */
export function parsePlan(markdown: string): Plan | undefined {
  let title: string | null = null
  const phases: PlanPhase[] = []
  let current: PlanPhase | null = null
  for (const line of markdown.split('\n')) {
    title ??= TITLE.exec(line)?.[1] ?? null
    const phase = PHASE.exec(line)?.[1]
    if (phase !== undefined || FINAL.test(line)) {
      current = { name: phase ?? 'Final Verification', layer: null, items: [] }
      phases.push(current)
      continue
    }
    if (SECTION.test(line)) {
      current = null
      continue
    }
    if (current === null) continue
    current.layer ??= LAYER.exec(line)?.[1]?.trim() ?? null
    const item = ITEM.exec(line)
    if (item?.[1] !== undefined && item[2] !== undefined) current.items.push(itemOf(item[1], item[2]))
  }
  return title === null || phases.length === 0 ? undefined : { title, phases }
}

export type Progress = { done: number; total: number; current: PlanPhase | null; resume: PlanItem | null }

/** The current phase is the first with an unticked item; a phase is done when all its boxes are ticked. */
export function progressOf(plan: Plan): Progress {
  const items = plan.phases.flatMap(phase => phase.items)
  const current = plan.phases.find(phase => phase.items.some(item => !item.isChecked)) ?? null
  return {
    done: items.filter(item => item.isChecked).length,
    total: items.length,
    current,
    resume: current?.items.find(item => !item.isChecked) ?? null,
  }
}

export function isPhaseDone(phase: PlanPhase): boolean {
  return phase.items.length > 0 && phase.items.every(item => item.isChecked)
}

export function ticksOf(plan: Plan): string[] {
  return plan.phases.flatMap(phase => phase.items.filter(item => item.isChecked).map(item => item.text))
}

/** `P2` for "Phase 2: …", `Final` for Final Verification. */
export function shortName(phase: PlanPhase): string {
  const number = /^Phase (\d+):/u.exec(phase.name)?.[1]
  return number === undefined ? 'Final' : `P${number}`
}
