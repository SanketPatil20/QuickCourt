import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'
import { toast } from 'react-hot-toast'

const initialState = {
  bookings: [],
  currentBooking: null,
  availableSlots: [],
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalBookings: 0
  }
}

// Create booking
export const createBooking = createAsyncThunk(
  'bookings/createBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await api.post('/bookings', bookingData)
      toast.success('Booking created successfully!')
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create booking'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Fetch user bookings
export const fetchUserBookings = createAsyncThunk(
  'bookings/fetchUserBookings',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/bookings', { params })
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch bookings'
      return rejectWithValue(message)
    }
  }
)

// Fetch single booking
export const fetchBooking = createAsyncThunk(
  'bookings/fetchBooking',
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/bookings/${bookingId}`)
      return response.data.data.booking
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch booking'
      return rejectWithValue(message)
    }
  }
)

// Update booking status
export const updateBookingStatus = createAsyncThunk(
  'bookings/updateBookingStatus',
  async ({ bookingId, status, reason }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/bookings/${bookingId}/status`, { status, reason })
      toast.success(`Booking ${status} successfully!`)
      return response.data.data.booking
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update booking status'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Confirm payment
export const confirmPayment = createAsyncThunk(
  'bookings/confirmPayment',
  async ({ bookingId, paymentId, orderId, signature }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/bookings/${bookingId}/confirm-payment`, {
        paymentId,
        orderId,
        signature
      })
      toast.success('Payment confirmed successfully!')
      return response.data.data.booking
    } catch (error) {
      const message = error.response?.data?.message || 'Payment confirmation failed'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Fetch available slots
export const fetchAvailableSlots = createAsyncThunk(
  'bookings/fetchAvailableSlots',
  async ({ courtId, date }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/bookings/available-slots/${courtId}`, {
        params: { date }
      })
      return response.data.data.availableSlots
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch available slots'
      return rejectWithValue(message)
    }
  }
)

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearCurrentBooking: (state) => {
      state.currentBooking = null
    },
    clearError: (state) => {
      state.error = null
    },
    clearAvailableSlots: (state) => {
      state.availableSlots = []
    }
  },
  extraReducers: (builder) => {
    builder
      // Create booking
      .addCase(createBooking.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.isLoading = false
        // Add the new booking to the beginning of the list
        if (action.payload && action.payload.booking) {
          console.log('Adding booking to state:', action.payload.booking)
          state.bookings.unshift(action.payload.booking)
        } else {
          console.log('No booking found in payload:', action.payload)
        }
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch user bookings
      .addCase(fetchUserBookings.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserBookings.fulfilled, (state, action) => {
        state.isLoading = false
        state.bookings = action.payload.bookings
        state.pagination = action.payload.pagination
      })
      .addCase(fetchUserBookings.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch single booking
      .addCase(fetchBooking.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchBooking.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentBooking = action.payload
      })
      .addCase(fetchBooking.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Update booking status
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const index = state.bookings.findIndex(b => b._id === action.payload._id)
        if (index !== -1) {
          state.bookings[index] = action.payload
        }
        if (state.currentBooking?._id === action.payload._id) {
          state.currentBooking = action.payload
        }
      })
      
      // Confirm payment
      .addCase(confirmPayment.fulfilled, (state, action) => {
        const index = state.bookings.findIndex(b => b._id === action.payload._id)
        if (index !== -1) {
          state.bookings[index] = action.payload
        }
        if (state.currentBooking?._id === action.payload._id) {
          state.currentBooking = action.payload
        }
      })
      
      // Fetch available slots
      .addCase(fetchAvailableSlots.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAvailableSlots.fulfilled, (state, action) => {
        state.isLoading = false
        state.availableSlots = action.payload
      })
      .addCase(fetchAvailableSlots.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.availableSlots = []
      })
  }
})

export const { clearCurrentBooking, clearError, clearAvailableSlots } = bookingSlice.actions
export default bookingSlice.reducer

