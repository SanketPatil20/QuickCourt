import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { 
  MagnifyingGlassIcon,
  ClockIcon,
  ShieldCheckIcon,
  StarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
const Home = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  const features = [
    {
      icon: MagnifyingGlassIcon,
      title: 'Easy Search',
      description: 'Find sports facilities near you with advanced filters for sport type, price, and amenities.'
    },
    {
      icon: ClockIcon,
      title: 'Instant Booking',
      description: 'Book your preferred time slots instantly with our real-time availability system.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure Payments',
      description: 'Safe and secure payment processing with multiple payment options available.'
    },
    {
      icon: StarIcon,
      title: 'Verified Reviews',
      description: 'Read authentic reviews from verified users to make informed decisions.'
    }
  ]

  const sports = [
    { name: 'Tennis', icon: '🎾', count: '150+ Courts' },
    { name: 'Badminton', icon: '🏸', count: '200+ Courts' },
    { name: 'Basketball', icon: '🏀', count: '80+ Courts' },
    { name: 'Football', icon: '⚽', count: '60+ Fields' },
    { name: 'Cricket', icon: '🏏', count: '40+ Grounds' },
    { name: 'Swimming', icon: '🏊‍♂️', count: '30+ Pools' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Book Sports Facilities
              <span className="block text-primary-200">Instantly</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto animate-slide-up">
              Find and reserve courts for tennis, badminton, basketball, and more. 
              Quick, easy, and hassle-free booking experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up animation-delay-200">
              <Link 
                to="/facilities" 
                className="btn btn-lg bg-white text-primary-700 hover:bg-primary-50 font-semibold px-8"
              >
                Find Facilities
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
              {!isAuthenticated && (
                <Link 
                  to="/register" 
                  className="btn btn-lg btn-outline border-white text-white hover:bg-white hover:text-primary-700 px-8"
                >
                  List Your Facility
                </Link>
              )}
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-10 w-20 h-20 bg-primary-400 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute bottom-1/4 right-10 w-16 h-16 bg-primary-300 rounded-full opacity-20 animate-bounce animation-delay-400"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose QuickCourt?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make it simple to find and book the perfect sports facility for your needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sports Categories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Sports
            </h2>
            <p className="text-xl text-gray-600">
              Discover facilities for your favorite sports
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {sports.map((sport, index) => (
              <Link
                key={sport.name}
                to={`/facilities?sport=${sport.name}`}
                className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {sport.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {sport.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {sport.count}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
              <div className="text-primary-200">Sports Facilities</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">10K+</div>
              <div className="text-primary-200">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">50K+</div>
              <div className="text-primary-200">Bookings Made</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">25+</div>
              <div className="text-primary-200">Cities Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Play?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of sports enthusiasts who trust QuickCourt for their booking needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/facilities" 
              className="btn btn-primary btn-lg px-8"
            >
              Browse Facilities
            </Link>
            {!isAuthenticated && (
              <Link 
                to="/register" 
                className="btn btn-outline btn-lg px-8"
              >
                Sign Up Now
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home



