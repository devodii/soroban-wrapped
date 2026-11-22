import { Slider } from '@base-ui/react/slider'
import './RangeSlider.scss'

export function RangeSlider({
  min,
  max,
  from,
  to,
  onChange,
  label,
}: {
  min: number
  max: number
  from: number
  to: number
  onChange: (from: number, to: number) => void
  label: string
}) {
  return (
    <Slider.Root
      min={min}
      max={max}
      value={[from, to]}
      aria-label={label}
      onValueChange={(value) => Array.isArray(value) && onChange(value[0]!, value[1]!)}
    >
      <Slider.Control className="sw-rangeslider-control">
        <Slider.Track className="sw-rangeslider-track">
          <Slider.Indicator className="sw-rangeslider-fill" />
          <Slider.Thumb index={0} aria-label={`${label} start`} className="sw-rangeslider-thumb" />
          <Slider.Thumb index={1} aria-label={`${label} end`} className="sw-rangeslider-thumb" />
        </Slider.Track>
      </Slider.Control>
    </Slider.Root>
  )
}
