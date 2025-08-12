import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDashboardStats } from '../../redux/slices/adminSlice'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { 
  UsersIcon, 
  BuildingOfficeIcon, 
  MapPinIcon, 
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

const AdminDashboard = () => {
  const dispatch = useDispatch()
  const { stats, isLoading } = useSelector((state) => state.admin)

  useEffect(() => {
    dispatch(fetchDashboardStats())
  }, [dispatch])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: UsersIcon,
      color: 'bg-blue-500',
      href: '/admin/users'
    },
    {
      title: 'Facility Owners',
      value: stats?.totalFacilityOwners || 0,
      icon: BuildingOfficeIcon,
      color: 'bg-green-500',
      href: '/admin/users?role=facilityOwner'
    },
    {
      title: 'Total Facilities',
      value: stats?.totalFacilities || 0,
      icon: MapPinIcon,
      color: 'bg-purple-500',
      href: '/admin/facilities'
    },
    {
      title: 'Pending Facilities',
      value: stats?.pendingFacilities || 0,
      icon: ExclamationTriangleIcon,
      color: 'bg-yellow-500',
      href: '/admin/facilities/pending'
    },
    {
      title: 'Total Courts',
      value: stats?.totalCourts || 0,
      icon: MapPinIcon,
      color: 'bg-indigo-500',
      href: '/admin/courts'
    },
    {
      title: 'Pending Courts',
      value: stats?.pendingCourts || 0,
      icon: ExclamationTriangleIcon,
      color: 'bg-orange-500',
      href: '/admin/courts/pending'
    },
    {
      title: 'Total Bookings',
      value: stats?.totalBookings || 0,
      icon: CalendarIcon,
      color: 'bg-pink-500',
      href: '/admin/bookings'
    },
    {
      title: "Today's Bookings",
      value: stats?.todayBookings || 0,
      icon: ClockIcon,
      color: 'bg-teal-500',
      href: '/admin/bookings?date=today'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage facilities, courts, and users</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => window.location.href = stat.href}
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Approvals */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Facilities Pending</p>
                      <p className="text-sm text-gray-600">{stats?.pendingFacilities || 0} facilities need approval</p>
                    </div>
                  </div>
                  <a
                    href="/admin/facilities/pending"
                    className="btn btn-primary btn-sm"
                  >
                    Review
                  </a>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-orange-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Courts Pending</p>
                      <p className="text-sm text-gray-600">{stats?.pendingCourts || 0} courts need approval</p>
                    </div>
                  </div>
                  <a
                    href="/admin/courts/pending"
                    className="btn btn-primary btn-sm"
                  >
                    Review
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <a
                  href="/admin/users"
                  className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <UsersIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">Manage Users</span>
                </a>
                
                <a
                  href="/admin/facilities"
                  className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">View All Facilities</span>
                </a>
                
                <a
                  href="/admin/courts"
                  className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">View All Courts</span>
                </a>
                
                <a
                  href="/admin/bookings"
                  className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">View All Bookings</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default AdminDashboard


