import { MARQUEE } from '../data/site.js'
import { Star } from './Icons.jsx'

/* The eight disciplines, running. The list is rendered twice so the CSS
   translation loops seamlessly; the duplicate is hidden from assistive tech. */
export default function Marquee() {
  const run = (key) => (
    <div className="marquee__run" key={key} aria-hidden={key === 'b' ? 'true' : undefined}>
      {MARQUEE.map((word) => (
        <span className="marquee__item" key={word}>
          {word}
          <Star width="9" height="9" className="marquee__star" />
        </span>
      ))}
    </div>
  )

  return (
    <div className="marquee" role="marquee">
      <div className="marquee__track">
        {run('a')}
        {run('b')}
      </div>
    </div>
  )
}
