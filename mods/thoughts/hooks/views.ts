import type { ThoughtsPin } from '../types'

export type View = { kind: string; target: string | null; text: string }

type Span = View & { first: number; last: number }

const OPENER = /^`?★ (.+?) ─{3,}`?\s*$/u
const CLOSER = /─{3,} ★`?\s*$/u
const FENCE = /^\s*```/u
const TARGET_SEPARATOR = ' · '

function labelOf(heading: string): { kind: string; target: string | null } {
  const at = heading.indexOf(TARGET_SEPARATOR)
  return at === -1
    ? { kind: heading.trim(), target: null }
    : { kind: heading.slice(0, at).trim(), target: heading.slice(at + TARGET_SEPARATOR.length).trim() }
}

function findSpans(lines: readonly string[]): Span[] {
  const spans: Span[] = []
  for (let open = 0; open < lines.length; open++) {
    const heading = OPENER.exec(lines[open] ?? '')?.[1]
    if (heading === undefined) continue
    const nextOpen = lines.findIndex((line, at) => at > open && OPENER.test(line))
    const close = lines.findIndex((line, at) => at > open && CLOSER.test(line))
    if (close === -1 || (nextOpen !== -1 && nextOpen < close)) continue
    const isFenced = FENCE.test(lines[open - 1] ?? '') && FENCE.test(lines[close + 1] ?? '')
    spans.push({
      ...labelOf(heading),
      text: lines.slice(open, close + 1).join('\n'),
      first: isFenced ? open - 1 : open,
      last: isFenced ? close + 1 : close,
    })
    open = close
  }
  return spans
}

/** Every closed ★ block in `text`, in order. An opener without a closer is not a view. */
export function extractViews(text: string): View[] {
  return findSpans(text.split('\n')).map(({ kind, target, text: block }) => ({ kind, target, text: block }))
}

/** Draws each block whose text is pinned as one line; everything else stays byte-identical. */
export function shrinkPinned(text: string, pinnedTexts: readonly string[]): string {
  const lines = text.split('\n')
  const shrunk = findSpans(lines).filter(span => pinnedTexts.includes(span.text))
  if (shrunk.length === 0) return text
  const out: string[] = []
  let at = 0
  for (const span of shrunk) {
    out.push(...lines.slice(at, span.first), `★ ${span.kind} · pinned`)
    at = span.last + 1
  }
  out.push(...lines.slice(at))
  return out.join('\n')
}

/** One slot per kind: a newer view replaces the pin of its kind, other kinds keep their order. */
export function pinViews(pins: readonly ThoughtsPin[], views: readonly View[], at: number, hashOf: (target: string) => string | null): ThoughtsPin[] {
  return views.reduce<ThoughtsPin[]>(
    (next, view) => [
      ...next.filter(pin => pin.kind !== view.kind),
      {
        kind: view.kind,
        text: view.text,
        target: view.target,
        targetHash: view.target === null ? null : hashOf(view.target),
        isTargetChanged: false,
        pinnedAt: at,
      },
    ],
    [...pins],
  )
}

/** FNV-1a: cheap, synchronous, good enough to notice that a file changed. */
export function hashText(text: string): string {
  let hash = 0x811c9dc5
  for (let at = 0; at < text.length; at++) {
    hash ^= text.charCodeAt(at)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash.toString(16)
}
