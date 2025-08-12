import { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBooking, updateBookingStatus } from '../../redux/slices/bookingSlice'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  StarIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'

const BookingDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const { currentBooking: booking, isLoading } = useSelector((state) => state.bookings)
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    if (id) {
      dispatch(fetchBooking(id))
    }
  }, [dispatch, id])

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
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />
      case 'pending':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
      case 'cancelled':
        return <XCircleIcon className="w-5 h-5 text-red-600" />
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-blue-600" />
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-gray-600" />
    }
  }

  const handleCancelBooking = async () => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await dispatch(updateBookingStatus({ 
          bookingId: id, 
          status: 'cancelled', 
          reason: 'Cancelled by user' 
        }))
      } catch (error) {
        console.error('Failed to cancel booking:', error)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking not found</h2>
          <Link to="/my-bookings" className="btn btn-primary">
            View My Bookings
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/my-bookings"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to My Bookings
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
              <p className="text-gray-600 mt-2">Booking #{booking._id?.slice(-8) || booking.id}</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                {getStatusIcon(booking.status)}
                <span className="ml-1 capitalize">{booking.status}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Facility & Court Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Facility & Court</h2>
              
              <div className="flex items-start space-x-4">
                <img
                  src={booking.facility?.images?.[0]?.url || '/placeholder-facility.jpg'}
                  alt={booking.facility?.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{booking.facility?.name}</h3>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <MapPinIcon className="w-4 h-4 mr-1" />
                    {booking.facility?.address?.street}, {booking.facility?.address?.city}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                    {booking.facility?.rating?.average || 0} ({booking.facility?.rating?.count || 0} reviews)
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">{booking.court?.name}</h4>
                <p className="text-sm text-gray-600">{booking.court?.sport} • {booking.court?.courtType}</p>
                <p className="text-lg font-bold text-primary-600 mt-1">
                  ₹{booking.court?.pricing?.hourlyRate}/hour
                </p>
              </div>
            </div>

            {/* Booking Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(booking.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <ClockIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-medium text-gray-900">
                      {booking.startTime} - {booking.endTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <ClockIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium text-gray-900">{booking.duration} hour{booking.duration > 1 ? 's' : ''}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 text-gray-400">₹</div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-medium text-gray-900">₹{booking.totalAmount}</p>
                  </div>
                </div>
              </div>

              {booking.specialRequests && (
                <div className="mt-6">
                  <p className="text-sm text-gray-600 mb-2">Special Requests</p>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {booking.specialRequests}
                  </p>
                </div>
              )}
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Information</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Status</span>
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                    booking.paymentStatus === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-medium text-gray-900">
                    {booking.paymentMethod || 'Online Payment'}
                  </span>
                </div>

                {booking.paymentStatus === 'paid' && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Paid On</span>
                    <span className="font-medium text-gray-900">
                      {new Date(booking.paidAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {booking.status === 'confirmed' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
                
                <div className="flex space-x-4">
                  <button
                    onClick={handleCancelBooking}
                    className="btn btn-outline btn-error"
                  >
                    Cancel Booking
                  </button>
                  
                  <Link
                    to={`/facilities/${booking.facility?._id}`}
                    className="btn btn-outline btn-primary"
                  >
                    View Facility
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">
                      {booking.facility?.contactInfo?.phone || 'Not available'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">
                      {booking.facility?.contactInfo?.email || 'Not available'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium text-gray-900 mb-2">Booking Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Court Rate:</span>
                    <span>₹{booking.court?.pricing?.hourlyRate}/hour</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span>{booking.duration} hour{booking.duration > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between font-medium text-lg pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-primary-600">₹{booking.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingDetails

