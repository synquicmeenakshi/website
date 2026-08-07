/**
 * The Meenakshi yantra mark, ported from the website's BookIcons.jsx so the
 * portal carries the same brand as the site.
 *
 * This replaces `znlogo.png` — ZenYourLife's logo, which the admin was still
 * showing on every screen behind an `alt="Meenakshi"`.
 */

type SvgProps = React.SVGProps<SVGSVGElement>

export const YantraMark = (p: SvgProps) => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.3"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...p}
  >
    <rect x="2.5" y="2.5" width="19" height="19" rx="1" />
    <path d="M12 5.5 18.5 12 12 18.5 5.5 12Z" />
    <circle cx="12" cy="12" r="3.2" />
    <path d="M9.5 2.5v2M14.5 2.5v2M9.5 19.5v2M14.5 19.5v2M2.5 9.5h2M2.5 14.5h2M19.5 9.5h2M19.5 14.5h2" />
  </svg>
)

export const YantraBadge = (p: SvgProps) => (
  <svg viewBox="0 0 40 40" width="38" height="38" fill="none" aria-hidden="true" {...p}>
    <path d="M20 2 38 20 20 38 2 20Z" stroke="currentColor" strokeWidth="1.4" />
    <rect x="9" y="9" width="22" height="22" stroke="currentColor" strokeWidth="1.1" />
    <circle cx="20" cy="20" r="5.5" stroke="currentColor" strokeWidth="1.2" />
  </svg>
)

/** Wordmark lockup: the mark plus the name, as the site's masthead sets it. */
export const BrandLockup = ({ compact = false }: { compact?: boolean }) => (
  <span className="flex items-center gap-3 min-w-0">
    <YantraMark width={compact ? 24 : 30} height={compact ? 24 : 30} className="text-saffron shrink-0" />
    <span className="min-w-0">
      <span
        className="block truncate text-ink"
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: compact ? '18px' : '21px',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          lineHeight: 1.05,
          fontWeight: 500,
        }}
      >
        Meenakshi
      </span>
      <span
        className="block text-ink-soft"
        style={{ fontSize: '8.5px', letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: '3px' }}
      >
        Sacred Sciences
      </span>
    </span>
  </span>
)

export default YantraMark
