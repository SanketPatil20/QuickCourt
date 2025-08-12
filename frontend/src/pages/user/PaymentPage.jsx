import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { confirmPayment, fetchUserBookings, fetchBooking } from '../../redux/slices/bookingSlice'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { 
  CheckCircleIcon,
  XCircleIcon,
  CreditCardIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline'

const PaymentPage = () => {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  const { currentBooking: booking, isLoading } = useSelector((state) => state.bookings)
  
  // Get booking from location state as fallback
  const bookingFromState = location.state?.booking
  const { user } = useSelector((state) => state.auth)
  
  const [paymentStatus, setPaymentStatus] = useState('pending') // pending, success, failed
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    // Check if we have booking data from the previous page
    if (location.state?.booking && location.state?.razorpayOrder) {
      initializePayment(location.state.razorpayOrder)
    } else if (bookingId && !booking && !bookingFromState) {
      // If we have a bookingId but no booking data, fetch it
      dispatch(fetchBooking(bookingId))
    }
  }, [location.state, bookingId, booking, bookingFromState, dispatch])

  const initializePayment = (razorpayOrder) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_your_key_id', // Replace with your key
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: 'QuickCourt',
      description: `Booking for ${currentBooking?.facility?.name} - ${currentBooking?.court?.name}`,
      order_id: razorpayOrder.id,
      handler: function (response) {
        handlePaymentSuccess(response)
      },
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
        contact: user?.phone || ''
      },
      notes: {
        bookingId: bookingId,
        facilityName: currentBooking?.facility?.name,
        courtName: currentBooking?.court?.name
      },
      theme: {
        color: '#2563eb'
      },
      modal: {
        ondismiss: function() {
          setPaymentStatus('failed')
        }
      }
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  const handlePaymentSuccess = async (response) => {
    setIsProcessing(true)
    try {
      const result = await dispatch(confirmPayment({
        bookingId,
        paymentId: response.razorpay_payment_id,
        orderId: response.razorpay_order_id,
        signature: response.razorpay_signature
      }))

      if (confirmPayment.fulfilled.match(result)) {
        setPaymentStatus('success')
        // Refresh the user's bookings list
        dispatch(fetchUserBookings())
        setTimeout(() => {
          // Navigate to profile page with bookings tab active
          navigate('/profile?tab=bookings')
        }, 3000)
      } else {
        setPaymentStatus('failed')
      }
    } catch (error) {
      console.error('Payment confirmation failed:', error)
      setPaymentStatus('failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRetryPayment = () => {
    if (location.state?.razorpayOrder) {
      setPaymentStatus('pending')
      initializePayment(location.state.razorpayOrder)
    }
  }

  const handleCancelPayment = () => {
    navigate(`/bookings/${bookingId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Use booking from Redux state or fallback to location state
  const currentBooking = booking || bookingFromState

  if (!currentBooking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking not found</h2>
          <p className="text-gray-600 mb-4">The booking information could not be loaded.</p>
          <div className="space-y-2">
            <button 
              onClick={() => navigate('/profile?tab=bookings')}
              className="btn btn-primary mr-2"
            >
              View My Bookings
            </button>
            <button 
              onClick={() => navigate('/facilities')}
              className="btn btn-secondary"
            >
              Browse Facilities
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment</h1>
          <p className="text-gray-600 mt-2">Complete your booking payment</p>
        </div>

        {/* Payment Status */}
        {paymentStatus === 'pending' && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="mb-6">
              <CreditCardIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Pending</h2>
              <p className="text-gray-600">Please complete your payment to confirm your booking</p>
            </div>

            {/* Booking Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-4">Booking Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Facility:</span>
                  <span className="font-medium">{currentBooking.facility?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Court:</span>
                  <span className="font-medium">{currentBooking.court?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {new Date(currentBooking.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">
                    {currentBooking.timeSlot?.startTime} - {currentBooking.timeSlot?.endTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{currentBooking.timeSlot?.duration} hour{currentBooking.timeSlot?.duration > 1 ? 's' : ''}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total Amount:</span>
                    <span className="text-primary-600">₹{currentBooking.pricing?.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Payment Methods</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4 text-center">
                  <CreditCardIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Credit/Debit Cards</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 text-center">
                  <BanknotesIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">UPI & Wallets</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleRetryPayment}
                className="flex-1 btn btn-primary"
                disabled={!location.state?.razorpayOrder}
              >
                Proceed to Payment
              </button>
              <button
                onClick={handleCancelPayment}
                className="flex-1 btn btn-outline"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Payment Success */}
        {paymentStatus === 'success' && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">Your booking has been confirmed successfully!</p>
            
            {/* Booking Summary */}
            <div className="bg-green-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-green-900 mb-2">Booking Confirmed</h3>
              <div className="space-y-1 text-sm text-green-800">
                <div className="flex justify-between">
                  <span>Facility:</span>
                  <span className="font-medium">{currentBooking.facility?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Court:</span>
                  <span className="font-medium">{currentBooking.court?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="font-medium">
                    {new Date(currentBooking.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span className="font-medium">{currentBooking.timeSlot?.startTime}</span>
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">Redirecting to your bookings...</p>
            <div className="animate-pulse">
              <LoadingSpinner size="md" />
            </div>
          </div>
        )}

        {/* Payment Failed */}
        {paymentStatus === 'failed' && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <XCircleIcon className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">Something went wrong with your payment. Please try again.</p>
            <div className="flex gap-4">
              <button
                onClick={handleRetryPayment}
                className="flex-1 btn btn-primary"
                disabled={!location.state?.razorpayOrder}
              >
                Try Again
              </button>
              <button
                onClick={handleCancelPayment}
                className="flex-1 btn btn-outline"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Processing Payment */}
        {isProcessing && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <LoadingSpinner size="lg" />
            <h2 className="text-xl font-semibold text-gray-900 mt-4">Processing Payment...</h2>
            <p className="text-gray-600">Please wait while we confirm your payment.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentPage
