import { Link } from 'react-router-dom'
import { ArrowRight } from './Icons.jsx'

/** One uniform card. Used on the services index and the related rail;
    the home page uses the asymmetric mosaic instead. */
export function ServiceCard({ s, size = 'md' }) {
  return (
    <Link className={`svc-card svc-card--${size}`} to={`/services/${s.slug}`}>
      <span className="svc-card__media">
        <img src={s.img} alt={s.alt} loading="lazy" />
        <span className="svc-card__scrim" aria-hidden="true" />
      </span>
      <span className="svc-card__body">
        <span className="svc-card__deva">{s.deva}</span>
        <span className="svc-card__title">{s.title}</span>
        <span className="svc-card__lede">{s.lede}</span>
        <span className="svc-card__go">
          Explore <ArrowRight width="14" height="14" />
        </span>
      </span>
    </Link>
  )
}
