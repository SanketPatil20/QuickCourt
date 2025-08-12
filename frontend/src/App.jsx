import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { initializeAuth } from './redux/slices/authSlice'

// Layout Components
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ProtectedRoute from './components/auth/ProtectedRoute'
import RoleBasedRoute from './components/auth/RoleBasedRoute'

// Public Pages
import Home from './pages/Home'
import Facilities from './pages/Facilities'
import FacilityDetails from './pages/FacilityDetails'
import About from './pages/About'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// User Pages
import UserDashboard from './pages/user/Dashboard'
import UserProfile from './pages/user/Profile'
import UserBookings from './pages/user/Bookings'
import BookingDetails from './pages/user/BookingDetails'
import CreateBooking from './pages/user/CreateBooking'
import FacilityBooking from './pages/user/FacilityBooking'
import PaymentPage from './pages/user/PaymentPage'

// Facility Owner Pages
import OwnerDashboard from './pages/owner/Dashboard'
import OwnerFacilities from './pages/owner/Facilities'
import CreateFacility from './pages/owner/CreateFacility'
import EditFacility from './pages/owner/EditFacility'
import OwnerBookings from './pages/owner/Bookings'
import ManageCourts from './pages/owner/ManageCourts'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminFacilities from './pages/admin/Facilities'
import AdminBookings from './pages/admin/Bookings'
import PendingFacilities from './pages/admin/PendingFacilities'
import PendingCourts from './pages/admin/PendingCourts'

// Loading Component
import LoadingSpinner from './components/ui/LoadingSpinner'

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated, user, isLoading } = useSelector((state) => state.auth)

  useEffect(() => {
    // Initialize auth state from localStorage
    dispatch(initializeAuth())
  }, [dispatch])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/facilities" element={<Facilities />} />
          <Route path="/facilities/:id" element={<FacilityDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Auth Routes - Redirect if already authenticated */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? (
                <Navigate to={getDashboardRoute(user?.role)} replace />
              ) : (
                <Login />
              )
            } 
          />
          <Route 
            path="/register" 
            element={
              isAuthenticated ? (
                <Navigate to={getDashboardRoute(user?.role)} replace />
              ) : (
                <Register />
              )
            } 
          />


          {/* Protected User Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />
          <Route path="/my-bookings" element={
            <ProtectedRoute>
              <UserBookings />
            </ProtectedRoute>
          } />
          <Route path="/bookings/:id" element={
            <ProtectedRoute>
              <BookingDetails />
            </ProtectedRoute>
          } />
          <Route path="/book/:facilityId/:courtId" element={
            <ProtectedRoute>
              <CreateBooking />
            </ProtectedRoute>
          } />
          <Route path="/facilities/:id/book" element={
            <ProtectedRoute>
              <FacilityBooking />
            </ProtectedRoute>
          } />
          <Route path="/payment/:bookingId" element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          } />

          {/* Facility Owner Routes */}
          <Route path="/owner/*" element={
            <RoleBasedRoute allowedRoles={['facilityOwner', 'admin']}>
              <Routes>
                <Route path="dashboard" element={<OwnerDashboard />} />
                <Route path="facilities" element={<OwnerFacilities />} />
                <Route path="facilities/new" element={<CreateFacility />} />
                <Route path="facilities/:id/edit" element={<EditFacility />} />
                <Route path="facilities/:id/courts" element={<ManageCourts />} />
                <Route path="bookings" element={<OwnerBookings />} />
              </Routes>
            </RoleBasedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <RoleBasedRoute allowedRoles={['admin']}>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="facilities" element={<AdminFacilities />} />
                <Route path="facilities/pending" element={<PendingFacilities />} />
                <Route path="courts/pending" element={<PendingCourts />} />
                <Route path="bookings" element={<AdminBookings />} />
              </Routes>
            </RoleBasedRoute>
          } />

          {/* Catch all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

// Helper function to get dashboard route based on user role
function getDashboardRoute(role) {
  switch (role) {
    case 'admin':
      return '/admin/dashboard'
    case 'facilityOwner':
      return '/owner/dashboard'
    default:
      return '/dashboard'
  }
}

export default App
