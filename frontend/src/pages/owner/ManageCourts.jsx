import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Settings,
  Clock,
  DollarSign,
  Users,
  MapPin,
  ToggleLeft,
  ToggleRight,
  Calendar,
  AlertTriangle
} from 'lucide-react'
const ManageCourts = () => {
  const { id: facilityId } = useParams()
  const navigate = useNavigate()
  
  const [activeTab, setActiveTab] = useState('courts') // courts, schedule, pricing
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCourt, setSelectedCourt] = useState(null)

  // Mock data - in real app, this would come from API
  const [facility, setFacility] = useState({
    id: 1,
    name: 'Elite Sports Complex',
    address: '123 Main St, Mumbai'
  })

  const [courts, setCourts] = useState([
    {
      id: 1,
      name: 'Court 1',
      sportType: 'Badminton',
      capacity: 4,
      basePrice: 500,
      peakPrice: 750,
      isActive: true,
      dimensions: '13.4m x 6.1m',
      surface: 'Wooden',
      amenities: ['AC', 'Lighting', 'Sound System'],
      maintenanceSchedule: [],
      bookings: 45,
      revenue: 22500
    },
    {
      id: 2,
      name: 'Court 2',
      sportType: 'Badminton',
      capacity: 4,
      basePrice: 500,
      peakPrice: 750,
      isActive: true,
      dimensions: '13.4m x 6.1m',
      surface: 'Wooden',
      amenities: ['AC', 'Lighting'],
      maintenanceSchedule: [
        { date: '2024-01-15', time: '10:00-12:00', reason: 'Floor cleaning' }
      ],
      bookings: 38,
      revenue: 19000
    },
    {
      id: 3,
      name: 'Tennis Court 1',
      sportType: 'Tennis',
      capacity: 4,
      basePrice: 800,
      peakPrice: 1200,
      isActive: false,
      dimensions: '23.77m x 10.97m',
      surface: 'Clay',
      amenities: ['Lighting', 'Net'],
      maintenanceSchedule: [
        { date: '2024-01-12', time: '09:00-17:00', reason: 'Surface repair' }
      ],
      bookings: 0,
      revenue: 0
    }
  ])

  const [timeSlots, setTimeSlots] = useState([
    { time: '06:00', duration: 60, isPeak: false },
    { time: '07:00', duration: 60, isPeak: false },
    { time: '08:00', duration: 60, isPeak: false },
    { time: '09:00', duration: 60, isPeak: true },
    { time: '10:00', duration: 60, isPeak: true },
    { time: '11:00', duration: 60, isPeak: true },
    { time: '12:00', duration: 60, isPeak: false },
    { time: '13:00', duration: 60, isPeak: false },
    { time: '14:00', duration: 60, isPeak: false },
    { time: '15:00', duration: 60, isPeak: false },
    { time: '16:00', duration: 60, isPeak: true },
    { time: '17:00', duration: 60, isPeak: true },
    { time: '18:00', duration: 60, isPeak: true },
    { time: '19:00', duration: 60, isPeak: true },
    { time: '20:00', duration: 60, isPeak: true },
    { time: '21:00', duration: 60, isPeak: false }
  ])

  const [newCourt, setNewCourt] = useState({
    name: '',
    sportType: 'Badminton',
    capacity: 4,
    basePrice: '',
    peakPrice: '',
    dimensions: '',
    surface: '',
    amenities: []
  })

  const sportTypes = ['Badminton', 'Tennis', 'Basketball', 'Football', 'Cricket', 'Volleyball']
  const surfaceTypes = ['Wooden', 'Synthetic', 'Clay', 'Grass', 'Concrete']
  const availableAmenities = ['AC', 'Lighting', 'Sound System', 'Scoreboard', 'Net', 'Seating']

  const handleAddCourt = () => {
    const court = {
      ...newCourt,
      id: Date.now(),
      isActive: true,
      maintenanceSchedule: [],
      bookings: 0,
      revenue: 0,
      peakPrice: newCourt.peakPrice || (newCourt.basePrice * 1.5)
    }
    setCourts([...courts, court])
    setNewCourt({
      name: '',
      sportType: 'Badminton',
      capacity: 4,
      basePrice: '',
      peakPrice: '',
      dimensions: '',
      surface: '',
      amenities: []
    })
    setShowAddModal(false)
  }

  const handleDeleteCourt = (court) => {
    setSelectedCourt(court)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    setCourts(courts.filter(c => c.id !== selectedCourt.id))
    setShowDeleteModal(false)
    setSelectedCourt(null)
  }

  const toggleCourtStatus = (courtId) => {
    setCourts(courts.map(court => 
      court.id === courtId 
        ? { ...court, isActive: !court.isActive }
        : court
    ))
  }

  const togglePeakHour = (time) => {
    setTimeSlots(timeSlots.map(slot =>
      slot.time === time
        ? { ...slot, isPeak: !slot.isPeak }
        : slot
    ))
  }

  const CourtCard = ({ court }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary-500">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{court.name}</h3>
            <button
              onClick={() => toggleCourtStatus(court.id)}
              className="flex items-center"
            >
              {court.isActive ? (
                <ToggleRight className="w-6 h-6 text-green-500" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-gray-400" />
              )}
            </button>
          </div>
          <div className="flex items-center text-sm text-gray-600 mb-1">
            <MapPin className="w-4 h-4 mr-1" />
            {court.sportType} • {court.dimensions}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-1" />
            Capacity: {court.capacity} players
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded">
            <Edit className="w-4 h-4 text-gray-600" />
          </button>
          <button 
            onClick={() => handleDeleteCourt(court)}
            className="p-2 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center text-sm text-gray-600 mb-1">
            <DollarSign className="w-4 h-4 mr-1" />
            Pricing
          </div>
          <div className="text-sm">
            <div>Base: ₹{court.basePrice}/hr</div>
            <div>Peak: ₹{court.peakPrice}/hr</div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center text-sm text-gray-600 mb-1">
            <Calendar className="w-4 h-4 mr-1" />
            This Month
          </div>
          <div className="text-sm">
            <div>{court.bookings} bookings</div>
            <div>₹{court.revenue.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-2">Surface: {court.surface}</div>
        <div className="flex flex-wrap gap-1">
          {court.amenities.map((amenity, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {amenity}
            </span>
          ))}
        </div>
      </div>

      {court.maintenanceSchedule.length > 0 && (
        <div className="border-t pt-3">
          <div className="flex items-center text-sm text-amber-600 mb-2">
            <AlertTriangle className="w-4 h-4 mr-1" />
            Upcoming Maintenance
          </div>
          {court.maintenanceSchedule.map((maintenance, index) => (
            <div key={index} className="text-sm text-gray-600">
              {maintenance.date} {maintenance.time} - {maintenance.reason}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'courts':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Courts</h2>
                <p className="text-gray-600">Manage your facility's courts</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary btn-md flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Court
              </button>
            </div>

            {courts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courts.map((court) => (
                  <CourtCard key={court.id} court={court} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courts added yet</h3>
                <p className="text-gray-600 mb-6">Add your first court to start accepting bookings</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn btn-primary btn-md"
                >
                  Add Your First Court
                </button>
              </div>
            )}
          </div>
        )

      case 'schedule':
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Time Slot Management</h2>
              <p className="text-gray-600">Configure operating hours and peak times</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Time Slots</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
                {timeSlots.map((slot) => (
                  <div
                    key={slot.time}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      slot.isPeak
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                    onClick={() => togglePeakHour(slot.time)}
                  >
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">
                        {slot.time}
                      </div>
                      <div className="text-xs text-gray-600">
                        {slot.duration}min
                      </div>
                      <div className={`text-xs font-medium mt-1 ${
                        slot.isPeak ? 'text-yellow-600' : 'text-gray-500'
                      }`}>
                        {slot.isPeak ? 'Peak' : 'Regular'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Click on time slots to toggle between regular and peak hours. Peak hours apply higher pricing.
              </p>
            </div>
          </div>
        )

      case 'pricing':
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Pricing Management</h2>
              <p className="text-gray-600">Set pricing for different courts and time periods</p>
            </div>

            <div className="space-y-6">
              {courts.map((court) => (
                <div key={court.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{court.name}</h3>
                    <span className="text-sm text-gray-600">{court.sportType}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Base Price (₹/hour)
                      </label>
                      <input
                        type="number"
                        value={court.basePrice}
                        onChange={(e) => {
                          const newPrice = parseInt(e.target.value)
                          setCourts(courts.map(c => 
                            c.id === court.id 
                              ? { ...c, basePrice: newPrice }
                              : c
                          ))
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Peak Price (₹/hour)
                      </label>
                      <input
                        type="number"
                        value={court.peakPrice}
                        onChange={(e) => {
                          const newPrice = parseInt(e.target.value)
                          setCourts(courts.map(c => 
                            c.id === court.id 
                              ? { ...c, peakPrice: newPrice }
                              : c
                          ))
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weekend Multiplier
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        <option value="1.0">No change (1.0x)</option>
                        <option value="1.2">20% increase (1.2x)</option>
                        <option value="1.5">50% increase (1.5x)</option>
                        <option value="2.0">Double (2.0x)</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/owner/facilities')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Courts</h1>
            <p className="text-gray-600 mt-1">{facility.name}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'courts', label: 'Courts', icon: MapPin },
                { key: 'schedule', label: 'Schedule', icon: Clock },
                { key: 'pricing', label: 'Pricing', icon: DollarSign }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === key
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>

        {/* Add Court Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Court</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Court Name
                    </label>
                    <input
                      type="text"
                      value={newCourt.name}
                      onChange={(e) => setNewCourt({ ...newCourt, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Court 1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sport Type
                    </label>
                    <select
                      value={newCourt.sportType}
                      onChange={(e) => setNewCourt({ ...newCourt, sportType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {sportTypes.map(sport => (
                        <option key={sport} value={sport}>{sport}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Capacity
                    </label>
                    <input
                      type="number"
                      value={newCourt.capacity}
                      onChange={(e) => setNewCourt({ ...newCourt, capacity: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Base Price (₹/hr)
                    </label>
                    <input
                      type="number"
                      value={newCourt.basePrice}
                      onChange={(e) => setNewCourt({ ...newCourt, basePrice: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Peak Price (₹/hr)
                    </label>
                    <input
                      type="number"
                      value={newCourt.peakPrice}
                      onChange={(e) => setNewCourt({ ...newCourt, peakPrice: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dimensions
                    </label>
                    <input
                      type="text"
                      value={newCourt.dimensions}
                      onChange={(e) => setNewCourt({ ...newCourt, dimensions: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="13.4m x 6.1m"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Surface Type
                    </label>
                    <select
                      value={newCourt.surface}
                      onChange={(e) => setNewCourt({ ...newCourt, surface: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select Surface</option>
                      {surfaceTypes.map(surface => (
                        <option key={surface} value={surface}>{surface}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amenities
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {availableAmenities.map(amenity => (
                      <label key={amenity} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newCourt.amenities.includes(amenity)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewCourt({ ...newCourt, amenities: [...newCourt.amenities, amenity] })
                            } else {
                              setNewCourt({ ...newCourt, amenities: newCourt.amenities.filter(a => a !== amenity) })
                            }
                          }}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 btn btn-outline btn-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCourt}
                  className="flex-1 btn btn-primary btn-md"
                >
                  Add Court
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Delete Court
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{selectedCourt?.name}"? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 btn btn-outline btn-md"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 btn btn-danger btn-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageCourts
