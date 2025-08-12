import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchFacility } from '../../redux/slices/facilitySlice'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { 
  MapPinIcon, 
  StarIcon,
  ArrowLeftIcon,
  ClockIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline'

const FacilityBooking = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  
  const { currentFacility: facility, isLoading } = useSelector((state) => state.facilities)
  useEffect(() => {
    if (id) {
      dispatch(fetchFacility(id))
    }
  }, [dispatch, id])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!facility) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Facility not found</h2>
          <Link to="/facilities" className="btn btn-primary">
            Browse Facilities
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
            to={`/facilities/${id}`}
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Facility
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Book a Court</h1>
          <p className="text-gray-600 mt-2">Select a court to continue with your booking</p>
        </div>

        {/* Facility Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-start space-x-4">
            <img
              src={facility.images?.[0]?.url || '/placeholder-facility.jpg'}
              alt={facility.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">{facility.name}</h2>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <MapPinIcon className="w-4 h-4 mr-1" />
                {facility.address?.street}, {facility.address?.city}, {facility.address?.state}
              </div>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                {facility.rating?.average || 0} ({facility.rating?.count || 0} reviews)
              </div>
            </div>
          </div>
        </div>

        {/* Courts Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Courts</h2>
          
          {facility.courts && facility.courts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {facility.courts.map((court) => (
                <div key={court._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{court.name}</h3>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium mr-2">
                        {court.sport}
                      </span>
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                        {court.courtType}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-2" />
                        <span>Available for booking</span>
                      </div>
                      <div className="flex items-center">
                        <CurrencyRupeeIcon className="w-4 h-4 mr-2" />
                        <span className="font-semibold text-primary-600">
                          ₹{court.pricing?.hourlyRate}/hour
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/book/${facility._id}/${court._id}`}
                    className="btn btn-primary w-full"
                  >
                    Book This Court
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <ClockIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courts available</h3>
              <p className="text-gray-600">
                This facility doesn't have any courts available for booking at the moment.
              </p>
            </div>
          )}
        </div>

        {/* Booking Information */}
        <div className="bg-blue-50 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p className="font-medium mb-2">Booking Process:</p>
              <ul className="space-y-1">
                <li>• Select a court from the options above</li>
                <li>• Choose your preferred date and time slot</li>
                <li>• Confirm your booking details</li>
                <li>• Complete payment to secure your slot</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-2">Important Notes:</p>
              <ul className="space-y-1">
                <li>• Bookings can be made up to 30 days in advance</li>
                <li>• Cancellations are allowed up to 24 hours before</li>
                <li>• Payment is required to confirm your booking</li>
                <li>• Please arrive 10 minutes before your scheduled time</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FacilityBooking


