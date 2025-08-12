import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchUserBookingsWithStats } from '../../redux/slices/userSlice'
import { fetchPopularFacilities } from '../../redux/slices/facilitySlice'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { 
  CalendarIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  MapPinIcon,
  StarIcon
} from '@heroicons/react/24/outline'

const UserDashboard = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { stats, bookings, isLoading } = useSelector((state) => state.user)
  const { popularFacilities } = useSelector((state) => state.facilities)
  useEffect(() => {
    dispatch(fetchUserBookingsWithStats({ limit: 5 }))
    dispatch(fetchPopularFacilities())
  }, [dispatch])

  const getStatusBadge = (status) => {
    const badges = {
      confirmed: 'badge badge-success',
      pending: 'badge badge-warning',
      cancelled: 'badge badge-danger',
      completed: 'badge badge-secondary'
    }
    return badges[status] || 'badge badge-secondary'
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleIcon className="w-4 h-4" />
      case 'cancelled':
        return <XCircleIcon className="w-4 h-4" />
      default:
        return <ClockIcon className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your bookings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <CalendarIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-success-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.completed || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-warning-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.upcoming || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-danger-100 rounded-lg">
                <XCircleIcon className="w-6 h-6 text-danger-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.cancelled || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Bookings */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
                  <Link 
                    to="/my-bookings" 
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    View all
                  </Link>
                </div>
              </div>
              
              <div className="p-6">
                {bookings && bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-gray-900">
                                {booking.facility?.name}
                              </h3>
                              <span className={getStatusBadge(booking.status)}>
                                {getStatusIcon(booking.status)}
                                <span className="ml-1 capitalize">{booking.status}</span>
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              {booking.court?.name} • {booking.court?.sport}
                            </p>
                            <div className="flex items-center text-sm text-gray-500 space-x-4">
                              <span className="flex items-center">
                                <CalendarIcon className="w-4 h-4 mr-1" />
                                {new Date(booking.date).toLocaleDateString()}
                              </span>
                              <span className="flex items-center">
                                <ClockIcon className="w-4 h-4 mr-1" />
                                {booking.timeSlot.startTime} - {booking.timeSlot.endTime}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              ₹{booking.pricing.totalAmount}
                            </p>
                            <Link 
                              to={`/bookings/${booking._id}`}
                              className="text-sm text-primary-600 hover:text-primary-700"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No bookings yet</p>
                    <Link 
                      to="/facilities" 
                      className="btn btn-primary"
                    >
                      Book Your First Court
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Popular Facilities */}
          <div>
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Popular Facilities</h2>
              </div>
              
              <div className="p-6">
                {popularFacilities && popularFacilities.length > 0 ? (
                  <div className="space-y-4">
                    {popularFacilities.slice(0, 5).map((facility) => (
                      <Link 
                        key={facility._id}
                        to={`/facilities/${facility._id}`}
                        className="block hover:bg-gray-50 rounded-lg p-3 -m-3 transition-colors"
                      >
                        <div className="flex items-start space-x-3">
                          <img 
                            src={facility.images?.[0]?.url || '/placeholder-facility.jpg'} 
                            alt={facility.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {facility.name}
                            </p>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <MapPinIcon className="w-4 h-4 mr-1" />
                              <span className="truncate">
                                {facility.address?.city}, {facility.address?.state}
                              </span>
                            </div>
                            <div className="flex items-center mt-1">
                              <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600 ml-1">
                                {facility.rating?.average || 0} ({facility.rating?.count || 0})
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No facilities available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard



