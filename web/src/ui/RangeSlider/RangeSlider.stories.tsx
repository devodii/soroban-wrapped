import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { RangeSlider } from './RangeSlider'

const meta: Meta = { title: 'ui/RangeSlider', component: RangeSlider }
export default meta
export const Default: StoryObj = {
  render: () => {
    const [range, setRange] = React.useState<[number, number]>([20, 80])
    return (
      <RangeSlider
        label="Active between"
        min={0}
        max={100}
        from={range[0]}
        to={range[1]}
        onChange={(a, b) => setRange([a, b])}
      />
    )
  },
}
