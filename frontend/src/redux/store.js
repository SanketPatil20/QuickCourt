import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import facilityReducer from './slices/facilitySlice'
import bookingReducer from './slices/bookingSlice'
import userReducer from './slices/userSlice'
import adminReducer from './slices/adminSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    facilities: facilityReducer,
    bookings: bookingReducer,
    user: userReducer,
    admin: adminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
})

export default store



