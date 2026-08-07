/**
 * Shared class strings for the admin, expressed against the website's tokens.
 *
 * Six screens each declared their own `inputCls` and `btnGold`, which is how
 * they drifted apart in the first place. One definition each here, so a change
 * to the design language is a change in one file.
 */

/** Text input, textarea and select. */
export const input =
  'w-full px-3 py-2 rounded-[10px] border border-[var(--hairline)] text-[14px] ' +
  'text-[var(--ink)] bg-white placeholder:text-[var(--ink-soft)]/60 ' +
  'hover:border-[rgba(36,26,20,0.3)] ' +
  'focus:outline-none focus:border-[var(--saffron)] focus:ring-[3px] focus:ring-[rgba(212,83,29,0.14)] ' +
  'transition-colors'

/** Primary action. Flat saffron — the site uses no gradients. */
export const btnPrimary =
  'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[10px] ' +
  'text-[13.5px] font-medium text-[var(--cream)] bg-[var(--saffron-ink)] ' +
  'hover:bg-[var(--saffron-ink-hover)] disabled:opacity-50 transition-colors'

/** Secondary action. */
export const btnOutline =
  'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[10px] ' +
  'text-[13.5px] font-medium text-[var(--ink)] border border-[rgba(36,26,20,0.38)] ' +
  'hover:bg-[var(--ink)] hover:text-[var(--cream)] disabled:opacity-50 transition-colors'

/** Tertiary / cancel. */
export const btnQuiet =
  'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[10px] ' +
  'text-[13.5px] font-medium text-[var(--ink-soft)] hover:text-[var(--saffron)] transition-colors'

/** Destructive. */
export const btnDanger =
  'inline-flex items-center gap-2 px-3 py-2 rounded-[10px] text-[13.5px] font-medium ' +
  'text-[#b3421a] hover:bg-[rgba(179,66,26,0.08)] transition-colors'

/** Icon-only control, e.g. refresh. */
export const btnIcon =
  'p-2 rounded-[10px] text-[var(--ink-soft)] hover:bg-[var(--ivory-2)] transition-colors'

/** Surface card. */
export const card = 'bg-white rounded-[10px] border border-[var(--hairline)]'

/** Inset panel, for read-only detail blocks. */
export const panel = 'rounded-[10px] bg-[var(--ivory)] border border-[var(--hairline)]'

/** Row divider inside a card list. */
export const divider = 'border-t border-[var(--hairline)]'

/** Small uppercase field label used in detail views. */
export const microLabel =
  'text-[10.5px] uppercase tracking-[0.14em] text-[var(--ink-soft)] font-semibold'

/** Section / modal heading, in the display face. */
export const heading = 'text-[var(--ink)] font-display'

/** Inline style for the display face, where a class will not do. */
export const displayFace: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontWeight: 500,
}

/** Status pills, warmed to sit against ivory rather than a cool grey UI. */
export const pill: Record<string, string> = {
  new: 'bg-[rgba(212,83,29,0.10)] text-[var(--saffron-600)] border-[rgba(212,83,29,0.28)]',
  confirmed: 'bg-[rgba(58,110,74,0.10)] text-[#3a6e4a] border-[rgba(58,110,74,0.28)]',
  completed: 'bg-[var(--ivory-2)] text-[var(--ink-soft)] border-[var(--hairline)]',
  cancelled: 'bg-[rgba(179,66,26,0.09)] text-[#b3421a] border-[rgba(179,66,26,0.25)]',
  read: 'bg-[rgba(90,110,140,0.10)] text-[#4a5a72] border-[rgba(90,110,140,0.26)]',
  replied: 'bg-[rgba(58,110,74,0.10)] text-[#3a6e4a] border-[rgba(58,110,74,0.28)]',
  archived: 'bg-[var(--ivory-2)] text-[var(--ink-soft)] border-[var(--hairline)]',
  paid: 'bg-[rgba(58,110,74,0.10)] text-[#3a6e4a] border-[rgba(58,110,74,0.28)]',
  pending: 'bg-[rgba(212,83,29,0.10)] text-[var(--saffron-600)] border-[rgba(212,83,29,0.28)]',
  failed: 'bg-[rgba(179,66,26,0.09)] text-[#b3421a] border-[rgba(179,66,26,0.25)]',
  not_required: 'bg-[var(--ivory-2)] text-[var(--ink-soft)] border-[var(--hairline)]',
}

export const pillBase =
  'px-2 py-0.5 rounded-full text-[10.5px] font-semibold border capitalize'

/** Error banner. */
export const errorBanner =
  'flex items-start gap-2 p-3 rounded-[10px] bg-[rgba(179,66,26,0.07)] ' +
  'border border-[rgba(179,66,26,0.22)] text-[13px] text-[#8e3411]'
