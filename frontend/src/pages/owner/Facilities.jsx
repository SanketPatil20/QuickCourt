import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchMyFacilities, deleteFacility } from '../../redux/slices/facilitySlice'
import {
  Plus,
  Search,
  Filter,
  Trash2,
  MapPin,
  Star,
  Users,
  Clock,
  MoreVertical,
  Settings
} from 'lucide-react'

const Facilities = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { myFacilities: facilities, isLoading } = useSelector((state) => state.facilities);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive, pending
  const [showFilters, setShowFilters] = useState(false);

  // Fetch facilities on component mount
  useEffect(() => {
    dispatch(fetchMyFacilities());
  }, [dispatch]);

  // Mock data structure for compatibility - you can remove this once API is connected
  const mockFacilitiesForFallback = [
    {
      id: 1,
      name: 'Elite Sports Complex',
      address: '123 Main St, Mumbai',
      description: 'Premium sports facility with modern amenities',
      sportsTypes: ['Badminton', 'Tennis', 'Basketball'],
      totalCourts: 8,
      activeCourts: 6,
      rating: { average: 4.5, count: 124 },
      status: 'active',
      images: ['https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=300&fit=crop'],
      amenities: ['Parking', 'Cafeteria', 'Locker Room', 'AC'],
      createdAt: '2024-01-15',
      totalBookings: 450,
      monthlyEarnings: 85000
    },
    {
      id: 2,
      name: 'City Sports Arena',
      address: '456 Park Ave, Delhi',
      description: 'Community sports center with affordable rates',
      sportsTypes: ['Football', 'Cricket', 'Volleyball'],
      totalCourts: 5,
      activeCourts: 5,
      rating: { average: 4.2, count: 89 },
      status: 'active',
      images: ['https://images.unsplash.com/photo-1579952363873-27d3bade7f55?w=400&h=300&fit=crop'],
      amenities: ['Parking', 'Washroom', 'Water Cooler'],
      createdAt: '2024-02-01',
      totalBookings: 320,
      monthlyEarnings: 65000
    },
    {
      id: 3,
      name: 'Metro Badminton Club',
      address: '789 Sports Rd, Bangalore',
      description: 'Specialized badminton facility',
      sportsTypes: ['Badminton'],
      totalCourts: 12,
      activeCourts: 10,
      rating: { average: 4.7, count: 203 },
      status: 'pending',
      images: ['https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=300&fit=crop'],
      amenities: ['AC', 'Parking', 'Pro Shop', 'Coaching'],
      createdAt: '2024-01-20',
      totalBookings: 0,
      monthlyEarnings: 0
    }
  ];

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [facilityToDelete, setFacilityToDelete] = useState(null);

  // Function to get placeholder images based on sport type
  const getPlaceholderImage = (sportType) => {
    const sportImages = {
      'Badminton': 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=300&fit=crop',
      'Tennis': 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=300&fit=crop',
      'Basketball': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop',
      'Football': 'https://images.unsplash.com/photo-1579952363873-27d3bade7f55?w=400&h=300&fit=crop',
      'Cricket': 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&h=300&fit=crop',
      'Volleyball': 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400&h=300&fit=crop',
      'Table Tennis': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
      'default': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'
    };
    return sportImages[sportType] || sportImages.default;
  };

  // Use actual facilities or fallback to mock data for demo
  const facilitiesToDisplay = facilities.length > 0 ? facilities : mockFacilitiesForFallback;

  const filteredFacilities = facilitiesToDisplay.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         facility.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         facility.sportsTypes.some(sport => 
                           sport.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    const matchesFilter = filterStatus === 'all' || facility.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const handleDeleteFacility = (facility) => {
    setFacilityToDelete(facility);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (facilityToDelete) {
      await dispatch(deleteFacility(facilityToDelete.id || facilityToDelete._id));
      setShowDeleteModal(false);
      setFacilityToDelete(null);
    }
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      approved: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const FacilityCard = ({ facility }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img 
          src={facility.images?.[0]?.url || facility.images?.[0] || facility.image || getPlaceholderImage(facility.sportsTypes?.[0])} 
          alt={facility.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.src = getPlaceholderImage(facility.sportsTypes?.[0]);
          }}
        />
        <div className="absolute top-4 right-4">
          <StatusBadge status={facility.status || 'active'} />
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{facility.name}</h3>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => handleDeleteFacility(facility)}
              className="p-1 hover:bg-red-100 rounded text-red-600 hover:text-red-700 transition-colors"
              title="Delete facility"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded">
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          {typeof facility.address === 'string' 
            ? facility.address 
            : `${facility.address?.street || ''}, ${facility.address?.city || ''}`
          }
        </div>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {facility.description}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {(facility.sportsTypes || []).map((sport, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {typeof sport === 'string' ? sport : sport.name}
            </span>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1 text-gray-500" />
            <span>{facility.activeCourts || 0}/{facility.totalCourts || 0} Courts</span>
          </div>
          <div className="flex items-center">
            <Star className="w-4 h-4 mr-1 text-yellow-500" />
            <span>
              {typeof facility.rating === 'object' 
                ? facility.rating.average || 'N/A'
                : facility.rating || 'N/A'
              } 
              ({typeof facility.rating === 'object' 
                ? facility.rating.count || 0
                : facility.totalReviews || 0
              })
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <span className="text-gray-500">Total Bookings:</span>
            <div className="font-semibold">{facility.totalBookings || 0}</div>
          </div>
          <div>
            <span className="text-gray-500">Monthly Earnings:</span>
            <div className="font-semibold">₹{(facility.monthlyEarnings || 0).toLocaleString()}</div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Link
            to={`/owner/facilities/${facility.id || facility._id}/courts`}
            className="w-full btn btn-secondary btn-sm flex items-center justify-center"
          >
            <Settings className="w-4 h-4 mr-1" />
            Courts
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Facilities</h1>
            <p className="text-gray-600 mt-1">Manage your sports facilities and courts</p>
          </div>
          <Link
            to="/owner/facilities/new"
            className="btn btn-primary btn-md flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Facility
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search facilities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-outline btn-md flex items-center"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
            </div>
          </div>
          
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sports Type
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option>All Sports</option>
                    <option>Badminton</option>
                    <option>Tennis</option>
                    <option>Basketball</option>
                    <option>Football</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option>All Ratings</option>
                    <option>4.5+ Stars</option>
                    <option>4.0+ Stars</option>
                    <option>3.5+ Stars</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Courts
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option>Any Number</option>
                    <option>1-5 Courts</option>
                    <option>6-10 Courts</option>
                    <option>10+ Courts</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Facilities</p>
                <p className="text-2xl font-bold text-gray-900">{facilitiesToDisplay.length}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Facilities</p>
                <p className="text-2xl font-bold text-gray-900">
                  {facilitiesToDisplay.filter(f => (f.status || 'active') === 'active').length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Courts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {facilitiesToDisplay.reduce((sum, f) => sum + (f.totalCourts || 0), 0)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100">
                <Settings className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {facilitiesToDisplay.length > 0 
                    ? (facilitiesToDisplay.reduce((sum, f) => sum + (f.rating || 0), 0) / facilitiesToDisplay.length).toFixed(1)
                    : 'N/A'
                  }
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Facilities Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredFacilities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFacilities.map((facility) => (
              <FacilityCard key={facility.id || facility._id} facility={facility} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No facilities found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first facility'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <Link
                to="/owner/facilities/new"
                className="btn btn-primary btn-md flex items-center mx-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Facility
              </Link>
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Delete Facility
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{facilityToDelete?.name}"? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 btn btn-outline btn-md"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 btn btn-danger btn-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Facilities