import { useState } from 'react'
import { Calendar, Menu } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import BookingCalendar from '../components/BookingCalendar'

const CalendarView = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-60 min-h-screen">
        {/* Top Header Bar */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
          <div className="px-3 sm:px-8 py-3 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg transition-colors -ml-1"
              >
                <Menu className="w-5 h-5 text-slate-600" />
              </button>
              <div className="hidden sm:flex w-10 h-10 rounded-xl bg-gradient-to-br from-[#DFB13B] to-[#C9A032] items-center justify-center shadow-lg shadow-[#DFB13B]/30">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-semibold text-slate-800">Booking Calendar</h1>
                <p className="text-[10px] sm:text-sm text-slate-500 hidden sm:block">View massage booking availability at a glance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-3 sm:p-6 lg:p-8">
          {/* Calendar Component */}
          <BookingCalendar />
        </div>
      </div>
    </div>
  )
}

export default CalendarView
