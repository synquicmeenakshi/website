import { WHY } from '../data/site.js'
import { SectionIntro } from './Bits.jsx'

/* Seven commitments, on a dark band so the section reads as a pause between
   two light ones. */
export default function WhyChoose() {
  return (
    <section className="why" id="why">
      <div className="why__bg" aria-hidden="true">
        <img src="/img/temple-sky.jpg" alt="" loading="lazy" />
      </div>

      <div className="container why__inner">
        <SectionIntro
          eyebrow="Why Meenakshi"
          deva="विश्वास"
          title={<>Rooted in wisdom, <em>guided by purpose</em></>}
          copy="Choosing a guide is personal. These are the seven things held to on every reading, without exception."
        />

        <ol className="why__list" data-reveal-child>
          {WHY.map((w) => (
            <li className="why__item" key={w.n}>
              <span className="why__n">{w.n}</span>
              <div>
                <h3>{w.title}</h3>
                <p>{w.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
