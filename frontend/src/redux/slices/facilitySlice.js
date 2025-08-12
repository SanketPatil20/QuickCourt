import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'
import { toast } from 'react-hot-toast'

const initialState = {
  facilities: [],
  currentFacility: null,
  popularFacilities: [],
  myFacilities: [],
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalFacilities: 0,
    hasNextPage: false,
    hasPrevPage: false
  }
}

// Fetch facilities with filters
export const fetchFacilities = createAsyncThunk(
  'facilities/fetchFacilities',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/facilities', { params })
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch facilities'
      return rejectWithValue(message)
    }
  }
)

// Fetch single facility
export const fetchFacility = createAsyncThunk(
  'facilities/fetchFacility',
  async (facilityId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/facilities/${facilityId}`)
      return response.data.data.facility
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch facility'
      return rejectWithValue(message)
    }
  }
)

// Fetch popular facilities
export const fetchPopularFacilities = createAsyncThunk(
  'facilities/fetchPopularFacilities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/facilities/popular')
      return response.data.data.facilities
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch popular facilities'
      return rejectWithValue(message)
    }
  }
)

// Fetch my facilities (for facility owners)
export const fetchMyFacilities = createAsyncThunk(
  'facilities/fetchMyFacilities',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/facilities/owner/my-facilities', { params })
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch your facilities'
      return rejectWithValue(message)
    }
  }
)

// Create facility
export const createFacility = createAsyncThunk(
  'facilities/createFacility',
  async (facilityData, { rejectWithValue }) => {
    try {
      const response = await api.post('/facilities', facilityData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      toast.success('Facility created successfully!')
      return response.data.data.facility
    } catch (error) {
      console.error('Create facility error:', error.response?.data)
      const message = error.response?.data?.message || 'Failed to create facility'
      const errors = error.response?.data?.errors || []
      
      if (errors.length > 0) {
        // Show first validation error
        toast.error(`Validation Error: ${errors[0].msg}`)
        return rejectWithValue({ message, errors })
      } else {
        toast.error(message)
        return rejectWithValue(message)
      }
    }
  }
)

// Update facility
export const updateFacility = createAsyncThunk(
  'facilities/updateFacility',
  async ({ facilityId, facilityData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/facilities/${facilityId}`, facilityData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      toast.success('Facility updated successfully!')
      return response.data.data.facility
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update facility'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Delete facility
export const deleteFacility = createAsyncThunk(
  'facilities/deleteFacility',
  async (facilityId, { rejectWithValue }) => {
    try {
      await api.delete(`/facilities/${facilityId}`)
      toast.success('Facility deleted successfully!')
      return facilityId
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete facility'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

const facilitySlice = createSlice({
  name: 'facilities',
  initialState,
  reducers: {
    clearCurrentFacility: (state) => {
      state.currentFacility = null
    },
    clearError: (state) => {
      state.error = null
    },
    resetFacilities: (state) => {
      state.facilities = []
      state.pagination = initialState.pagination
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch facilities
      .addCase(fetchFacilities.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchFacilities.fulfilled, (state, action) => {
        state.isLoading = false
        state.facilities = action.payload.facilities
        state.pagination = action.payload.pagination
      })
      .addCase(fetchFacilities.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch single facility
      .addCase(fetchFacility.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchFacility.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentFacility = action.payload
      })
      .addCase(fetchFacility.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch popular facilities
      .addCase(fetchPopularFacilities.fulfilled, (state, action) => {
        state.popularFacilities = action.payload
      })
      
      // Fetch my facilities
      .addCase(fetchMyFacilities.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMyFacilities.fulfilled, (state, action) => {
        state.isLoading = false
        state.myFacilities = action.payload.facilities
        state.pagination = action.payload.pagination
      })
      .addCase(fetchMyFacilities.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Create facility
      .addCase(createFacility.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createFacility.fulfilled, (state, action) => {
        state.isLoading = false
        state.myFacilities.unshift(action.payload)
      })
      .addCase(createFacility.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Update facility
      .addCase(updateFacility.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateFacility.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.myFacilities.findIndex(f => f._id === action.payload._id)
        if (index !== -1) {
          state.myFacilities[index] = action.payload
        }
        if (state.currentFacility?._id === action.payload._id) {
          state.currentFacility = action.payload
        }
      })
      .addCase(updateFacility.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Delete facility
      .addCase(deleteFacility.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteFacility.fulfilled, (state, action) => {
        state.isLoading = false
        state.myFacilities = state.myFacilities.filter(f => f._id !== action.payload)
        if (state.currentFacility?._id === action.payload) {
          state.currentFacility = null
        }
      })
      .addCase(deleteFacility.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export const { clearCurrentFacility, clearError, resetFacilities } = facilitySlice.actions
export default facilitySlice.reducer
