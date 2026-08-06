import { Navigate } from 'react-router-dom'
import { isAdminAuthenticated } from '../utils/cookies'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Check if admin session cookie exists
  if (!isAdminAuthenticated()) {
    // Redirect to login page if not authenticated (basename is /admin, so this goes to /admin/)
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
