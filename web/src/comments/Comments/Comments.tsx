import * as React from 'react'
import moment from 'moment'
import type { CommentCreate } from '../../lib/api-schema'
import { useAddComment, useComments } from '../../lib/queries'
import { Button } from '../../ui/Button/Button'
import { Skeleton } from '../../ui/Skeleton/Skeleton'
import './Comments.scss'

export function Comments({ kind, id }: { kind: CommentCreate['target_kind']; id: string }) {
  const list = useComments(kind, id)
  const add = useAddComment(kind, id)
  const [body, setBody] = React.useState('')
  const [author, setAuthor] = React.useState('')

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!body.trim()) return
    add.mutate(
      { body: body.trim(), author: author.trim() || 'anonymous' },
      { onSuccess: () => setBody('') },
    )
  }

  return (
    <div className="sw-comments">
      {list.isPending && <Skeleton height="2.5rem" />}
      <ul>
        {list.data?.map((c) => (
          <li key={c.id}>
            <b>{c.author}</b>
            <time dateTime={c.created_at}>{moment(c.created_at).fromNow()}</time>
            <p>{c.body}</p>
          </li>
        ))}
      </ul>
      <form onSubmit={submit}>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a note for whoever reads this next"
          rows={2}
          maxLength={4000}
          aria-label="Note"
        />
        <div className="sw-comments-row">
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Your name (optional)"
            maxLength={80}
            aria-label="Your name"
          />
          <Button
            type="submit"
            size="sm"
            variant="primary"
            disabled={add.isPending || !body.trim()}
          >
            Post
          </Button>
        </div>
      </form>
    </div>
  )
}
