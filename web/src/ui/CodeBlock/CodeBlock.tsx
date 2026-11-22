import { Highlight, type PrismTheme } from 'prism-react-renderer'
import { CopyButton } from '../CopyButton/CopyButton'
import './CodeBlock.scss'

const theme: PrismTheme = {
  plain: { color: 'var(--foreground)', backgroundColor: 'transparent' },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata'],
      style: { color: 'var(--code-comment)', fontStyle: 'italic' },
    },
    {
      types: ['keyword', 'operator', 'atrule', 'selector'],
      style: { color: 'var(--code-keyword)' },
    },
    {
      types: ['string', 'char', 'attr-value', 'template-string'],
      style: { color: 'var(--code-string)' },
    },
    { types: ['number', 'boolean', 'constant', 'symbol'], style: { color: 'var(--code-number)' } },
    { types: ['function', 'macro', 'property'], style: { color: 'var(--code-function)' } },
    {
      types: ['class-name', 'builtin', 'type-definition', 'lifetime-annotation'],
      style: { color: 'var(--code-type)' },
    },
    { types: ['punctuation'], style: { color: 'var(--muted-foreground)' } },
  ],
}

export function CodeBlock({
  code,
  caption,
  language = 'rust',
}: {
  code: string
  caption?: string
  language?: string
}) {
  return (
    <figure className="sw-codeblock">
      <figcaption className="sw-codeblock-caption">
        <span className="sw-codeblock-path">{caption ?? language}</span>
        <CopyButton text={code} variant="ghost" />
      </figcaption>
      <Highlight theme={theme} code={code.trimEnd()} language={language}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={`sw-codeblock-pre ${className}`} style={style}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </figure>
  )
}
