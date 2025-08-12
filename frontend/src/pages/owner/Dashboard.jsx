import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import {
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  MapPin,
  Clock,
  Activity,
  Plus,
  Eye
} from 'lucide-react'
import ReactCalendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

const OwnerDashboard = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [timeRange, setTimeRange] = useState('7d') // 7d, 30d, 90d

  // Mock data - in real app, this would come from API
  const [dashboardData, setDashboardData] = useState({
    kpis: {
      totalBookings: 156,
      activeBookings: 12,
      totalEarnings: 45680,
      activeCourts: 8,
      totalCourts: 10,
      occupancyRate: 78
    },
    bookingTrends: [
      { date: '2024-01-01', bookings: 12, earnings: 2400 },
      { date: '2024-01-02', bookings: 19, earnings: 3800 },
      { date: '2024-01-03', bookings: 15, earnings: 3000 },
      { date: '2024-01-04', bookings: 22, earnings: 4400 },
      { date: '2024-01-05', bookings: 18, earnings: 3600 },
      { date: '2024-01-06', bookings: 25, earnings: 5000 },
      { date: '2024-01-07', bookings: 20, earnings: 4000 }
    ],
    peakHours: [
      { hour: '6 AM', bookings: 5 },
      { hour: '7 AM', bookings: 12 },
      { hour: '8 AM', bookings: 18 },
      { hour: '9 AM', bookings: 25 },
      { hour: '10 AM', bookings: 22 },
      { hour: '11 AM', bookings: 15 },
      { hour: '12 PM', bookings: 20 },
      { hour: '1 PM', bookings: 18 },
      { hour: '2 PM', bookings: 12 },
      { hour: '3 PM', bookings: 15 },
      { hour: '4 PM', bookings: 22 },
      { hour: '5 PM', bookings: 28 },
      { hour: '6 PM', bookings: 35 },
      { hour: '7 PM', bookings: 30 },
      { hour: '8 PM', bookings: 25 },
      { hour: '9 PM', bookings: 18 }
    ],
    sportsBreakdown: [
      { name: 'Badminton', value: 45, color: '#3b82f6' },
      { name: 'Tennis', value: 30, color: '#10b981' },
      { name: 'Basketball', value: 15, color: '#f59e0b' },
      { name: 'Volleyball', value: 10, color: '#ef4444' }
    ],
    recentBookings: [
      {
        id: 1,
        user: 'John Doe',
        court: 'Court 1 - Badminton',
        date: '2024-01-08',
        time: '10:00 AM - 11:00 AM',
        status: 'confirmed',
        amount: 500
      },
      {
        id: 2,
        user: 'Jane Smith',
        court: 'Court 2 - Tennis',
        date: '2024-01-08',
        time: '2:00 PM - 3:00 PM',
        status: 'pending',
        amount: 800
      },
      {
        id: 3,
        user: 'Mike Johnson',
        court: 'Court 3 - Basketball',
        date: '2024-01-08',
        time: '6:00 PM - 7:00 PM',
        status: 'confirmed',
        amount: 600
      }
    ]
  })

  const KPICard = ({ title, value, icon: Icon, change, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm flex items-center mt-2 ${
              change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="w-4 h-4 mr-1" />
              {change > 0 ? '+' : ''}{change}% from last week
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-blue-100`}>
          <Icon className={`w-8 h-8 text-blue-600`} />
        </div>
      </div>
    </div>
  )

  const StatusBadge = ({ status }) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
          </div>
          <div className="flex space-x-3">
            <Link
              to="/owner/facilities/new"
              className="btn btn-primary btn-md flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Facility
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Total Bookings"
            value={dashboardData.kpis.totalBookings}
            icon={Calendar}
            change={12}
            color="blue"
          />
          <KPICard
            title="Active Bookings"
            value={dashboardData.kpis.activeBookings}
            icon={Activity}
            change={-5}
            color="green"
          />
          <KPICard
            title="Total Earnings"
            value={`₹${dashboardData.kpis.totalEarnings.toLocaleString()}`}
            icon={DollarSign}
            change={18}
            color="yellow"
          />
          <KPICard
            title="Active Courts"
            value={`${dashboardData.kpis.activeCourts}/${dashboardData.kpis.totalCourts}`}
            icon={MapPin}
            change={0}
            color="purple"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Booking Trends Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Booking Trends</h3>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dashboardData.bookingTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Earnings Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings Summary</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.bookingTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, 'Earnings']} />
                <Line
                  type="monotone"
                  dataKey="earnings"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Second Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Peak Hours Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Booking Hours</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.peakHours}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Sports Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sports Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData.sportsBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {dashboardData.sportsBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Bookings */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
              <Link
                to="/owner/bookings"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
              >
                <Eye className="w-4 h-4 mr-1" />
                View All
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Court
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboardData.recentBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {booking.user}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.court}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <div>{booking.date}</div>
                          <div className="text-xs text-gray-400">{booking.time}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{booking.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Calendar</h3>
            <ReactCalendar
              onChange={setSelectedDate}
              value={selectedDate}
              className="w-full border-none"
            />
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Selected: {selectedDate.toLocaleDateString()}
              </p>
              <p className="text-sm font-medium text-gray-900">
                5 bookings scheduled
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OwnerDashboard
