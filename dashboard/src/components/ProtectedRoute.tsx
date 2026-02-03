import { Navigate } from 'react-router-dom'
import { apiService } from '@/services/api'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (!apiService.isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
