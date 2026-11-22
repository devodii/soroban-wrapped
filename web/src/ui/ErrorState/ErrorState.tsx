import { AlertTriangle } from 'lucide-react'
import { Button } from '../Button/Button'
import './ErrorState.scss'

export function ErrorState({ error, retry }: { error: unknown; retry?: () => void }) {
  return (
    <div className="sw-errorstate-state" role="alert">
      <AlertTriangle size={28} />
      <h3>That did not load</h3>
      <p>{error instanceof Error ? error.message : 'Something went wrong.'}</p>
      {retry && (
        <Button onClick={retry} variant="outline">
          Try again
        </Button>
      )}
    </div>
  )
}
