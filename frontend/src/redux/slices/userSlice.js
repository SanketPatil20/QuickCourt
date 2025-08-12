import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'
import { toast } from 'react-hot-toast'

const initialState = {
  profile: null,
  bookings: [],
  reviews: [],
  isLoading: false,
  error: null,
  stats: {
    total: 0,
    completed: 0,
    cancelled: 0,
    upcoming: 0
  }
}

// Upload avatar
export const uploadAvatar = createAsyncThunk(
  'user/uploadAvatar',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const response = await api.post('/users/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      toast.success('Avatar updated successfully!')
      return response.data.data.avatar
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to upload avatar'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Fetch user bookings with stats
export const fetchUserBookingsWithStats = createAsyncThunk(
  'user/fetchUserBookingsWithStats',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/bookings', { params })
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch bookings'
      return rejectWithValue(message)
    }
  }
)

// Fetch user reviews
export const fetchUserReviews = createAsyncThunk(
  'user/fetchUserReviews',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/reviews', { params })
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch reviews'
      return rejectWithValue(message)
    }
  }
)

// Delete user account
export const deleteUserAccount = createAsyncThunk(
  'user/deleteAccount',
  async (_, { rejectWithValue }) => {
    try {
      await api.delete('/users/account')
      toast.success('Account deleted successfully')
      return true
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete account'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setProfile: (state, action) => {
      state.profile = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Upload avatar
      .addCase(uploadAvatar.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.isLoading = false
        if (state.profile) {
          state.profile.avatar = action.payload
        }
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch user bookings with stats
      .addCase(fetchUserBookingsWithStats.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserBookingsWithStats.fulfilled, (state, action) => {
        state.isLoading = false
        state.bookings = action.payload.bookings
        state.stats = action.payload.stats
      })
      .addCase(fetchUserBookingsWithStats.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch user reviews
      .addCase(fetchUserReviews.fulfilled, (state, action) => {
        state.reviews = action.payload.reviews
      })
      
      // Delete account
      .addCase(deleteUserAccount.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteUserAccount.fulfilled, (state) => {
        state.isLoading = false
        // Clear all user data
        state.profile = null
        state.bookings = []
        state.reviews = []
        state.stats = initialState.stats
      })
      .addCase(deleteUserAccount.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export const { clearError, setProfile } = userSlice.actions
export default userSlice.reducer



