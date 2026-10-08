export type ThoughtsPin = {
  kind: string
  text: string
  target: string | null
  targetHash: string | null
  isTargetChanged: boolean
  pinnedAt: number
}

export type ThoughtsRun = { command: string; isOk: boolean; at: number; editSeq: number }

declare module 'claude-code' {
  interface PluginState {
    thoughts: {
      pins: ThoughtsPin[]
      isPaneShown: boolean
      isSeeded: boolean
      activePlan: string | null
      planText: string | null
      baselineTicks: string[]
      ledger: ThoughtsRun[]
      editSeq: number
    }
  }
}
