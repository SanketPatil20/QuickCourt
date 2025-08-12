import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchFacility } from '../redux/slices/facilitySlice'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { MapPinIcon, StarIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

const FacilityDetails = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { currentFacility: facility, isLoading } = useSelector((state) => state.facilities)
  const { isAuthenticated } = useSelector((state) => state.auth)

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            <div>
              <img
                src={facility.images?.[0]?.url || '/placeholder-facility.jpg'}
                alt={facility.name}
                className="w-full h-64 lg:h-80 object-cover rounded-lg"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{facility.name}</h1>
              
              <div className="flex items-center mb-4">
                <StarIcon className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="ml-1 text-lg font-medium">
                  {facility.rating?.average || 0}
                </span>
                <span className="ml-2 text-gray-600">
                  ({facility.rating?.count || 0} reviews)
                </span>
              </div>

              <div className="flex items-start mb-4">
                <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-2" />
                <div>
                  <p className="text-gray-900">{facility.address?.street}</p>
                  <p className="text-gray-600">
                    {facility.address?.city}, {facility.address?.state} {facility.address?.zipCode}
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-center">
                  <PhoneIcon className="w-5 h-5 text-gray-400 mr-2" />
                  <span>{facility.contactInfo?.phone}</span>
                </div>
                <div className="flex items-center">
                  <EnvelopeIcon className="w-5 h-5 text-gray-400 mr-2" />
                  <span>{facility.contactInfo?.email}</span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Sports Available</h3>
                <div className="flex flex-wrap gap-2">
                  {facility.sportsOffered?.map((sport) => (
                    <span key={sport} className="badge badge-primary">
                      {sport}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-2xl font-bold text-primary-600 mb-6">
                From ₹{facility.pricing?.basePrice}/hour
              </div>

              {isAuthenticated ? (
                <div className="space-y-3">
                  <Link to={`/facilities/${facility._id}/book`} className="btn btn-primary btn-lg w-full">
                    Book Now
                  </Link>
                  <p className="text-sm text-gray-600 text-center">
                    Select a court and time slot to book
                  </p>
                </div>
              ) : (
                <Link to="/login" className="btn btn-primary btn-lg w-full">
                  Login to Book
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
          <p className="text-gray-700 leading-relaxed">{facility.description}</p>
        </div>

        {/* Courts */}
        {facility.courts && facility.courts.length > 0 && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Courts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {facility.courts.map((court) => (
                <div key={court._id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{court.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{court.sport} • {court.courtType}</p>
                  <p className="text-lg font-bold text-primary-600">
                    ₹{court.pricing?.hourlyRate}/hour
                  </p>
                  {isAuthenticated && (
                    <Link
                      to={`/book/${facility._id}/${court._id}`}
                      className="btn btn-primary btn-sm w-full mt-3"
                    >
                      Book This Court
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FacilityDetails

