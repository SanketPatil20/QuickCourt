import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPendingFacilities, approveFacility } from '../../redux/slices/adminSlice'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { 
  BuildingOfficeIcon, 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

const PendingFacilities = () => {
  const dispatch = useDispatch()
  const { pendingFacilities, isLoading } = useSelector((state) => state.admin)
  const [selectedFacility, setSelectedFacility] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [action, setAction] = useState('')
  const [comments, setComments] = useState('')

  useEffect(() => {
    dispatch(fetchPendingFacilities())
  }, [dispatch])

  const handleApprove = (facility) => {
    setSelectedFacility(facility)
    setAction('approved')
    setComments('')
    setShowModal(true)
  }

  const handleReject = (facility) => {
    setSelectedFacility(facility)
    setAction('rejected')
    setComments('')
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (action === 'rejected' && !comments.trim()) {
      alert('Please provide a reason for rejection')
      return
    }

    await dispatch(approveFacility({
      facilityId: selectedFacility._id,
      status: action,
      adminComments: comments
    }))

    setShowModal(false)
    setSelectedFacility(null)
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
          <h1 className="text-3xl font-bold text-gray-900">Pending Facilities</h1>
          <p className="text-gray-600 mt-2">Review and approve facility applications</p>
        </div>

        {/* Facilities List */}
        {pendingFacilities.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending facilities</h3>
            <p className="text-gray-600">All facility applications have been reviewed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pendingFacilities.map((facility) => (
              <div key={facility._id} className="bg-white rounded-lg shadow">
                {/* Facility Image */}
                <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                  {facility.images && facility.images.length > 0 ? (
                    <img
                      src={facility.images[0].url}
                      alt={facility.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BuildingOfficeIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Facility Details */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {facility.name}
                  </h3>
                  
                  <p className="text-gray-600 mb-4">{facility.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      {facility.address.street}, {facility.address.city}, {facility.address.state}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <PhoneIcon className="h-4 w-4 mr-2" />
                      {facility.contactInfo.phone}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <EnvelopeIcon className="h-4 w-4 mr-2" />
                      {facility.contactInfo.email}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Sports Offered:</h4>
                    <div className="flex flex-wrap gap-2">
                      {facility.sportsOffered.map((sport, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {sport}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Owner Details:</h4>
                    <p className="text-sm text-gray-600">
                      {facility.owner.name} ({facility.owner.email})
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(facility)}
                      className="flex-1 btn btn-success"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(facility)}
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
                {action === 'approved' ? 'Approve Facility' : 'Reject Facility'}
              </h3>
              
              <p className="text-gray-600 mb-4">
                {action === 'approved' 
                  ? `Are you sure you want to approve "${selectedFacility?.name}"?`
                  : `Are you sure you want to reject "${selectedFacility?.name}"?`
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

              {action === 'approved' && (
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
                  className={`flex-1 btn ${action === 'approved' ? 'btn-success' : 'btn-danger'}`}
                >
                  {action === 'approved' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PendingFacilities

