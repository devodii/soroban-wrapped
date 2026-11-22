import * as React from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '../Button/Button'

const RESET_MS = 1800

export function CopyButton({
  text,
  label = 'Copy',
  variant = 'outline',
}: {
  text: string
  label?: string
  variant?: 'primary' | 'outline' | 'ghost'
}) {
  const [done, setDone] = React.useState(false)
  const click = async () => {
    setDone(
      await navigator.clipboard.writeText(text).then(
        () => true,
        () => false,
      ),
    )
    window.setTimeout(() => setDone(false), RESET_MS)
  }
  return (
    <Button variant={variant} size="sm" onClick={click} aria-live="polite">
      {done ? <Check size={14} /> : <Copy size={14} />}
      {done ? 'Copied' : label}
    </Button>
  )
}
