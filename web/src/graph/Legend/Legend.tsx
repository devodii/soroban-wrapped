import {
  KIND_BLURB,
  KIND_LABEL,
  KINDS,
  NETWORK_COLOR,
  NETWORK_LABEL,
  type ColourBy,
} from '../model'
import { KindIcon } from '../KindIcon/KindIcon'
import './Legend.scss'

export function Legend({ colourBy }: { colourBy: ColourBy }) {
  return (
    <div className="sw-legend">
      <h4 className="sw-legend-title">Shapes</h4>
      <ul>
        {KINDS.map((kind) => (
          <li key={kind} title={KIND_BLURB[kind]}>
            <KindIcon kind={kind} />
            <span>{KIND_LABEL[kind]}</span>
          </li>
        ))}
      </ul>
      <h4 className="sw-legend-title">
        {colourBy === 'network' ? 'Colour: network' : 'Colour: kind'}
      </h4>
      {colourBy === 'network' ? (
        <ul>
          {Object.keys(NETWORK_COLOR).map((key) => (
            <li key={key}>
              <i style={{ background: `var(--${NETWORK_COLOR[key]})` }} />
              <span>{NETWORK_LABEL[key]}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="sw-legend-note">Each shape has its own colour.</p>
      )}
      <p className="sw-legend-note">
        <b className="sw-legend-ring" /> A ring means the node was seen on mainnet. Larger means a
        higher reuse score or more links. Hover to light up neighbours, click to fly in.
      </p>
    </div>
  )
}
