import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useForm, useFieldArray } from 'react-hook-form'
import { createFacility } from '../../redux/slices/facilitySlice'
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  MapPin,
  Clock,
  Users
} from 'lucide-react'
const CreateFacility = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isLoading } = useSelector((state) => state.facilities)
  const [currentStep, setCurrentStep] = useState(1)
  const [uploadedImages, setUploadedImages] = useState([])
  const [imageFiles, setImageFiles] = useState([])

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      description: '',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: '',
        landmark: ''
      },
      contactInfo: {
        phone: '',
        email: '',
        website: ''
      },
      sportsTypes: [{ name: 'Badminton' }],
      operatingHours: {
        monday: { open: '06:00', close: '22:00', closed: false },
        tuesday: { open: '06:00', close: '22:00', closed: false },
        wednesday: { open: '06:00', close: '22:00', closed: false },
        thursday: { open: '06:00', close: '22:00', closed: false },
        friday: { open: '06:00', close: '22:00', closed: false },
        saturday: { open: '06:00', close: '23:00', closed: false },
        sunday: { open: '07:00', close: '21:00', closed: false }
      },
      pricing: {
        basePrice: '',
        peakHourMultiplier: '1.5',
        weekendMultiplier: '1.2'
      },
      policies: {
        cancellationHours: '24',
        advanceBookingDays: '30',
        refundPolicy: 'full'
      }
    }
  })

  const { fields: sportsFields, append: appendSport, remove: removeSport } = useFieldArray({
    control,
    name: 'sportsTypes'
  })



  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    
    // Store actual files for form submission
    setImageFiles(prev => [...prev, ...files])
    
    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImages(prev => [...prev, {
          id: Date.now() + Math.random(),
          url: e.target.result,
          file: file,
          name: file.name
        }])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (imageId) => {
    const imageToRemove = uploadedImages.find(img => img.id === imageId)
    if (imageToRemove) {
      // Remove from files array
      setImageFiles(prev => prev.filter(file => file.name !== imageToRemove.file.name))
      // Remove from preview array
      setUploadedImages(prev => prev.filter(img => img.id !== imageId))
    }
  }

  const onSubmit = async (data) => {
    try {
      console.log('Form data received:', data)
      
      // Create FormData for file upload
      const formData = new FormData()
      
      // Transform data to match backend expectations
      const transformedData = {
        name: data.name,
        description: data.description,
        address: {
          street: data.address.street,
          city: data.address.city,
          state: data.address.state,
          zipCode: data.address.pincode, // Transform pincode to zipCode
          landmark: data.address.landmark || '',
          coordinates: {
            latitude: 0, // Default coordinates - in real app, get from geocoding
            longitude: 0
          }
        },
        contactInfo: {
          phone: data.contactInfo.phone.replace(/\D/g, ''), // Remove non-digits
          email: data.contactInfo.email,
          website: data.contactInfo.website || ''
        },
        sportsOffered: data.sportsTypes.map(sport => sport.name).filter(name => name), // Transform sportsTypes to sportsOffered
        operatingHours: data.operatingHours,
        pricing: {
          basePrice: parseFloat(data.pricing.basePrice) || 0,
          peakHourMultiplier: parseFloat(data.pricing.peakHourMultiplier) || 1.5,
          weekendMultiplier: parseFloat(data.pricing.weekendMultiplier) || 1.2
        },
        policies: data.policies
      }
      
      console.log('Transformed data:', transformedData)
      
      // Add transformed data to FormData
      Object.keys(transformedData).forEach(key => {
        if (typeof transformedData[key] === 'object') {
          formData.append(key, JSON.stringify(transformedData[key]))
        } else {
          formData.append(key, transformedData[key])
        }
      })
      
      console.log('FormData entries:')
      for (let [key, value] of formData.entries()) {
        console.log(key, value)
      }
      
      // Add image files
      imageFiles.forEach((file) => {
        formData.append('images', file)
      })
      
      // Dispatch the create facility action
      const result = await dispatch(createFacility(formData))
      
      if (createFacility.fulfilled.match(result)) {
        navigate('/owner/facilities')
      }
    } catch (error) {
      console.error('Error creating facility:', error)
    }
  }

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <React.Fragment key={step}>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step <= currentStep ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            {step}
          </div>
          {step < 4 && (
            <div className={`w-16 h-1 ${
              step < currentStep ? 'bg-primary-600' : 'bg-gray-300'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  )

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facility Name *
              </label>
              <input
                {...register('name', { required: 'Facility name is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter facility name"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Describe your facility..."
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <input
                  {...register('address.street', { required: 'Street address is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Street address"
                />
                {errors.address?.street && (
                  <p className="text-red-600 text-sm mt-1">{errors.address.street.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  {...register('address.city', { required: 'City is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="City"
                />
                {errors.address?.city && (
                  <p className="text-red-600 text-sm mt-1">{errors.address.city.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <select
                  {...register('address.state', { required: 'State is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select State</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Gujarat">Gujarat</option>
                </select>
                {errors.address?.state && (
                  <p className="text-red-600 text-sm mt-1">{errors.address.state.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PIN Code *
                </label>
                <input
                  {...register('address.pincode', { 
                    required: 'PIN code is required',
                    pattern: {
                      value: /^\d{6}$/,
                      message: 'PIN code must be 6 digits'
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="123456"
                />
                {errors.address?.pincode && (
                  <p className="text-red-600 text-sm mt-1">{errors.address.pincode.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Landmark (Optional)
              </label>
              <input
                {...register('address.landmark')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Near famous landmark"
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Sports & Contact</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sports Types *
              </label>
              {sportsFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2 mb-2">
                  <select
                    {...register(`sportsTypes.${index}.name`, { required: 'Sport type is required' })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select Sport</option>
                    <option value="Badminton">Badminton</option>
                    <option value="Tennis">Tennis</option>
                    <option value="Basketball">Basketball</option>
                    <option value="Football">Football</option>
                    <option value="Cricket">Cricket</option>
                    <option value="Volleyball">Volleyball</option>
                    <option value="Table Tennis">Table Tennis</option>
                  </select>
                  {sportsFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSport(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => appendSport({ name: '' })}
                className="flex items-center text-primary-600 hover:text-primary-700 text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Another Sport
              </button>
            </div>



            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Information
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    {...register('contactInfo.phone', { 
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[6-9]\d{9}$/,
                        message: 'Please enter a valid 10-digit phone number'
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Phone Number (10 digits)"
                    maxLength="10"
                  />
                  {errors.contactInfo?.phone && (
                    <p className="text-red-600 text-sm mt-1">{errors.contactInfo.phone.message}</p>
                  )}
                </div>
                <div>
                  <input
                    {...register('contactInfo.email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Email Address"
                  />
                  {errors.contactInfo?.email && (
                    <p className="text-red-600 text-sm mt-1">{errors.contactInfo.email.message}</p>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <input
                  {...register('contactInfo.website')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Website (Optional)"
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Operating Hours & Pricing</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Operating Hours
              </label>
              <div className="space-y-3">
                {Object.keys(watch('operatingHours')).map((day) => (
                  <div key={day} className="flex items-center gap-4">
                    <div className="w-24">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {day}
                      </span>
                    </div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        {...register(`operatingHours.${day}.closed`)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-2"
                      />
                      <span className="text-sm text-gray-600">Closed</span>
                    </label>
                    {!watch(`operatingHours.${day}.closed`) && (
                      <>
                        <input
                          type="time"
                          {...register(`operatingHours.${day}.open`)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          {...register(`operatingHours.${day}.close`)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Pricing Configuration
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Base Price per Hour (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    {...register('pricing.basePrice', { 
                      required: 'Base price is required',
                      min: {
                        value: 0,
                        message: 'Base price must be greater than 0'
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="500"
                  />
                  {errors.pricing?.basePrice && (
                    <p className="text-red-600 text-xs mt-1">{errors.pricing.basePrice.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Peak Hour Multiplier
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('pricing.peakHourMultiplier')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="1.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Weekend Multiplier
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('pricing.weekendMultiplier')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="1.2"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Booking Policies
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Cancellation Hours
                  </label>
                  <select
                    {...register('policies.cancellationHours')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="2">2 Hours</option>
                    <option value="6">6 Hours</option>
                    <option value="12">12 Hours</option>
                    <option value="24">24 Hours</option>
                    <option value="48">48 Hours</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Advance Booking Days
                  </label>
                  <select
                    {...register('policies.advanceBookingDays')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="7">7 Days</option>
                    <option value="15">15 Days</option>
                    <option value="30">30 Days</option>
                    <option value="60">60 Days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Refund Policy
                  </label>
                  <select
                    {...register('policies.refundPolicy')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="full">Full Refund</option>
                    <option value="partial">Partial Refund</option>
                    <option value="none">No Refund</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Photos & Final Review</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Upload Photos
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Upload photos of your facility
                      </span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                    <p className="mt-1 text-sm text-gray-500">
                      PNG, JPG, GIF up to 10MB each
                    </p>
                  </div>
                </div>
              </div>
              
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {uploadedImages.map((image) => (
                    <div key={image.id} className="relative">
                      <img
                        src={image.url}
                        alt="Facility"
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Review Your Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> {watch('name')}</p>
                <p><span className="font-medium">Address:</span> {watch('address.street')}, {watch('address.city')}</p>
                <p><span className="font-medium">Sports:</span> {watch('sportsTypes')?.map(s => s.name).join(', ')}</p>
                <p><span className="font-medium">Base Price:</span> ₹{watch('pricing.basePrice')} per hour</p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/owner/facilities')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Facility</h1>
            <p className="text-gray-600 mt-1">Create a new sports facility listing</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <StepIndicator />
          
          <form onSubmit={handleSubmit(onSubmit)}>
            {renderStep()}
            
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`btn btn-outline btn-md ${
                  currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Previous
              </button>
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn btn-primary btn-md"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary btn-md disabled:opacity-50"
                >
                  {isLoading ? 'Creating...' : 'Create Facility'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateFacility
