import { Link } from 'react-router-dom'
import { JOURNEY } from '../data/journey.js'
import { ArrowRight } from './Icons.jsx'
import { SectionIntro } from './Bits.jsx'

/* The eight steps as a horizontal rail. It scrolls on its own axis rather than
   pinning the page, which keeps the section short and leaves the vertical
   scroll uninterrupted. */
export default function JourneyStrip() {
  return (
    <section className="journey-strip" id="journey">
      <div className="container">
        <SectionIntro
          eyebrow="Your consultation journey"
          deva="यात्रा"
          title={<>Eight steps, <em>booking to follow-up</em></>}
          copy="Including the four to five day wait, and exactly what happens during it."
        />
      </div>

      <div className="journey-rail" data-reveal>
        <ol className="journey-rail__track">
          {JOURNEY.map((s) => (
            <li className="jstep" key={s.n}>
              <span className="jstep__n">{s.n}</span>
              <span className="jstep__line" aria-hidden="true" />
              <h3>{s.title}</h3>
              <p>{s.body}</p>
              <span className="jstep__aside">{s.aside}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="container journey-strip__foot" data-reveal>
        <Link className="btn btn--outline" to="/journey">
          The journey in full <ArrowRight width="15" height="15" />
        </Link>
        <Link className="btn btn--primary" to="/book">
          Start at step one <ArrowRight width="15" height="15" />
        </Link>
      </div>
    </section>
  )
}
