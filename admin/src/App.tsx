import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import RentalBooking from './pages/RentalBooking'
import MassageBooking from './pages/MassageBooking'
import Inquiries from './pages/Inquiries'
import Services from './pages/Services'
import Testimonials from './pages/Testimonials'
import Properties from './pages/Properties'
import Users from './pages/Users'
import BookingManagement from './pages/BookingManagement'
import CalendarView from './pages/CalendarView'
import HealthCheck from './pages/HealthCheck'
import FAQs from './pages/FAQs'
import ProtectedRoute from './components/ProtectedRoute'

// Meenakshi
import Consultations from './pages/Consultations'
import MeenakshiServices from './pages/MeenakshiServices'
import MeenakshiTestimonials from './pages/MeenakshiTestimonials'
import MeenakshiFaqs from './pages/MeenakshiFaqs'
import MeenakshiJourney from './pages/MeenakshiJourney'
import MeenakshiLegal from './pages/MeenakshiLegal'
import MeenakshiSettings from './pages/MeenakshiSettings'
import Enquiries from './pages/Enquiries'
import BlogPosts from './pages/BlogPosts'
import Customers from './pages/Customers'

function App() {
  return (
    <BrowserRouter basename="/admin">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        {/* Meenakshi */}
        <Route path="/consultations" element={<ProtectedRoute><Consultations /></ProtectedRoute>} />
        <Route path="/m/services" element={<ProtectedRoute><MeenakshiServices /></ProtectedRoute>} />
        <Route path="/m/testimonials" element={<ProtectedRoute><MeenakshiTestimonials /></ProtectedRoute>} />
        <Route path="/m/faq" element={<ProtectedRoute><MeenakshiFaqs /></ProtectedRoute>} />
        <Route path="/m/journey" element={<ProtectedRoute><MeenakshiJourney /></ProtectedRoute>} />
        <Route path="/m/legal" element={<ProtectedRoute><MeenakshiLegal /></ProtectedRoute>} />
        <Route path="/m/settings" element={<ProtectedRoute><MeenakshiSettings /></ProtectedRoute>} />
        {/* Availability: the ZenYourLife screen, repointed at the Meenakshi models */}
        <Route path="/booking-management" element={<ProtectedRoute><BookingManagement /></ProtectedRoute>} />
        <Route path="/m/enquiries" element={<ProtectedRoute><Enquiries /></ProtectedRoute>} />
        <Route path="/m/blog" element={<ProtectedRoute><BlogPosts /></ProtectedRoute>} />
        <Route path="/m/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />

        <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
        <Route path="/health" element={<ProtectedRoute><HealthCheck /></ProtectedRoute>} />

        {/* ZenYourLife — retired from the nav, routes kept until the data is
            confirmed dead (Phase 5 of MEENAKSHI-INTEGRATION-PLAN.md). */}
        <Route path="/bookings" element={<ProtectedRoute><RentalBooking /></ProtectedRoute>} />
        <Route path="/massage-appointments" element={<ProtectedRoute><MassageBooking /></ProtectedRoute>} />
        <Route path="/booking-calendar" element={<ProtectedRoute><CalendarView /></ProtectedRoute>} />
        <Route path="/inquiries" element={<ProtectedRoute><Inquiries /></ProtectedRoute>} />
        <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
        <Route path="/testimonials" element={<ProtectedRoute><Testimonials /></ProtectedRoute>} />
        <Route path="/faq" element={<ProtectedRoute><FAQs /></ProtectedRoute>} />
        <Route path="/properties" element={<ProtectedRoute><Properties /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
