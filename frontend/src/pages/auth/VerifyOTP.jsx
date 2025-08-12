import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { verifyOTP, resendOTP, clearError } from '../../redux/slices/authSlice'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { toast } from 'react-hot-toast'

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const { isLoading, error, registrationData, isAuthenticated } = useSelector((state) => state.auth)
  const inputRefs = useRef([])

  useEffect(() => {
    // Redirect if no registration data
    if (!registrationData) {
      navigate('/register')
      return
    }

    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate('/dashboard')
      return
    }

    // Clear any existing errors
    dispatch(clearError())

    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [dispatch, navigate, registrationData, isAuthenticated])

  const handleOtpChange = (index, value) => {
    // Only allow single digit
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value

    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleSubmit(newOtp.join(''))
    }
  }

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6)
    
    if (!/^\d+$/.test(pastedData)) {
      toast.error('Please paste only numbers')
      return
    }

    const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''))
    setOtp(newOtp)

    // Focus the next empty field or the last field
    const nextIndex = Math.min(pastedData.length, 5)
    inputRefs.current[nextIndex]?.focus()

    // Auto-submit if complete
    if (pastedData.length === 6) {
      handleSubmit(pastedData)
    }
  }

  const handleSubmit = async (otpValue = otp.join('')) => {
    if (otpValue.length !== 6) {
      toast.error('Please enter complete OTP')
      return
    }

    const result = await dispatch(verifyOTP({
      email: registrationData.email,
      otp: otpValue
    }))

    if (verifyOTP.fulfilled.match(result)) {
      navigate('/dashboard')
    }
  }

  const handleResendOTP = async () => {
    if (!canResend) return

    const result = await dispatch(resendOTP(registrationData.email))
    
    if (resendOTP.fulfilled.match(result)) {
      setCountdown(60)
      setCanResend(false)
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()

      // Restart countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true)
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold gradient-text">QuickCourt</h1>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Verify your email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a 6-digit code to{' '}
            <span className="font-medium text-gray-900">
              {registrationData?.email}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 text-center mb-4">
                Enter verification code
              </label>
              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    disabled={isLoading}
                  />
                ))}
              </div>
            </div>

            <div>
              <button
                onClick={() => handleSubmit()}
                disabled={isLoading || otp.some(digit => !digit)}
                className="btn btn-primary w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Didn't receive the code?{' '}
                {canResend ? (
                  <button
                    onClick={handleResendOTP}
                    className="font-medium text-primary-600 hover:text-primary-500"
                  >
                    Resend OTP
                  </button>
                ) : (
                  <span className="text-gray-400">
                    Resend in {formatTime(countdown)}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyOTP



