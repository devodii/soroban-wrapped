import { Command } from 'cmdk'
import './CommandPalette.scss'

export interface PaletteCommand {
  id: string
  group: string
  label: string
  hint?: string
  run: () => void
}

export function CommandPalette({
  open,
  onClose,
  query,
  onQuery,
  commands,
  busy,
}: {
  open: boolean
  onClose: () => void
  query: string
  onQuery: (value: string) => void
  commands: PaletteCommand[]
  busy?: boolean
}) {
  const groups = Array.from(new Set(commands.map((c) => c.group)))
  return (
    <Command.Dialog
      open={open}
      onOpenChange={(next) => !next && onClose()}
      shouldFilter={false}
      label="Command palette"
      overlayClassName="sw-commandpalette-scrim"
      contentClassName="sw-commandpalette-panel"
    >
      <div className="sw-commandpalette-field">
        <Command.Input
          value={query}
          onValueChange={onQuery}
          placeholder="Jump to a proposal, need, repo, pattern or contract"
        />
        {busy && <span className="sw-commandpalette-busy">searching</span>}
      </div>
      <Command.List className="sw-commandpalette-list">
        <Command.Empty className="sw-commandpalette-empty">Nothing matches.</Command.Empty>
        {groups.map((group) => (
          <Command.Group key={group} heading={group}>
            {commands
              .filter((c) => c.group === group)
              .map((command) => (
                <Command.Item
                  key={command.id}
                  value={command.id}
                  onSelect={() => {
                    onClose()
                    command.run()
                  }}
                >
                  <span className="sw-commandpalette-label">{command.label}</span>
                  {command.hint && <span className="sw-commandpalette-hint">{command.hint}</span>}
                </Command.Item>
              ))}
          </Command.Group>
        ))}
      </Command.List>
    </Command.Dialog>
  )
}
