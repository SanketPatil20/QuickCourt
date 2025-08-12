import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { updateProfile, changePassword } from '../../redux/slices/authSlice'
import { uploadAvatar } from '../../redux/slices/userSlice'
import { fetchUserBookings } from '../../redux/slices/bookingSlice'
import { useForm } from 'react-hook-form'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { UserIcon, CameraIcon, CalendarIcon } from '@heroicons/react/24/outline'

const Profile = () => {
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState('profile')
  const { user, isLoading } = useSelector((state) => state.auth)
  const { bookings, isLoading: bookingsLoading } = useSelector((state) => state.bookings)
  const dispatch = useDispatch()

  // Check URL parameter for tab
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam === 'bookings') {
      setActiveTab('bookings')
    }
  }, [searchParams])
  // Fetch bookings when component mounts or when bookings tab is active
  useEffect(() => {
    if (activeTab === 'bookings') {
      dispatch(fetchUserBookings())
    }
  }, [dispatch, activeTab])

  // Only fetch bookings when the bookings tab is active
  useEffect(() => {
    if (activeTab === 'bookings') {
      dispatch(fetchUserBookings()).then((result) => {
        console.log('Fetched bookings result:', result)
      })
    }
  }, [dispatch, activeTab])

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      'address.street': user?.address?.street || '',
      'address.city': user?.address?.city || '',
      'address.state': user?.address?.state || '',
      'address.zipCode': user?.address?.zipCode || '',
    }
  })

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors }, reset } = useForm()

  const onProfileSubmit = async (data) => {
    const address = {
      street: data['address.street'],
      city: data['address.city'],
      state: data['address.state'],
      zipCode: data['address.zipCode'],
    }
    
    await dispatch(updateProfile({
      name: data.name,
      phone: data.phone,
      address
    }))
  }

  const onPasswordSubmit = async (data) => {
    await dispatch(changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    }))
    reset()
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      dispatch(uploadAvatar(file))
    }
  }



  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>

        <div className="bg-white rounded-lg shadow">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'profile'
                    ? 'border-b-2 border-primary-500 text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'bookings'
                    ? 'border-b-2 border-primary-500 text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                My Bookings
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'password'
                    ? 'border-b-2 border-primary-500 text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Change Password
              </button>
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'profile' && (
              <div>
                {/* Avatar Section */}
                <div className="flex items-center mb-8">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-10 h-10 text-gray-400" />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-primary-600 rounded-full p-1 cursor-pointer hover:bg-primary-700">
                      <CameraIcon className="w-4 h-4 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{user?.name}</h3>
                    <p className="text-gray-600">{user?.email}</p>
                    <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        {...register('name', { required: 'Name is required' })}
                        className={`input w-full ${errors.name ? 'input-error' : ''}`}
                      />
                      {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        {...register('phone', { required: 'Phone is required' })}
                        className={`input w-full ${errors.phone ? 'input-error' : ''}`}
                      />
                      {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <input
                      {...register('address.street')}
                      className="input w-full"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        {...register('address.city')}
                        className="input w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        {...register('address.state')}
                        className="input w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Zip Code
                      </label>
                      <input
                        {...register('address.zipCode')}
                        className="input w-full"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn btn-primary"
                    >
                      {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                      Update Profile
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div>
                                 <div className="flex items-center justify-between mb-6">
                   <h3 className="text-lg font-medium text-gray-900">My Bookings</h3>
                   <a href="/my-bookings" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                     View All Bookings →
                   </a>
                 </div>

                {bookingsLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="md" />
                  </div>
                ) : bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{booking.facility?.name}</h4>
                            <p className="text-sm text-gray-600">{booking.court?.name}</p>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <CalendarIcon className="w-4 h-4 mr-1" />
                              {new Date(booking.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })} at {booking.timeSlot?.startTime}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                            <p className="text-sm font-medium text-gray-900 mt-1">
                              ₹{booking.pricing?.totalAmount}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                                 ) : (
                   <div className="text-center py-8">
                     <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                     <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                     <p className="text-gray-600 mb-4">Start by booking a court at your favorite facility</p>
                     <a href="/facilities" className="btn btn-primary">
                       Browse Facilities
                     </a>
                   </div>
                 )}
              </div>
            )}

            {activeTab === 'password' && (
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    {...registerPassword('currentPassword', { required: 'Current password is required' })}
                    type="password"
                    className={`input w-full ${passwordErrors.currentPassword ? 'input-error' : ''}`}
                  />
                  {passwordErrors.currentPassword && (
                    <p className="text-red-600 text-sm mt-1">{passwordErrors.currentPassword.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    {...registerPassword('newPassword', { 
                      required: 'New password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    })}
                    type="password"
                    className={`input w-full ${passwordErrors.newPassword ? 'input-error' : ''}`}
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-red-600 text-sm mt-1">{passwordErrors.newPassword.message}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary"
                  >
                    {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                    Change Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile


