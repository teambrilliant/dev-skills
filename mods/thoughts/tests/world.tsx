import type { On } from 'claude-code'

export type World = { placed: Set<string>; hidden: Set<string>; filled: string[]; files: Map<string, string> }

/** The world beneath the mod in a test: a session, a command table, panes that place, files from a map. */
export function world(on: On, files: Map<string, string> = new Map(), messages: { role: 'user' | 'assistant'; text: string }[] = []): World {
  const placed = new Set<string>()
  const hidden = new Set<string>()
  const filled: string[] = []
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('command.register', ($, e) => ({ value: { command: e.name } }))
  on('session.root', () => ({ value: '/work' }))
  on('session.messages', () => ({ value: messages.map(message => ({ ...message, toolUses: [] })) }))
  on('ui.open', ($, e) => {
    placed.add(e.id)
    return { value: { isPlaced: true } }
  })
  on('ui.panes', () => ({
    value: [...placed].map(id => ({ id, title: id, isShown: !hidden.has(id), isFocused: false, isPlaced: true })),
  }))
  on('fs.read', ($, e) => {
    const text = [...files].find(([path]) => e.path === path || e.path.endsWith(`/${path}`))?.[1]
    if (text === undefined) throw new Error(`missing ${e.path}`)
    return { value: text }
  })
  on('prompt.fill', ($, e) => {
    filled.push(e.text)
    return { isFilled: true, text: e.text, cursor: e.text.length }
  })
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    const props: object = e.props
    return <Text>{'text' in props ? String(props.text) : ''}</Text>
  })
  return { placed, hidden, filled, files }
}
