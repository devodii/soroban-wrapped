import * as React from 'react'
import type { Preview } from '@storybook/react-vite'
import '../src/styles/global.scss'

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Theme',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },
  decorators: [
    (Story, context) => {
      React.useEffect(() => {
        document.documentElement.dataset.theme = context.globals.theme
      }, [context.globals.theme])
      return (
        <div
          style={{ padding: 'var(--space-5)', background: 'var(--background)', minHeight: '10rem' }}
        >
          <Story />
        </div>
      )
    },
  ],
  parameters: { layout: 'fullscreen', controls: { expanded: true } },
}

export default preview
