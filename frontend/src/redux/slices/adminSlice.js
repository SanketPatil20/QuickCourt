import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'
import { toast } from 'react-hot-toast'

const initialState = {
  stats: null,
  pendingFacilities: [],
  pendingCourts: [],
  users: [],
  isLoading: false,
  error: null
}

// Fetch dashboard stats
export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/dashboard')
      return response.data.data.stats
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch dashboard stats'
      return rejectWithValue(message)
    }
  }
)

// Fetch pending facilities
export const fetchPendingFacilities = createAsyncThunk(
  'admin/fetchPendingFacilities',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/facilities/pending', { params })
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch pending facilities'
      return rejectWithValue(message)
    }
  }
)

// Approve/Reject facility
export const approveFacility = createAsyncThunk(
  'admin/approveFacility',
  async ({ facilityId, status, adminComments }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/facilities/${facilityId}/approve`, {
        status,
        adminComments
      })
      toast.success(`Facility ${status} successfully!`)
      return response.data.data.facility
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to approve facility'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Fetch pending courts
export const fetchPendingCourts = createAsyncThunk(
  'admin/fetchPendingCourts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/courts/pending', { params })
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch pending courts'
      return rejectWithValue(message)
    }
  }
)

// Approve/Reject court
export const approveCourt = createAsyncThunk(
  'admin/approveCourt',
  async ({ courtId, status, adminComments }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/courts/${courtId}/approve`, {
        status,
        adminComments
      })
      toast.success(`Court ${status === 'active' ? 'approved' : 'rejected'} successfully!`)
      return response.data.data.court
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to approve court'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Fetch all users
export const fetchAllUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/users', { params })
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch users'
      return rejectWithValue(message)
    }
  }
)

// Update user status
export const updateUserStatus = createAsyncThunk(
  'admin/updateUserStatus',
  async ({ userId, isActive }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/users/${userId}/status`, { isActive })
      toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully!`)
      return response.data.data.user
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update user status'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Dashboard stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false
        state.stats = action.payload
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Pending facilities
      .addCase(fetchPendingFacilities.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPendingFacilities.fulfilled, (state, action) => {
        state.isLoading = false
        state.pendingFacilities = action.payload.facilities
      })
      .addCase(fetchPendingFacilities.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Approve facility
      .addCase(approveFacility.fulfilled, (state, action) => {
        // Remove the approved/rejected facility from pending list
        state.pendingFacilities = state.pendingFacilities.filter(
          facility => facility._id !== action.payload._id
        )
        // Update stats
        if (state.stats) {
          state.stats.pendingFacilities = Math.max(0, state.stats.pendingFacilities - 1)
        }
      })
      
      // Pending courts
      .addCase(fetchPendingCourts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPendingCourts.fulfilled, (state, action) => {
        state.isLoading = false
        state.pendingCourts = action.payload.courts
      })
      .addCase(fetchPendingCourts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Approve court
      .addCase(approveCourt.fulfilled, (state, action) => {
        // Remove the approved/rejected court from pending list
        state.pendingCourts = state.pendingCourts.filter(
          court => court._id !== action.payload._id
        )
        // Update stats
        if (state.stats) {
          state.stats.pendingCourts = Math.max(0, state.stats.pendingCourts - 1)
        }
      })
      
      // All users
      .addCase(fetchAllUsers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.isLoading = false
        state.users = action.payload.users
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Update user status
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user._id === action.payload.id)
        if (index !== -1) {
          state.users[index].isActive = action.payload.isActive
        }
      })
  }
})

export const { clearError } = adminSlice.actions
export default adminSlice.reducer


