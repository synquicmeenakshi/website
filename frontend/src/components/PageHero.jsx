import { Link } from 'react-router-dom'
import { ArrowRight, Star, StarRule } from './Icons.jsx'

/* The masthead every inner page opens with. `crumb` is a single ancestor link,
   which is as deep as this site's hierarchy ever goes.

   `meta` is a list of [key, value] facts. It is not decoration: the masthead
   runs the full page rail, and a heading with a 26ch measure leaves the right
   half of that rail empty on any desktop. The facts are the things a visitor
   would otherwise have to scroll to find — length, wait, languages — so the
   column earns the space it fills. */
export default function PageHero({
  eyebrow,
  deva,
  title,
  lede,
  img,
  alt = '',
  crumb,
  actions,
  meta,
  tone = 'light',
}) {
  return (
    <header
      className={`page-hero page-hero--${tone}${img ? ' has-media' : ''}${
        meta ? ' has-meta' : ''
      }`}
    >
      {img && (
        <div className="page-hero__media" aria-hidden={alt ? undefined : 'true'}>
          <img src={img} alt={alt} />
          <span className="page-hero__scrim" />
        </div>
      )}

      <div className="container page-hero__inner">
        <div className="page-hero__lead">
          {crumb && (
            <nav className="crumb" aria-label="Breadcrumb">
              <Link to={crumb.to}>{crumb.label}</Link>
              <ArrowRight width="13" height="13" />
            </nav>
          )}

          {eyebrow && (
            <p className="eyebrow">
              <Star width="9" height="9" />
              <span>{eyebrow}</span>
              {deva && <span className="eyebrow__deva">{deva}</span>}
            </p>
          )}

          <h1 className="page-hero__title">{title}</h1>
          {lede && <p className="page-hero__lede">{lede}</p>}
          {actions && <div className="page-hero__actions">{actions}</div>}
        </div>

        {meta && (
          <dl className="page-hero__meta">
            <StarRule width={120} className="page-hero__meta-rule" />
            {meta.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </header>
  )
}
