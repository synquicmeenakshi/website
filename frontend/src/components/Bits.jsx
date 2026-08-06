import { Link } from 'react-router-dom'
import { ArrowRight, Star, StarRule } from './Icons.jsx'

/* Small shared primitives. Every section on the site is introduced the same
   way, so the introduction itself is a component rather than repeated markup. */

export function Eyebrow({ children, deva }) {
  return (
    <p className="eyebrow">
      <Star width="9" height="9" />
      <span>{children}</span>
      {deva && <span className="eyebrow__deva">{deva}</span>}
    </p>
  )
}

/** Centred section introduction: eyebrow, title, optional copy. */
export function SectionIntro({ eyebrow, deva, title, copy, align = 'center', children }) {
  return (
    <header className={`section-intro section-intro--${align}`} data-reveal>
      {eyebrow && <Eyebrow deva={deva}>{eyebrow}</Eyebrow>}
      <h2 className="section-title">{title}</h2>
      {align === 'center' && <StarRule width={150} className="section-intro__rule" />}
      {copy && <p className="section-copy">{copy}</p>}
      {children}
    </header>
  )
}

/** The standard text link with a travelling arrow. */
export function TextLink({ to, href, children, className = '' }) {
  const inner = (
    <>
      <span>{children}</span>
      <ArrowRight width="15" height="15" />
    </>
  )
  return href ? (
    <a className={`textlink ${className}`} href={href}>{inner}</a>
  ) : (
    <Link className={`textlink ${className}`} to={to}>{inner}</Link>
  )
}

/** A single statistic. */
export function Stat({ value, label, deva }) {
  return (
    <div className="stat">
      <span className="stat__value">{value}</span>
      <span className="stat__label">{label}</span>
      {deva && <span className="stat__deva">{deva}</span>}
    </div>
  )
}
