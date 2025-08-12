import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchFacilities } from '../redux/slices/facilitySlice'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { 
  MagnifyingGlassIcon,
  MapPinIcon,
  StarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'

const Facilities = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    sport: searchParams.get('sport') || '',
    city: searchParams.get('city') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rating: searchParams.get('rating') || ''
  })
  const [showFilters, setShowFilters] = useState(false)

  const dispatch = useDispatch()
  const { facilities, isLoading, pagination } = useSelector((state) => state.facilities)

  // Mock data for development - remove when real facilities are available
  const mockFacilities = [
    {
      _id: 'mock1',
      name: 'Elite Sports Complex',
      description: 'Premium sports facility with modern amenities',
      address: { city: 'Mumbai', state: 'Maharashtra' },
      images: [{ url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=300&fit=crop' }],
      rating: { average: 4.5, count: 124 },
      pricing: { basePrice: 800 },
      sportsOffered: ['Badminton', 'Tennis', 'Basketball']
    },
    {
      _id: 'mock2',
      name: 'City Sports Arena',
      description: 'Community sports center with affordable rates',
      address: { city: 'Delhi', state: 'Delhi' },
      images: [{ url: 'https://images.unsplash.com/photo-1579952363873-27d3bade7f55?w=400&h=300&fit=crop' }],
      rating: { average: 4.2, count: 89 },
      pricing: { basePrice: 600 },
      sportsOffered: ['Football', 'Cricket', 'Volleyball']
    },
    {
      _id: 'mock3',
      name: 'Metro Badminton Club',
      description: 'Specialized badminton facility',
      address: { city: 'Bangalore', state: 'Karnataka' },
      images: [{ url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=300&fit=crop' }],
      rating: { average: 4.7, count: 203 },
      pricing: { basePrice: 500 },
      sportsOffered: ['Badminton']
    }
  ]

  // Use mock data if no real facilities are loaded
  const displayFacilities = facilities.length > 0 ? facilities : mockFacilities

  useEffect(() => {
    const params = Object.fromEntries(searchParams)
    dispatch(fetchFacilities(params))
  }, [dispatch, searchParams])

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    // Update URL params
    const newParams = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) newParams.set(k, v)
    })
    setSearchParams(newParams)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    handleFilterChange('search', filters.search)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sports Facilities</h1>
          <p className="text-gray-600 mt-2">
            Find the perfect court for your game
          </p>
          {facilities.length === 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                💡 <strong>Development Mode:</strong> Showing sample facilities. Create a facility owner account to add real facilities!
              </p>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search facilities..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="input w-full pl-10"
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-outline"
            >
              <FunnelIcon className="w-5 h-5 mr-2" />
              Filters
            </button>
          </form>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-4 border-t">
              <select
                value={filters.sport}
                onChange={(e) => handleFilterChange('sport', e.target.value)}
                className="input"
              >
                <option value="">All Sports</option>
                <option value="Tennis">Tennis</option>
                <option value="Badminton">Badminton</option>
                <option value="Basketball">Basketball</option>
                <option value="Football">Football</option>
                <option value="Cricket">Cricket</option>
              </select>

              <input
                type="text"
                placeholder="City"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="input"
              />

              <input
                type="number"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="input"
              />

              <input
                type="number"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="input"
              />

              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
                className="input"
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
              </select>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayFacilities.map((facility) => (
            <Link
              key={facility._id}
              to={`/facilities/${facility._id}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
            >
              <img
                src={facility.images?.[0]?.url || '/placeholder-facility.jpg'}
                alt={facility.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {facility.name}
                </h3>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <MapPinIcon className="w-4 h-4 mr-1" />
                  {facility.address?.city}, {facility.address?.state}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">
                      {facility.rating?.average || 0} ({facility.rating?.count || 0})
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    From ₹{facility.pricing?.basePrice}/hr
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex flex-wrap gap-1">
                    {facility.sportsOffered?.slice(0, 3).map((sport) => (
                      <span key={sport} className="badge badge-secondary text-xs">
                        {sport}
                      </span>
                    ))}
                    {facility.sportsOffered?.length > 3 && (
                      <span className="badge badge-secondary text-xs">
                        +{facility.sportsOffered.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams)
                    newParams.set('page', page.toString())
                    setSearchParams(newParams)
                  }}
                  className={`px-4 py-2 rounded-md ${
                    page === pagination.currentPage
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}

        {displayFacilities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No facilities found matching your criteria</p>
            <button
              onClick={() => {
                setFilters({
                  search: '',
                  sport: '',
                  city: '',
                  minPrice: '',
                  maxPrice: '',
                  rating: ''
                })
                setSearchParams(new URLSearchParams())
              }}
              className="btn btn-outline mt-4"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Facilities
