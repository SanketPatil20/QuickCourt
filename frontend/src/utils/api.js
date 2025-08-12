import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('quickcourt_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear local storage and redirect to login
      localStorage.removeItem('quickcourt_token')
      localStorage.removeItem('quickcourt_user')
      
      // Only redirect if not already on auth pages
      const currentPath = window.location.pathname
      const authPaths = ['/login', '/register', '/verify-otp']
      
      if (!authPaths.includes(currentPath)) {
        window.location.href = '/login'
      }
    }
    
    // Handle network errors
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. Please try again.'
    } else if (error.message === 'Network Error') {
      error.message = 'Network error. Please check your connection.'
    }
    
    return Promise.reject(error)
  }
)

export default api

// API endpoints
export const endpoints = {
  // Auth
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    verifyOtp: '/auth/verify-otp',
    resendOtp: '/auth/resend-otp',
    profile: '/auth/profile',
    changePassword: '/auth/change-password',
    logout: '/auth/logout',
  },
  
  // Users
  users: {
    profile: '/users/profile',
    bookings: '/users/bookings',
    reviews: '/users/reviews',
    uploadAvatar: '/users/upload-avatar',
    deleteAccount: '/users/account',
  },
  
  // Facilities
  facilities: {
    list: '/facilities',
    popular: '/facilities/popular',
    create: '/facilities',
    myFacilities: '/facilities/owner/my-facilities',
    single: (id) => `/facilities/${id}`,
    update: (id) => `/facilities/${id}`,
    delete: (id) => `/facilities/${id}`,
    stats: (id) => `/facilities/${id}/stats`,
  },
  
  // Courts
  courts: {
    list: '/courts',
    create: '/courts',
    facility: (facilityId) => `/courts/facility/${facilityId}`,
    single: (id) => `/courts/${id}`,
    update: (id) => `/courts/${id}`,
    delete: (id) => `/courts/${id}`,
  },
  
  // Bookings
  bookings: {
    list: '/bookings',
    create: '/bookings',
    single: (id) => `/bookings/${id}`,
    updateStatus: (id) => `/bookings/${id}/status`,
    confirmPayment: (id) => `/bookings/${id}/confirm-payment`,
    facility: (facilityId) => `/bookings/facility/${facilityId}`,
    availableSlots: (courtId) => `/bookings/available-slots/${courtId}`,
  },
  
  // Admin
  admin: {
    stats: '/admin/stats',
    users: '/admin/users',
    userDetails: (id) => `/admin/users/${id}`,
    updateUserStatus: (id) => `/admin/users/${id}/status`,
    deleteUser: (id) => `/admin/users/${id}`,
    facilities: '/admin/facilities',
    pendingFacilities: '/admin/facilities/pending',
    approveFacility: (id) => `/admin/facilities/${id}/approve`,
    bookings: '/admin/bookings',
  },
  
  // Upload
  upload: {
    image: '/upload/image',
    deleteImage: (publicId) => `/upload/image/${publicId}`,
  },
}



