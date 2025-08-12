import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
  Calendar,
  Filter,
  Search,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  MoreVertical
} from 'lucide-react'
const Bookings = () => {
  const { user } = useSelector((state) => state.auth)
  
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterFacility, setFilterFacility] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // Mock data
  const [facilities] = useState([
    { id: 1, name: 'Elite Sports Complex' },
    { id: 2, name: 'City Sports Arena' },
    { id: 3, name: 'Metro Badminton Club' }
  ])

  const [bookings, setBookings] = useState([
    {
      id: 1,
      bookingNumber: 'QC-2024-001',
      user: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+91 9876543210'
      },
      facility: {
        id: 1,
        name: 'Elite Sports Complex'
      },
      court: {
        id: 1,
        name: 'Court 1',
        sportType: 'Badminton'
      },
      date: '2024-01-15',
      timeSlot: {
        start: '10:00',
        end: '11:00'
      },
      duration: 60,
      basePrice: 500,
      totalAmount: 500,
      status: 'confirmed',
      paymentStatus: 'paid',
      bookingDate: '2024-01-10T14:30:00Z',
      notes: 'Regular booking',
      participants: 4
    },
    {
      id: 2,
      bookingNumber: 'QC-2024-002',
      user: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+91 9876543211'
      },
      facility: {
        id: 1,
        name: 'Elite Sports Complex'
      },
      court: {
        id: 2,
        name: 'Tennis Court 1',
        sportType: 'Tennis'
      },
      date: '2024-01-16',
      timeSlot: {
        start: '18:00',
        end: '19:30'
      },
      duration: 90,
      basePrice: 800,
      totalAmount: 1200,
      status: 'pending',
      paymentStatus: 'pending',
      bookingDate: '2024-01-12T09:15:00Z',
      notes: 'Birthday celebration booking',
      participants: 4
    }
  ])

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPaymentStatusColor = (status) => {
    const colors = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-purple-100 text-purple-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFacility = filterFacility === 'all' || booking.facility.id.toString() === filterFacility
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus
    
    return matchesSearch && matchesFacility && matchesStatus
  })

  const handleStatusUpdate = (bookingId, newStatus) => {
    setBookings(bookings.map(booking =>
      booking.id === bookingId
        ? { ...booking, status: newStatus }
        : booking
    ))
  }

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking)
    setShowDetailsModal(true)
  }

  const BookingCard = ({ booking }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {booking.bookingNumber}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600 mb-1">
            <User className="w-4 h-4 mr-1" />
            {booking.user.name}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-1" />
            {booking.court.name} - {booking.court.sportType}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center text-sm text-gray-600 mb-1">
            <Calendar className="w-4 h-4 mr-1" />
            Date & Time
          </div>
          <div className="text-sm font-medium">
            {new Date(booking.date).toLocaleDateString()}
          </div>
          <div className="text-sm text-gray-600">
            {booking.timeSlot.start} - {booking.timeSlot.end}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center text-sm text-gray-600 mb-1">
            <DollarSign className="w-4 h-4 mr-1" />
            Amount
          </div>
          <div className="text-sm font-medium">
            ₹{booking.totalAmount}
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
            {booking.paymentStatus}
          </span>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => handleViewDetails(booking)}
          className="flex-1 btn btn-outline btn-sm flex items-center justify-center"
        >
          <Eye className="w-4 h-4 mr-1" />
          View Details
        </button>
        
        {booking.status === 'pending' && (
          <>
            <button
              onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
              className="flex-1 btn btn-success btn-sm flex items-center justify-center"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Confirm
            </button>
            <button
              onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
              className="flex-1 btn btn-danger btn-sm flex items-center justify-center"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bookings Overview</h1>
            <p className="text-gray-600 mt-1">Manage all your facility bookings</p>
          </div>
          <button className="btn btn-outline btn-md flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.filter(b => b.status === 'confirmed').length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.filter(b => b.status === 'pending').length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{bookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterFacility}
                onChange={(e) => setFilterFacility(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Facilities</option>
                {facilities.map(facility => (
                  <option key={facility.id} value={facility.id.toString()}>
                    {facility.name}
                  </option>
                ))}
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings Grid */}
        {filteredBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600">
              Try adjusting your search or filters
            </p>
          </div>
        )}

        {/* Booking Details Modal */}
        {showDetailsModal && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Booking Details
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Booking Information</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Booking Number:</span>
                        <span className="font-medium">{selectedBooking.bookingNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">
                          {new Date(selectedBooking.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-medium">
                          {selectedBooking.timeSlot.start} - {selectedBooking.timeSlot.end}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{selectedBooking.user.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{selectedBooking.user.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{selectedBooking.user.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="btn btn-outline btn-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Bookings
