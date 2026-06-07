import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuthStore } from "../../store/auth.store"

interface ProtectedRouteProps {
  requireAdmin?: boolean
}

export default function ProtectedRoute({ requireAdmin = false }: ProtectedRouteProps) {
  const location = useLocation()
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (requireAdmin && user?.role !== "ADMIN") {
    return <Navigate to="/problems" replace />
  }

  return <Outlet />
}
