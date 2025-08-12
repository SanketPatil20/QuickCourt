import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'
import { toast } from 'react-hot-toast'

// Get user from localStorage
const getUserFromStorage = () => {
  try {
    const user = localStorage.getItem('quickcourt_user')
    return user ? JSON.parse(user) : null
  } catch (error) {
    return null
  }
}

// Get token from localStorage
const getTokenFromStorage = () => {
  return localStorage.getItem('quickcourt_token')
}

const initialState = {
  user: getUserFromStorage(),
  token: getTokenFromStorage(),
  isLoading: false,
  isAuthenticated: !!getTokenFromStorage(),
  otpSent: false,
  registrationData: null,
}

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData)
      const { user, token } = response.data.data
      
      // Store in localStorage
      localStorage.setItem('quickcourt_token', token)
      localStorage.setItem('quickcourt_user', JSON.stringify(user))
      
      // Set token in axios defaults
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      toast.success('Registration successful! You are now logged in.')
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials)
      const { user, token } = response.data.data
      
      // Store in localStorage
      localStorage.setItem('quickcourt_token', token)
      localStorage.setItem('quickcourt_user', JSON.stringify(user))
      
      // Set token in axios defaults
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      toast.success('Login successful!')
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Verify OTP
export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async (otpData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/verify-otp', otpData)
      const { user, token } = response.data.data
      
      // Store in localStorage
      localStorage.setItem('quickcourt_token', token)
      localStorage.setItem('quickcourt_user', JSON.stringify(user))
      
      // Set token in axios defaults
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      toast.success('Email verified successfully!')
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'OTP verification failed'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Resend OTP
export const resendOTP = createAsyncThunk(
  'auth/resendOTP',
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/resend-otp', { email })
      toast.success('OTP sent successfully!')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send OTP'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Get user profile
export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/profile')
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch profile'
      return rejectWithValue(message)
    }
  }
)

// Update profile
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.put('/auth/profile', profileData)
      
      // Update user in localStorage
      const updatedUser = response.data.data.user
      localStorage.setItem('quickcourt_user', JSON.stringify(updatedUser))
      
      toast.success('Profile updated successfully!')
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Change password
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await api.put('/auth/change-password', passwordData)
      toast.success('Password changed successfully!')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Logout user
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      // Clear localStorage
      localStorage.removeItem('quickcourt_token')
      localStorage.removeItem('quickcourt_user')
      
      // Clear axios default header
      delete api.defaults.headers.common['Authorization']
      
      toast.success('Logged out successfully!')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearOtpSent: (state) => {
      state.otpSent = false
    },
    setRegistrationData: (state, action) => {
      state.registrationData = action.payload
    },
    clearRegistrationData: (state) => {
      state.registrationData = null
    },
    // Initialize auth from localStorage on app start
    initializeAuth: (state) => {
      const token = getTokenFromStorage()
      const user = getUserFromStorage()
      
      if (token && user) {
        state.token = token
        state.user = user
        state.isAuthenticated = true
        // Set token in axios defaults
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.otpSent = false
        state.registrationData = null
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
      })
      
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.otpSent = false
        state.registrationData = null
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
      })
      
      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.otpSent = false
        state.registrationData = null
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Resend OTP
      .addCase(resendOTP.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(resendOTP.fulfilled, (state) => {
        state.isLoading = false
        state.otpSent = true
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        // Update localStorage
        localStorage.setItem('quickcourt_user', JSON.stringify(action.payload.user))
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        // If token is invalid, logout
        if (action.payload.includes('token') || action.payload.includes('authorized')) {
          state.user = null
          state.token = null
          state.isAuthenticated = false
          localStorage.removeItem('quickcourt_token')
          localStorage.removeItem('quickcourt_user')
          delete api.defaults.headers.common['Authorization']
        }
      })
      
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.isLoading = false
        state.error = null
        state.otpSent = false
        state.registrationData = null
      })
  },
})

export const {
  clearError,
  clearOtpSent,
  setRegistrationData,
  clearRegistrationData,
  initializeAuth,
} = authSlice.actions

export default authSlice.reducer
