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
 * Page chrome shared by the Meenakshi screens: sidebar, responsive header and
 * the content column. Extracted because the existing pages each re-implement
 * this and drift apart.
 */
const AdminShell = ({ title, subtitle, actions, children }: AdminShellProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-60">
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200/80">
          <div className="px-4 sm:px-6 py-4 flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>

            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold text-slate-800 truncate">{title}</h1>
              {subtitle && <p className="text-xs sm:text-sm text-slate-500 truncate">{subtitle}</p>}
            </div>

            {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
          </div>
        </header>

        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}

export default AdminShell
