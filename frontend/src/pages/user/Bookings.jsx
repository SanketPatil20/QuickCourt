import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchUserBookings, updateBookingStatus } from '../../redux/slices/bookingSlice'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'

const UserBookings = () => {
  const dispatch = useDispatch()
  const { bookings, isLoading, pagination } = useSelector((state) => state.bookings)
  
  const [filters, setFilters] = useState({
    status: 'all',
    date: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    dispatch(fetchUserBookings(filters))
  }, [dispatch, filters])

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleIcon className="w-4 h-4 text-green-600" />
      case 'pending':
        return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
      case 'cancelled':
        return <XCircleIcon className="w-4 h-4 text-red-600" />
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4 text-blue-600" />
      default:
        return <ExclamationTriangleIcon className="w-4 h-4 text-gray-600" />
    }
  }

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await dispatch(updateBookingStatus({ 
          bookingId, 
          status: 'cancelled', 
          reason: 'Cancelled by user' 
        }))
      } catch (error) {
        console.error('Failed to cancel booking:', error)
      }
    }
  }

  const filteredBookings = bookings.filter(booking => {
    if (filters.status !== 'all' && booking.status !== filters.status) {
      return false
    }
    if (filters.date && booking.date !== filters.date) {
      return false
    }
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-2">Manage and track your court bookings</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <FunnelIcon className="w-4 h-4 mr-2" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ status: 'all', date: '' })}
                  className="w-full btn btn-outline"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bookings List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <img
                        src={booking.facility?.images?.[0]?.url || '/placeholder-facility.jpg'}
                        alt={booking.facility?.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {booking.facility?.name}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            <span className="ml-1 capitalize">{booking.status}</span>
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <MapPinIcon className="w-4 h-4 mr-1" />
                          {booking.facility?.address?.city}, {booking.facility?.address?.state}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                          {booking.facility?.rating?.average || 0} ({booking.facility?.rating?.count || 0} reviews)
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center">
                            <CalendarIcon className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-gray-600">
                              {new Date(booking.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          
                          <div className="flex items-center">
                            <ClockIcon className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-gray-600">
                              {booking.startTime} - {booking.endTime}
                            </span>
                          </div>
                          
                          <div className="flex items-center">
                            <span className="text-gray-600">Court:</span>
                            <span className="ml-1 font-medium">{booking.court?.name}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <span className="text-gray-600">Amount:</span>
                            <span className="ml-1 font-bold text-primary-600">₹{booking.totalAmount}</span>
                          </div>
                        </div>

                        {booking.specialRequests && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Special Requests:</span> {booking.specialRequests}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                      <Link
                        to={`/bookings/${booking._id}`}
                        className="btn btn-primary btn-sm"
                      >
                        View Details
                      </Link>
                      
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          className="btn btn-outline btn-error btn-sm"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 mb-4">
              <CalendarIcon className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-6">
              {filters.status !== 'all' || filters.date 
                ? 'Try adjusting your filters to see more results.'
                : 'You haven\'t made any bookings yet.'
              }
            </p>
            <Link to="/facilities" className="btn btn-primary">
              Browse Facilities
            </Link>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => dispatch(fetchUserBookings({ ...filters, page }))}
                  className={`px-4 py-2 rounded-md ${
                    page === pagination.currentPage
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserBookings

