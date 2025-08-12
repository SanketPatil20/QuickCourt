import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPendingCourts, approveCourt } from '../../redux/slices/adminSlice'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { 
  MapPinIcon, 
  CurrencyRupeeIcon, 
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

const PendingCourts = () => {
  const dispatch = useDispatch()
  const { pendingCourts, isLoading } = useSelector((state) => state.admin)
  const [selectedCourt, setSelectedCourt] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [action, setAction] = useState('')
  const [comments, setComments] = useState('')

  useEffect(() => {
    dispatch(fetchPendingCourts())
  }, [dispatch])

  const handleApprove = (court) => {
    setSelectedCourt(court)
    setAction('active')
    setComments('')
    setShowModal(true)
  }

  const handleReject = (court) => {
    setSelectedCourt(court)
    setAction('rejected')
    setComments('')
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (action === 'rejected' && !comments.trim()) {
      alert('Please provide a reason for rejection')
      return
    }

    await dispatch(approveCourt({
      courtId: selectedCourt._id,
      status: action,
      adminComments: comments
    }))

    setShowModal(false)
    setSelectedCourt(null)
    setAction('')
    setComments('')
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
          <h1 className="text-3xl font-bold text-gray-900">Pending Courts</h1>
          <p className="text-gray-600 mt-2">Review and approve court applications</p>
        </div>

        {/* Courts List */}
        {pendingCourts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending courts</h3>
            <p className="text-gray-600">All court applications have been reviewed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pendingCourts.map((court) => (
              <div key={court._id} className="bg-white rounded-lg shadow">
                {/* Court Image */}
                <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                  {court.images && court.images.length > 0 ? (
                    <img
                      src={court.images[0].url}
                      alt={court.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MapPinIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Court Details */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {court.name}
                  </h3>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      <span className="font-medium">Facility:</span>
                      <span className="ml-2">{court.facility?.name}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Sport:</span>
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {court.sport}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Type:</span>
                      <span className="ml-2">{court.courtType}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Surface:</span>
                      <span className="ml-2">{court.surface}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <UsersIcon className="h-4 w-4 mr-2" />
                      <span className="font-medium">Capacity:</span>
                      <span className="ml-2">{court.capacity.players} players</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <CurrencyRupeeIcon className="h-4 w-4 mr-2" />
                      <span className="font-medium">Hourly Rate:</span>
                      <span className="ml-2">₹{court.pricing.hourlyRate}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <CurrencyRupeeIcon className="h-4 w-4 mr-2" />
                      <span className="font-medium">Peak Hour Rate:</span>
                      <span className="ml-2">₹{court.pricing.peakHourRate}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Dimensions:</h4>
                    <p className="text-sm text-gray-600">
                      {court.dimensions.length}m × {court.dimensions.width}m ({court.dimensions.unit})
                    </p>
                  </div>

                  {court.amenities && court.amenities.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Amenities:</h4>
                      <div className="flex flex-wrap gap-2">
                        {court.amenities.map((amenity, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Facility Owner:</h4>
                    <p className="text-sm text-gray-600">
                      {court.facility?.owner?.name} ({court.facility?.owner?.email})
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(court)}
                      className="flex-1 btn btn-success"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(court)}
                      className="flex-1 btn btn-danger"
                    >
                      <XCircleIcon className="h-4 w-4 mr-2" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Approval Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {action === 'active' ? 'Approve Court' : 'Reject Court'}
              </h3>
              
              <p className="text-gray-600 mb-4">
                {action === 'active' 
                  ? `Are you sure you want to approve "${selectedCourt?.name}"?`
                  : `Are you sure you want to reject "${selectedCourt?.name}"?`
                }
              </p>

              {action === 'rejected' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for rejection (required)
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows="3"
                    placeholder="Please provide a reason for rejection..."
                  />
                </div>
              )}

              {action === 'active' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comments (optional)
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows="3"
                    placeholder="Any additional comments..."
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className={`flex-1 btn ${action === 'active' ? 'btn-success' : 'btn-danger'}`}
                >
                  {action === 'active' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PendingCourts

