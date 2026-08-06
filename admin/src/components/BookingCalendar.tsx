import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X, Clock, User, Sparkles, Calendar, Ban, TrendingUp } from 'lucide-react'
import { API_BASE_URL } from '../config/api'

interface Booking {
  _id: string
  firstName: string
  lastName: string
  serviceTitle: string
  appointmentDate: string
  appointmentTime: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
}

interface BlockedDate {
  _id: string
  date: string
  blockedTimeSlots: string[]
  isFullDayBlocked: boolean
  reason?: string
}

interface BookingSettings {
  timeSlots: string[]
  weeklySchedule: {
    [key: string]: {
      isWorking: boolean
      timeSlots: string[]
    }
  }
}

interface DayStatus {
  date: Date
  dateStr: string
  bookings: Booking[]
  blockedSlots: string[]
  isFullDayBlocked: boolean
  blockReason?: string
  isWorkingDay: boolean
  availableSlots: number
  bookedSlots: number
  totalSlots: number
  status: 'available' | 'partial' | 'full' | 'blocked' | 'non-working'
}

const BookingCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [bookingSettings, setBookingSettings] = useState<BookingSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<DayStatus | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [bookingsRes, blockedRes, settingsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/enrollments`),
          fetch(`${API_BASE_URL}/blocked-dates`),
          fetch(`${API_BASE_URL}/blocked-dates/settings`)
        ])

        const bookingsData = await bookingsRes.json()
        const blockedData = await blockedRes.json()
        const settingsData = await settingsRes.json()

        if (bookingsData.success) setBookings(bookingsData.data)
        if (blockedData.success) setBlockedDates(blockedData.data)
        if (settingsData.success) setBookingSettings(settingsData.data)
      } catch (error) {
        console.error('Error fetching calendar data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const BELGIUM_TZ = 'Europe/Brussels'

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  // Always returns the Belgium calendar day name for a date
  const getDayName = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { timeZone: BELGIUM_TZ, weekday: 'long' }).format(date).toLowerCase()
  }

  // Always returns YYYY-MM-DD in Belgium calendar — immune to browser timezone
  const formatDateStr = (date: Date) => {
    return new Intl.DateTimeFormat('en-CA', { timeZone: BELGIUM_TZ }).format(date)
  }

  const getDayStatus = (date: Date): DayStatus => {
    const dateStr = formatDateStr(date)
    const dayName = getDayName(date)

    const daySchedule = bookingSettings?.weeklySchedule?.[dayName]
    const isWorkingDay = daySchedule?.isWorking ?? true
    const dayTimeSlots = daySchedule?.timeSlots || bookingSettings?.timeSlots || []
    const totalSlots = dayTimeSlots.length

    const blockedDate = blockedDates.find(bd => {
      const bdDate = new Date(bd.date)
      return formatDateStr(bdDate) === dateStr
    })
    const isFullDayBlocked = blockedDate?.isFullDayBlocked || false
    const blockedSlots = blockedDate?.blockedTimeSlots || []

    const dayBookings = bookings.filter(b => {
      const bookingDate = new Date(b.appointmentDate)
      return formatDateStr(bookingDate) === dateStr &&
             (b.status === 'confirmed' || b.status === 'pending')
    })

    const bookedSlotTimes = dayBookings.map(b => b.appointmentTime)
    const bookedSlots = bookedSlotTimes.length

    let availableSlots = 0
    if (isWorkingDay && !isFullDayBlocked) {
      dayTimeSlots.forEach((slot: string) => {
        if (!blockedSlots.includes(slot) && !bookedSlotTimes.includes(slot)) {
          availableSlots++
        }
      })
    }

    let status: DayStatus['status'] = 'available'
    if (!isWorkingDay) {
      status = 'non-working'
    } else if (isFullDayBlocked) {
      status = 'blocked'
    } else if (availableSlots === 0 && totalSlots > 0) {
      status = 'full'
    } else if (bookedSlots > 0 || blockedSlots.length > 0) {
      status = 'partial'
    }

    return {
      date,
      dateStr,
      bookings: dayBookings,
      blockedSlots,
      isFullDayBlocked,
      blockReason: blockedDate?.reason,
      isWorkingDay,
      availableSlots,
      bookedSlots,
      totalSlots,
      status
    }
  }

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)

    const days: (DayStatus | null)[] = []

    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      // UTC noon anchor: guaranteed to be the same calendar day in Belgium timezone
      // regardless of where the admin's browser is located
      const date = new Date(Date.UTC(year, month, day, 12, 0, 0))
      days.push(getDayStatus(date))
    }

    return days
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const handleDayClick = (dayStatus: DayStatus) => {
    setSelectedDay(dayStatus)
    setIsModalOpen(true)
  }

  const calendarDays = generateCalendarDays()
  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const weekDaysShort = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const today = new Date()
  const todayBelgiumStr = new Intl.DateTimeFormat('en-CA', { timeZone: BELGIUM_TZ }).format(today)

  // Calculate stats
  const currentMonthDays = calendarDays.filter(d => d !== null) as DayStatus[]
  const totalBookingsThisMonth = currentMonthDays.reduce((acc, d) => acc + d.bookedSlots, 0)
  const fullyBookedDays = currentMonthDays.filter(d => d.status === 'full').length
  const availableDays = currentMonthDays.filter(d => d.status === 'available').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#DFB13B]/20 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-[#DFB13B] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Calendar Container - Clean White Design */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Calendar Header */}
        <div className="px-3 sm:px-6 py-3 sm:py-5 border-b border-slate-100">
          <div className="flex items-center justify-between gap-2">
            {/* Month Navigation */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center bg-slate-100 rounded-lg sm:rounded-xl p-0.5 sm:p-1">
                <button
                  onClick={prevMonth}
                  className="w-7 h-7 sm:w-9 sm:h-9 rounded-md sm:rounded-lg hover:bg-white hover:shadow-sm flex items-center justify-center transition-all"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                </button>
                <button
                  onClick={nextMonth}
                  className="w-7 h-7 sm:w-9 sm:h-9 rounded-md sm:rounded-lg hover:bg-white hover:shadow-sm flex items-center justify-center transition-all"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                </button>
              </div>
              <div>
                <h2 className="text-sm sm:text-xl font-bold text-slate-900">
                  {new Intl.DateTimeFormat('en-US', { timeZone: BELGIUM_TZ, month: 'short', year: 'numeric' }).format(currentDate)}
                </h2>
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={goToToday}
              className="px-3 sm:px-4 py-1.5 sm:py-2.5 bg-slate-900 text-white rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm hover:bg-slate-800 transition-all"
            >
              Today
            </button>
          </div>

          {/* Legend - Horizontal */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-6 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500"></div>
              <span className="text-slate-600 text-[10px] sm:text-sm">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500"></div>
              <span className="text-slate-600 text-[10px] sm:text-sm">Partial</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-500"></div>
              <span className="text-slate-600 text-[10px] sm:text-sm">Full</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-300"></div>
              <span className="text-slate-600 text-[10px] sm:text-sm">Blocked/Off</span>
            </div>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-800">
          {weekDays.map((day, idx) => (
            <div
              key={day}
              className={`py-2 sm:py-3 text-center text-[10px] sm:text-sm font-bold uppercase tracking-wide ${
                idx === 0 || idx === 6 ? 'text-slate-400' : 'text-white'
              }`}
            >
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{weekDaysShort[idx]}</span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((dayStatus, index) => {
            if (!dayStatus) {
              return (
                <div
                  key={index}
                  className="min-h-[52px] sm:min-h-[110px] bg-slate-50/50 border-b border-r border-slate-200"
                />
              )
            }

            const isToday = todayBelgiumStr === dayStatus.dateStr
            const isPast = dayStatus.dateStr < todayBelgiumStr
            // Derive weekend from dayStatus.dateStr which is already Belgium-calendar-correct
            const [_y, _m, _d] = dayStatus.dateStr.split('-').map(Number)
            const dayOfWeek = new Date(Date.UTC(_y, _m - 1, _d, 12)).getUTCDay()
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

            return (
              <button
                key={index}
                onClick={() => handleDayClick(dayStatus)}
                className={`min-h-[52px] sm:min-h-[110px] border-b border-r border-slate-200 p-1.5 sm:p-3 transition-all hover:bg-slate-50 relative ${
                  isPast ? 'opacity-50' : ''
                } bg-white ${isToday ? 'ring-2 ring-inset ring-[#DFB13B]' : ''}`}
              >
                {/* Status Indicator Dot */}
                <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
                  <div
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                      dayStatus.status === 'available'
                        ? 'bg-emerald-500'
                        : dayStatus.status === 'partial'
                        ? 'bg-amber-500'
                        : dayStatus.status === 'full'
                        ? 'bg-rose-500'
                        : 'bg-slate-400'
                    }`}
                  />
                </div>

                {/* Date Number */}
                <div
                  className={`text-sm sm:text-2xl font-bold mb-0.5 sm:mb-2 ${
                    isToday
                      ? 'text-[#DFB13B]'
                      : isWeekend
                      ? 'text-slate-500'
                      : 'text-slate-800'
                  }`}
                >
                  {Number(dayStatus.dateStr.split('-')[2])}
                </div>

                {/* Status Text */}
                <div className="space-y-0.5 sm:space-y-1 text-left">
                  {dayStatus.status === 'blocked' && (
                    <div className="hidden sm:block">
                      {dayStatus.blockReason ? (
                        <div className="text-[9px] sm:text-[11px] font-semibold text-red-500 truncate max-w-[80px] lg:max-w-[100px]" title={dayStatus.blockReason}>{dayStatus.blockReason}</div>
                      ) : (
                        <div className="text-[8px] sm:text-xs font-medium text-slate-600">Blocked</div>
                      )}
                    </div>
                  )}

                  {dayStatus.status === 'non-working' && (
                    <div className="text-[8px] sm:text-xs font-medium text-slate-500">Off</div>
                  )}

                  {dayStatus.bookedSlots > 0 && dayStatus.status !== 'blocked' && dayStatus.status !== 'non-working' && (
                    <div
                      className={`text-[9px] sm:text-xs font-semibold ${
                        dayStatus.status === 'full'
                          ? 'text-rose-600'
                          : dayStatus.status === 'partial'
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {dayStatus.bookedSlots}/{dayStatus.totalSlots}
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Stats Cards - Below Calendar */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4">
          <div className="w-9 h-9 sm:w-12 sm:h-12 bg-emerald-100 rounded-lg sm:rounded-xl flex items-center justify-center">
            <Calendar className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-600" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-lg sm:text-2xl font-bold text-slate-900">{availableDays}</p>
            <p className="text-[10px] sm:text-sm text-slate-500">Available Days</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4">
          <div className="w-9 h-9 sm:w-12 sm:h-12 bg-amber-100 rounded-lg sm:rounded-xl flex items-center justify-center">
            <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-amber-600" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-lg sm:text-2xl font-bold text-slate-900">{totalBookingsThisMonth}</p>
            <p className="text-[10px] sm:text-sm text-slate-500">Bookings</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4">
          <div className="w-9 h-9 sm:w-12 sm:h-12 bg-rose-100 rounded-lg sm:rounded-xl flex items-center justify-center">
            <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-rose-600" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-lg sm:text-2xl font-bold text-slate-900">{fullyBookedDays}</p>
            <p className="text-[10px] sm:text-sm text-slate-500">Fully Booked</p>
          </div>
        </div>
      </div>

      {/* Day Details Modal */}
      {isModalOpen && selectedDay && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="relative overflow-hidden">
              <div
                className={`absolute inset-0 ${
                  selectedDay.status === 'available'
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                    : selectedDay.status === 'partial'
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                    : selectedDay.status === 'full'
                    ? 'bg-gradient-to-br from-rose-500 to-pink-600'
                    : 'bg-gradient-to-br from-slate-600 to-slate-700'
                }`}
              />
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              <div className="relative px-6 py-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/70 text-sm font-medium">
                      {new Intl.DateTimeFormat('en-US', { timeZone: BELGIUM_TZ, weekday: 'long' }).format(selectedDay.date)}
                    </p>
                    <h3 className="text-2xl font-bold text-white mt-1">
                      {new Intl.DateTimeFormat('en-US', { timeZone: BELGIUM_TZ, month: 'long', day: 'numeric', year: 'numeric' }).format(selectedDay.date)}
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Status Badge */}
                <div className="mt-4">
                  <span className="px-3 py-1.5 bg-white/20 backdrop-blur rounded-full text-white text-sm font-medium">
                    {selectedDay.status === 'available' && 'All slots available'}
                    {selectedDay.status === 'partial' && `${selectedDay.availableSlots} of ${selectedDay.totalSlots} slots available`}
                    {selectedDay.status === 'full' && 'Fully booked'}
                    {selectedDay.status === 'blocked' && (selectedDay.blockReason ? `Blocked: ${selectedDay.blockReason}` : 'Day is blocked')}
                    {selectedDay.status === 'non-working' && 'Non-working day'}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[50vh] overflow-y-auto">
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-emerald-50 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-600">{selectedDay.availableSlots}</p>
                  <p className="text-xs text-emerald-600/70 font-medium mt-1">Available</p>
                </div>
                <div className="bg-amber-50 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-bold text-amber-600">{selectedDay.bookedSlots}</p>
                  <p className="text-xs text-amber-600/70 font-medium mt-1">Booked</p>
                </div>
                <div className="bg-slate-100 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-bold text-slate-600">{selectedDay.blockedSlots.length}</p>
                  <p className="text-xs text-slate-500 font-medium mt-1">Blocked</p>
                </div>
              </div>

              {/* Bookings List */}
              {selectedDay.bookings.length > 0 && (
                <div className="mb-5">
                  <h4 className="font-semibold text-slate-800 text-sm mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                    </div>
                    Bookings ({selectedDay.bookings.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedDay.bookings.map(booking => (
                      <div
                        key={booking._id}
                        className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-2xl p-4 border border-slate-100"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-violet-500/30">
                            {booking.firstName[0]}{booking.lastName[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">
                              {booking.firstName} {booking.lastName}
                            </p>
                            <p className="text-xs text-slate-500 truncate max-w-[150px]">
                              {booking.serviceTitle}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1.5 text-slate-600 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-sm font-semibold">{booking.appointmentTime}</span>
                          </div>
                          <span
                            className={`text-[10px] font-bold uppercase mt-1.5 inline-block ${
                              booking.status === 'confirmed'
                                ? 'text-emerald-600'
                                : booking.status === 'pending'
                                ? 'text-amber-600'
                                : 'text-slate-500'
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Blocked Slots */}
              {selectedDay.blockedSlots.length > 0 && !selectedDay.isFullDayBlocked && (
                <div className="mb-5">
                  <h4 className="font-semibold text-slate-800 text-sm mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-slate-200 flex items-center justify-center">
                      <Ban className="w-3.5 h-3.5 text-slate-600" />
                    </div>
                    Blocked Time Slots
                    {selectedDay.blockReason && (
                      <span className="text-xs text-slate-400 font-normal ml-1">— {selectedDay.blockReason}</span>
                    )}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDay.blockedSlots.map(slot => (
                      <span
                        key={slot}
                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium border border-slate-200"
                      >
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Day Blocked Notice */}
              {selectedDay.isFullDayBlocked && (
                <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl p-6 text-center border border-slate-200">
                  <div className="w-14 h-14 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Ban className="w-7 h-7 text-slate-500" />
                  </div>
                  <p className="text-slate-700 font-semibold">This day is fully blocked</p>
                  {selectedDay.blockReason ? (
                    <p className="text-sm text-slate-500 mt-1">Reason: <span className="font-medium text-slate-600">{selectedDay.blockReason}</span></p>
                  ) : (
                    <p className="text-sm text-slate-500 mt-1">No bookings can be made</p>
                  )}
                </div>
              )}

              {/* Non-working Day Notice */}
              {selectedDay.status === 'non-working' && (
                <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl p-6 text-center border border-slate-200">
                  <div className="w-14 h-14 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-7 h-7 text-slate-500" />
                  </div>
                  <p className="text-slate-700 font-semibold">Non-working day</p>
                  <p className="text-sm text-slate-500 mt-1">This day is not scheduled for work</p>
                </div>
              )}

              {/* Empty State */}
              {selectedDay.bookings.length === 0 &&
               selectedDay.blockedSlots.length === 0 &&
               !selectedDay.isFullDayBlocked &&
               selectedDay.status !== 'non-working' && (
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 text-center border border-emerald-100">
                  <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-7 h-7 text-emerald-600" />
                  </div>
                  <p className="text-emerald-700 font-semibold">All slots available</p>
                  <p className="text-sm text-emerald-600 mt-1">{selectedDay.totalSlots} time slots open for booking</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full py-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-slate-900/20 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookingCalendar
