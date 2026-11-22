import { Loader2 } from 'lucide-react'
import './Warming.scss'

export function Warming({ what }: { what: string }) {
  return (
    <div className="sw-warming-state" role="status">
      <Loader2 size={28} className="sw-warming-spin" />
      <h3>Warming up {what}</h3>
      <p>
        This view reads millions of rows. It is computed once in the background and then served
        instantly, so give it a few seconds.
      </p>
    </div>
  )
}
