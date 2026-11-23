import * as React from 'react'
import { Check } from 'lucide-react'
import './ContractId.scss'

const RESET_MS = 1500

export function ContractId({ id }: { id: string }) {
  const [copied, setCopied] = React.useState(false)
  const copy = async () => {
    const done = await navigator.clipboard.writeText(id).then(
      () => true,
      () => false,
    )
    setCopied(done)
    window.setTimeout(() => setCopied(false), RESET_MS)
  }
  return (
    <button type="button" className="sw-contractid" title={`${id} (click to copy)`} onClick={copy}>
      {id.slice(0, 5)}…{id.slice(-5)}
      {copied && <Check size={12} aria-label="Copied" />}
    </button>
  )
}
