import { useId, useState } from 'react'
import { PlusIcon } from './Icons.jsx'

/** One question. The panel is genuinely hidden when closed, so its text stays
    out of the accessibility tree and out of find-in-page. */
export function AccordionItem({ q, a, n }) {
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <div className={`acc${open ? ' is-open' : ''}`}>
      <h3 className="acc__h">
        <button
          type="button"
          className="acc__btn"
          id={`${id}-btn`}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={() => setOpen((v) => !v)}
        >
          {n && <span className="acc__n">{n}</span>}
          <span className="acc__q">{q}</span>
          <span className="acc__ico" aria-hidden="true">
            <PlusIcon width="15" height="15" open={open} />
          </span>
        </button>
      </h3>
      <div
        className="acc__panel"
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-btn`}
        hidden={!open}
      >
        <p>{a}</p>
      </div>
    </div>
  )
}

export default function Accordion({ items, numbered = false }) {
  return (
    <div className="acc-list">
      {items.map((item, i) => (
        <AccordionItem
          key={item.q}
          {...item}
          n={numbered ? String(i + 1).padStart(2, '0') : undefined}
        />
      ))}
    </div>
  )
}
