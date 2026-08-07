import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Sparkles, Users, LogOut, Quote, X, Settings2, HelpCircle, CalendarCheck, Footprints, Scale, CalendarClock, MessageSquare, Newspaper } from 'lucide-react'
import { BrandLockup } from './Brand'
import { destroyAdminSession } from '../utils/cookies'

interface MenuItem {
  name: string
  icon: React.ReactNode
  path: string
  badge?: number
}

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

const Sidebar = ({ isOpen = true, onClose }: SidebarProps) => {
  const navigate = useNavigate()
  const location = useLocation()
// /deploy
  // The Meenakshi screens (rentals, massage, properties) are retired from the
  // nav but still routed — see MEENAKSHI-INTEGRATION-PLAN.md, Phase 5.
  const menuItems: MenuItem[] = [
    { name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard' },
    { name: 'Consultations', icon: <CalendarCheck className="w-5 h-5" />, path: '/consultations' },
    { name: 'Availability', icon: <CalendarClock className="w-5 h-5" />, path: '/booking-management' },
    { name: 'Customers', icon: <Users className="w-5 h-5" />, path: '/m/customers' },
    { name: 'Enquiries', icon: <MessageSquare className="w-5 h-5" />, path: '/m/enquiries' },
    { name: 'Services', icon: <Sparkles className="w-5 h-5" />, path: '/m/services' },
    { name: 'Blog', icon: <Newspaper className="w-5 h-5" />, path: '/m/blog' },
    { name: 'Testimonials', icon: <Quote className="w-5 h-5" />, path: '/m/testimonials' },
    { name: 'FAQ', icon: <HelpCircle className="w-5 h-5" />, path: '/m/faq' },
    { name: 'Journey', icon: <Footprints className="w-5 h-5" />, path: '/m/journey' },
    { name: 'Legal Pages', icon: <Scale className="w-5 h-5" />, path: '/m/legal' },
    { name: 'Site Settings', icon: <Settings2 className="w-5 h-5" />, path: '/m/settings' },
  ]

  const handleLogout = () => {
    // Destroy session cookies
    destroyAdminSession()
    navigate('/')
  }

  const isActive = (path: string) => location.pathname === path

  const handleNavigation = (path: string) => {
    navigate(path)
    if (onClose) onClose()
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[rgba(36,26,20,0.5)] z-[60] lg:hidden"
          onClick={onClose}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-[70]
        w-64 lg:w-60 h-screen bg-[var(--cream)] flex flex-col border-r border-[var(--hairline)] shadow-lg lg:shadow-none
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Section */}
        <div className="px-4 py-5 border-b border-[var(--hairline)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BrandLockup />
            </div>
            {/* Close button for mobile */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (onClose) onClose()
              }}
              className="lg:hidden p-2 hover:bg-[var(--ivory-2)] rounded-[var(--radius)] transition-colors"
            >
              <X className="w-5 h-5 text-[var(--ink-soft)]" />
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius)] text-[13.5px] font-medium transition-colors duration-200 group ${
                    isActive(item.path)
                      ? 'bg-[var(--saffron)] text-[var(--cream)]'
                      : 'text-[var(--ink-soft)] hover:bg-[rgba(212,83,29,0.07)] hover:text-[var(--ink)]'
                  }`}
                >
                  <span className={`transition-transform duration-200 ${isActive(item.path) ? '' : 'group-hover:scale-110'}`}>
                    {item.icon}
                  </span>
                  <span className="flex-1 text-left truncate">{item.name}</span>
                  {item.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      isActive(item.path)
                        ? 'bg-white/20 text-white'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className="px-3 py-3 mt-auto border-t border-[var(--hairline)]">
          {/* User Profile */}
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-50 transition cursor-pointer">
            <div className="w-9 h-9 rounded-[var(--radius)] flex items-center justify-center text-[var(--cream)] text-sm bg-[var(--saffron)]"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '17px' }}>
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-[var(--ink)] truncate">Admin User</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 mt-2 rounded-[var(--radius)] text-[13px] font-medium text-[#b3421a] hover:bg-[rgba(179,66,26,0.08)] border border-[rgba(179,66,26,0.25)] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  )
}

export default Sidebar
