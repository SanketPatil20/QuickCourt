import { Link } from 'react-router-dom'
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  HeartIcon
} from '@heroicons/react/24/outline'
import { 
  FacebookIcon, 
  TwitterIcon, 
  InstagramIcon, 
  LinkedInIcon 
} from '../icons/SocialIcons'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="text-2xl font-bold text-primary-400">
              QuickCourt
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your premier platform for booking sports facilities. Find and reserve courts for tennis, badminton, basketball, and more with ease.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-gray-400 hover:text-primary-400 transition-colors"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-primary-400 transition-colors"
                aria-label="Twitter"
              >
                <TwitterIcon className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-primary-400 transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-primary-400 transition-colors"
                aria-label="LinkedIn"
              >
                <LinkedInIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="text-gray-300 hover:text-primary-400 transition-colors text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/facilities" 
                  className="text-gray-300 hover:text-primary-400 transition-colors text-sm"
                >
                  Find Facilities
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-gray-300 hover:text-primary-400 transition-colors text-sm"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-gray-300 hover:text-primary-400 transition-colors text-sm"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* For Facility Owners */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">For Owners</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/register" 
                  className="text-gray-300 hover:text-primary-400 transition-colors text-sm"
                >
                  List Your Facility
                </Link>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-primary-400 transition-colors text-sm"
                >
                  Owner Guidelines
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-primary-400 transition-colors text-sm"
                >
                  Pricing & Commission
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-primary-400 transition-colors text-sm"
                >
                  Success Stories
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPinIcon className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                <p className="text-gray-300 text-sm">
                  123 Sports Avenue<br />
                  Mumbai, Maharashtra 400001<br />
                  India
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <PhoneIcon className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <p className="text-gray-300 text-sm">+91 98765 43210</p>
              </div>
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <p className="text-gray-300 text-sm">support@quickcourt.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-gray-300 text-sm">
                © {currentYear} QuickCourt. All rights reserved.
              </p>
              <div className="flex items-center space-x-1 text-gray-300 text-sm">
                <span>Made with</span>
                <HeartIcon className="w-4 h-4 text-red-500" />
                <span>in India</span>
              </div>
            </div>
            
            <div className="flex space-x-6">
              <a 
                href="#" 
                className="text-gray-300 hover:text-primary-400 transition-colors text-sm"
              >
                Privacy Policy
              </a>
              <a 
                href="#" 
                className="text-gray-300 hover:text-primary-400 transition-colors text-sm"
              >
                Terms of Service
              </a>
              <a 
                href="#" 
                className="text-gray-300 hover:text-primary-400 transition-colors text-sm"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer



