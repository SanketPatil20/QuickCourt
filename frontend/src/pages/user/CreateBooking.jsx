import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchFacility } from '../../redux/slices/facilitySlice'
import { fetchAvailableSlots, createBooking } from '../../redux/slices/bookingSlice'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  StarIcon,
  ArrowLeftIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
const CreateBooking = () => {
  const { facilityId, courtId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const { currentFacility: facility, isLoading: facilityLoading } = useSelector((state) => state.facilities)
  const { availableSlots, isLoading: slotsLoading } = useSelector((state) => state.bookings)
  const { user } = useSelector((state) => state.auth)

  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('')
  const [bookingData, setBookingData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    duration: 1,
    totalAmount: 0,
    specialRequests: ''
  })

  // Fetch facility and court data
  useEffect(() => {
    if (facilityId) {
      dispatch(fetchFacility(facilityId))
    }
  }, [dispatch, facilityId])

  // Fetch available slots when date changes
  useEffect(() => {
    if (selectedDate && courtId) {
      console.log('Fetching slots for:', { courtId, date: selectedDate })
      dispatch(fetchAvailableSlots({ courtId, date: selectedDate }))
        .unwrap()
        .then((slots) => {
          console.log('Available slots received:', slots)
        })
        .catch((error) => {
          console.error('Failed to fetch slots:', error)
        })
    }
  }, [dispatch, courtId, selectedDate])

  // Generate mock available slots for development (remove when API is working)
  const generateMockSlots = () => {
    const slots = []
    for (let hour = 6; hour <= 22; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`
      const price = hour >= 18 && hour <= 21 ? 800 : 600 // Peak hours pricing
      slots.push({
        startTime: time,
        endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
        duration: 1,
        price,
        isPeakHour: hour >= 18 && hour <= 21
      })
    }
    return slots
  }

  // Use mock data if API is not available
  const displaySlots = availableSlots.length > 0 ? availableSlots : generateMockSlots()

  // Get the selected court
  const selectedCourt = facility?.courts?.find(court => court._id === courtId)

  // Handle date selection
  const handleDateChange = (date) => {
    setSelectedDate(date)
    setSelectedTimeSlot('')
    setBookingData(prev => ({
      ...prev,
      date,
      startTime: '',
      endTime: '',
      totalAmount: 0
    }))
  }

  // Handle time slot selection
  const handleTimeSlotSelect = (slot) => {
    setSelectedTimeSlot(slot.startTime)
    const [startHour] = slot.startTime.split(':')
    const endHour = parseInt(startHour) + bookingData.duration
    const endTime = `${endHour.toString().padStart(2, '0')}:00`
    
    const totalAmount = slot.price * bookingData.duration

    setBookingData(prev => ({
      ...prev,
      startTime: slot.startTime,
      endTime,
      totalAmount
    }))
  }

  // Handle duration change
  const handleDurationChange = (duration) => {
    const selectedSlot = displaySlots.find(slot => slot.startTime === selectedTimeSlot)
    const price = selectedSlot ? selectedSlot.price : selectedCourt?.pricing?.hourlyRate
    
    setBookingData(prev => ({
      ...prev,
      duration: parseInt(duration),
      totalAmount: price * parseInt(duration)
    }))
    
    if (selectedTimeSlot) {
      const [startHour] = selectedTimeSlot.split(':')
      const endHour = parseInt(startHour) + parseInt(duration)
      const endTime = `${endHour.toString().padStart(2, '0')}:00`
      
      setBookingData(prev => ({
        ...prev,
        endTime
      }))
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!bookingData.date || !bookingData.startTime) {
      alert('Please select a date and time slot')
      return
    }

    const bookingPayload = {
      facility: facilityId,
      court: courtId,
      date: bookingData.date,
      timeSlot: {
        startTime: bookingData.startTime,
        endTime: bookingData.endTime
      },
      participants: {
        count: 1,
        details: [
          {
            name: user?.name || 'User',
            email: user?.email,
            phone: user?.phone
          }
        ]
      },
      specialRequests: bookingData.specialRequests,
      paymentMethod: 'stripe'
    }

    try {
      const result = await dispatch(createBooking(bookingPayload))
      console.log('Booking creation result:', result)
      if (createBooking.fulfilled.match(result)) {
        console.log('Booking created successfully:', result.payload.booking)
        // Navigate to payment page with booking and Razorpay order data
        navigate(`/payment/${result.payload.booking._id}`, {
          state: {
            booking: result.payload.booking,
            razorpayOrder: result.payload.razorpayOrder
          }
        })
      }
    } catch (error) {
      console.error('Booking failed:', error)
    }
  }

  // Generate available dates (next 30 days)
  const generateAvailableDates = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }
    
    return dates
  }

  if (facilityLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!facility || !selectedCourt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Facility or Court not found</h2>
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
            to={`/facilities/${facilityId}`}
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Facility
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Book Court</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Date & Time</h2>
              
              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Date
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {generateAvailableDates().map((date) => {
                    const dateObj = new Date(date)
                    const isSelected = selectedDate === date
                    const isToday = date === new Date().toISOString().split('T')[0]
                    
                    return (
                      <button
                        key={date}
                        onClick={() => handleDateChange(date)}
                        className={`p-3 text-center rounded-lg border transition-colors ${
                          isSelected
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300'
                        }`}
                      >
                        <div className="text-xs font-medium">
                          {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className="text-lg font-semibold">
                          {dateObj.getDate()}
                        </div>
                        {isToday && (
                          <div className="text-xs">Today</div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Duration Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Duration (hours)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((duration) => (
                    <button
                      key={duration}
                      onClick={() => handleDurationChange(duration)}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        bookingData.duration === duration
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300'
                      }`}
                    >
                      {duration} {duration === 1 ? 'Hour' : 'Hours'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Available Time Slots
                    {availableSlots.length === 0 && displaySlots.length > 0 && (
                      <span className="ml-2 text-xs text-orange-600">(Using demo data)</span>
                    )}
                  </label>
                  {slotsLoading ? (
                    <div className="flex justify-center py-4">
                      <LoadingSpinner size="md" />
                    </div>
                  ) : displaySlots.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2">
                      {displaySlots.map((slot) => (
                        <button
                          key={slot.startTime}
                          onClick={() => handleTimeSlotSelect(slot)}
                          className={`p-3 text-center rounded-lg border transition-colors ${
                            selectedTimeSlot === slot.startTime
                              ? 'bg-primary-600 text-white border-primary-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300'
                          }`}
                        >
                          <div className="text-sm font-medium">{slot.startTime}</div>
                          <div className="text-xs text-gray-500">₹{slot.price}</div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No available slots for this date
                    </p>
                  )}
                </div>
              )}

              {/* Special Requests */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests (Optional)
                </label>
                <textarea
                  value={bookingData.specialRequests}
                  onChange={(e) => setBookingData(prev => ({ ...prev, specialRequests: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Any special requests or notes..."
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!selectedDate || !selectedTimeSlot || slotsLoading}
                className="w-full btn btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {slotsLoading ? 'Loading...' : 'Confirm Booking'}
              </button>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
              
              {/* Facility Info */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900">{facility.name}</h4>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <MapPinIcon className="w-4 h-4 mr-1" />
                  {facility.address?.city}, {facility.address?.state}
                </div>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                  {facility.rating?.average || 0} ({facility.rating?.count || 0} reviews)
                </div>
              </div>

              {/* Court Info */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">{selectedCourt.name}</h4>
                <p className="text-sm text-gray-600">{selectedCourt.sport} • {selectedCourt.courtType}</p>
                <p className="text-lg font-bold text-primary-600 mt-1">
                  ₹{selectedCourt.pricing?.hourlyRate}/hour
                </p>
              </div>

              {/* Booking Details */}
              {selectedDate && (
                <div className="mb-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {new Date(selectedDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  {selectedTimeSlot && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-medium">
                          {selectedTimeSlot} - {bookingData.endTime}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{bookingData.duration} hour{bookingData.duration > 1 ? 's' : ''}</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Total */}
              {bookingData.totalAmount > 0 && (
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary-600">₹{bookingData.totalAmount}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateBooking

