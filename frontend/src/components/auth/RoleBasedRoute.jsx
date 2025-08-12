import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import LoadingSpinner from '../ui/LoadingSpinner'

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on user role
    const redirectPath = user?.role === 'admin' ? '/admin/dashboard' 
                        : user?.role === 'facilityOwner' ? '/owner/dashboard' 
                        : '/dashboard'
    return <Navigate to={redirectPath} replace />
  }

  return children
}

export default RoleBasedRoute



