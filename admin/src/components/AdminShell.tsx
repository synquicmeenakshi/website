import { useState, type ReactNode } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'

interface AdminShellProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}

/**
 * Page chrome shared by every screen: sidebar, header and content column.
 *
 * Styled against the website's tokens — ivory canvas, hairline rules, the page
 * title in Cormorant — so the portal reads as the same product as the site.
 */
const AdminShell = ({ title, subtitle, actions, children }: AdminShellProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[var(--ivory)]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-60">
        <header className="sticky top-0 z-50 bg-[rgba(247,242,231,0.92)] backdrop-blur border-b border-[var(--hairline)]">
          <div className="px-4 sm:px-7 py-4 flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-[var(--radius)] hover:bg-[var(--ivory-2)] transition-colors"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5 text-[var(--ink-soft)]" />
            </button>

            <div className="flex-1 min-w-0">
              <h1
                className="truncate text-[var(--ink)]"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 'clamp(22px, 2vw, 29px)',
                  fontWeight: 500,
                  lineHeight: 1.15,
                }}
              >
                {title}
              </h1>
              {subtitle && (
                <p className="text-[12.5px] text-[var(--ink-soft)] truncate mt-0.5">{subtitle}</p>
              )}
            </div>

            {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
          </div>
        </header>

        <main className="p-4 sm:p-7">{children}</main>
      </div>
    </div>
  )
}

export default AdminShell
