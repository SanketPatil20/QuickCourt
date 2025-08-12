import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Facility from '../models/Facility.js';
import Court from '../models/Court.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const clearDatabase = async () => {
  try {
    await User.deleteMany({});
    await Facility.deleteMany({});
    await Court.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});
    console.log('Database cleared');
  } catch (error) {
    console.error('Error clearing database:', error);
  }
};

const seedUsers = async () => {
  try {
    const users = [
      {
        name: 'Admin User',
        email: 'admin@quickcourt.com',
        password: await bcrypt.hash('admin123', 12),
        phone: '9999999999',
        role: 'admin',
        isEmailVerified: true,
        address: {
          street: '123 Admin Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India'
        }
      },
      {
        name: 'John Smith',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 12),
        phone: '9876543210',
        role: 'facilityOwner',
        isEmailVerified: true,
        address: {
          street: '456 Owner Avenue',
          city: 'Delhi',
          state: 'Delhi',
          zipCode: '110001',
          country: 'India'
        }
      },
      {
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        password: await bcrypt.hash('password123', 12),
        phone: '9876543211',
        role: 'facilityOwner',
        isEmailVerified: true,
        address: {
          street: '789 Business Road',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560001',
          country: 'India'
        }
      },
      {
        name: 'Mike Johnson',
        email: 'mike@example.com',
        password: await bcrypt.hash('password123', 12),
        phone: '9876543212',
        role: 'user',
        isEmailVerified: true,
        address: {
          street: '321 User Lane',
          city: 'Chennai',
          state: 'Tamil Nadu',
          zipCode: '600001',
          country: 'India'
        },
        preferences: {
          favoriteSports: ['Tennis', 'Badminton']
        }
      },
      {
        name: 'Emily Davis',
        email: 'emily@example.com',
        password: await bcrypt.hash('password123', 12),
        phone: '9876543213',
        role: 'user',
        isEmailVerified: true,
        address: {
          street: '654 Player Street',
          city: 'Hyderabad',
          state: 'Telangana',
          zipCode: '500001',
          country: 'India'
        },
        preferences: {
          favoriteSports: ['Basketball', 'Football']
        }
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log('Users seeded successfully');
    return createdUsers;
  } catch (error) {
    console.error('Error seeding users:', error);
    return [];
  }
};

const seedFacilities = async (users) => {
  try {
    const facilityOwners = users.filter(user => user.role === 'facilityOwner');
    
    const facilities = [
      {
        name: 'Elite Sports Complex',
        description: 'Premium sports facility with state-of-the-art equipment and professional courts for various sports.',
        owner: facilityOwners[0]._id,
        address: {
          street: '123 Sports Avenue',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India',
          coordinates: {
            latitude: 19.0760,
            longitude: 72.8777
          }
        },
        contactInfo: {
          phone: '9876543210',
          email: 'info@elitesports.com',
          website: 'https://elitesports.com'
        },
        images: [
          {
            url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
            public_id: 'sample_facility_1'
          }
        ],
        amenities: ['Parking', 'Restrooms', 'Changing Rooms', 'Cafeteria', 'WiFi', 'Air Conditioning'],
        sportsOffered: ['Tennis', 'Badminton', 'Basketball', 'Squash'],
        pricing: {
          basePrice: 500,
          peakHourMultiplier: 1.5,
          peakHours: {
            start: '18:00',
            end: '21:00'
          }
        },
        status: 'approved',
        rating: {
          average: 4.5,
          count: 25
        }
      },
      {
        name: 'Champions Arena',
        description: 'Modern indoor and outdoor sports facility perfect for tournaments and casual games.',
        owner: facilityOwners[1]._id,
        address: {
          street: '456 Victory Road',
          city: 'Delhi',
          state: 'Delhi',
          zipCode: '110001',
          country: 'India',
          coordinates: {
            latitude: 28.6139,
            longitude: 77.2090
          }
        },
        contactInfo: {
          phone: '9876543211',
          email: 'contact@championsarena.com',
          website: 'https://championsarena.com'
        },
        images: [
          {
            url: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643',
            public_id: 'sample_facility_2'
          }
        ],
        amenities: ['Parking', 'Restrooms', 'Lockers', 'Pro Shop', 'Lighting', 'Security'],
        sportsOffered: ['Football', 'Cricket', 'Volleyball', 'Tennis'],
        pricing: {
          basePrice: 400,
          peakHourMultiplier: 1.3,
          peakHours: {
            start: '17:00',
            end: '20:00'
          }
        },
        status: 'approved',
        rating: {
          average: 4.2,
          count: 18
        }
      },
      {
        name: 'Fitness First Sports Club',
        description: 'Comprehensive sports and fitness facility with modern equipment and expert trainers.',
        owner: facilityOwners[0]._id,
        address: {
          street: '789 Fitness Lane',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560001',
          country: 'India',
          coordinates: {
            latitude: 12.9716,
            longitude: 77.5946
          }
        },
        contactInfo: {
          phone: '9876543212',
          email: 'info@fitnessfirst.com'
        },
        images: [
          {
            url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
            public_id: 'sample_facility_3'
          }
        ],
        amenities: ['Parking', 'Shower', 'Equipment Rental', 'First Aid', 'Water Fountain'],
        sportsOffered: ['Gym', 'Boxing', 'Yoga', 'Table Tennis'],
        pricing: {
          basePrice: 300,
          peakHourMultiplier: 1.4
        },
        status: 'pending'
      }
    ];

    const createdFacilities = await Facility.insertMany(facilities);
    console.log('Facilities seeded successfully');
    return createdFacilities;
  } catch (error) {
    console.error('Error seeding facilities:', error);
    return [];
  }
};

const seedCourts = async (facilities) => {
  try {
    const courts = [
      // Elite Sports Complex courts
      {
        name: 'Tennis Court 1',
        facility: facilities[0]._id,
        sport: 'Tennis',
        courtType: 'Outdoor',
        surface: 'Hard Court',
        dimensions: { length: 23.77, width: 10.97, unit: 'meters' },
        capacity: { players: 4, spectators: 20 },
        pricing: { hourlyRate: 800, peakHourRate: 1200, currency: 'INR' },
        amenities: ['Lighting', 'Seating', 'Equipment Storage'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6',
            public_id: 'sample_court_1'
          }
        ],
        status: 'active'
      },
      {
        name: 'Badminton Court A',
        facility: facilities[0]._id,
        sport: 'Badminton',
        courtType: 'Indoor',
        surface: 'Wooden',
        dimensions: { length: 13.4, width: 6.1, unit: 'meters' },
        capacity: { players: 4, spectators: 15 },
        pricing: { hourlyRate: 600, peakHourRate: 900, currency: 'INR' },
        amenities: ['Air Conditioning', 'Sound System', 'Equipment Rental'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5',
            public_id: 'sample_court_2'
          }
        ],
        status: 'active'
      },
      // Champions Arena courts
      {
        name: 'Football Field',
        facility: facilities[1]._id,
        sport: 'Football',
        courtType: 'Outdoor',
        surface: 'Artificial Turf',
        dimensions: { length: 100, width: 64, unit: 'meters' },
        capacity: { players: 22, spectators: 100 },
        pricing: { hourlyRate: 2000, peakHourRate: 3000, currency: 'INR' },
        amenities: ['Lighting', 'Scoreboard', 'Changing Room Access'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018',
            public_id: 'sample_court_3'
          }
        ],
        status: 'active'
      },
      {
        name: 'Basketball Court 1',
        facility: facilities[1]._id,
        sport: 'Basketball',
        courtType: 'Indoor',
        surface: 'Wooden',
        dimensions: { length: 28, width: 15, unit: 'meters' },
        capacity: { players: 10, spectators: 50 },
        pricing: { hourlyRate: 1000, peakHourRate: 1500, currency: 'INR' },
        amenities: ['Air Conditioning', 'Scoreboard', 'Sound System'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc',
            public_id: 'sample_court_4'
          }
        ],
        status: 'active'
      }
    ];

    const createdCourts = await Court.insertMany(courts);
    console.log('Courts seeded successfully');
    return createdCourts;
  } catch (error) {
    console.error('Error seeding courts:', error);
    return [];
  }
};

const seedBookings = async (users, facilities, courts) => {
  try {
    const regularUsers = users.filter(user => user.role === 'user');
    
    const bookings = [
      {
        user: regularUsers[0]._id,
        facility: facilities[0]._id,
        court: courts[0]._id,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        timeSlot: {
          startTime: '10:00',
          endTime: '11:00',
          duration: 1
        },
        pricing: {
          basePrice: 800,
          peakHourMultiplier: 1,
          totalAmount: 800,
          currency: 'INR'
        },
        payment: {
          method: 'stripe',
          status: 'completed',
          paidAmount: 800
        },
        participants: {
          count: 2,
          details: [
            { name: 'Mike Johnson', email: 'mike@example.com' },
            { name: 'Friend Player', email: 'friend@example.com' }
          ]
        },
        status: 'confirmed'
      },
      {
        user: regularUsers[1]._id,
        facility: facilities[1]._id,
        court: courts[2]._id,
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        timeSlot: {
          startTime: '18:00',
          endTime: '19:00',
          duration: 1
        },
        pricing: {
          basePrice: 2000,
          peakHourMultiplier: 1.5,
          totalAmount: 3000,
          currency: 'INR'
        },
        payment: {
          method: 'stripe',
          status: 'completed',
          paidAmount: 3000
        },
        participants: {
          count: 10,
          details: [
            { name: 'Emily Davis', email: 'emily@example.com' }
          ]
        },
        status: 'confirmed'
      },
      {
        user: regularUsers[0]._id,
        facility: facilities[0]._id,
        court: courts[1]._id,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last week
        timeSlot: {
          startTime: '15:00',
          endTime: '16:00',
          duration: 1
        },
        pricing: {
          basePrice: 600,
          peakHourMultiplier: 1,
          totalAmount: 600,
          currency: 'INR'
        },
        payment: {
          method: 'stripe',
          status: 'completed',
          paidAmount: 600
        },
        participants: {
          count: 2,
          details: [
            { name: 'Mike Johnson', email: 'mike@example.com' }
          ]
        },
        status: 'completed'
      }
    ];

    const createdBookings = await Booking.insertMany(bookings);
    console.log('Bookings seeded successfully');
    return createdBookings;
  } catch (error) {
    console.error('Error seeding bookings:', error);
    return [];
  }
};

const seedReviews = async (users, facilities, courts, bookings) => {
  try {
    const regularUsers = users.filter(user => user.role === 'user');
    const completedBookings = bookings.filter(booking => booking.status === 'completed');
    
    const reviews = [
      {
        user: regularUsers[0]._id,
        facility: facilities[0]._id,
        court: courts[1]._id,
        booking: completedBookings[0]._id,
        rating: {
          overall: 5,
          cleanliness: 5,
          facilities: 4,
          staff: 5,
          valueForMoney: 4
        },
        title: 'Excellent badminton court!',
        comment: 'Had a great experience playing here. The court was well-maintained and the staff was very helpful. Will definitely come back!',
        pros: ['Clean facilities', 'Friendly staff', 'Good equipment'],
        cons: ['Parking could be better'],
        isVerified: true,
        status: 'active'
      }
    ];

    await Review.insertMany(reviews);
    console.log('Reviews seeded successfully');
  } catch (error) {
    console.error('Error seeding reviews:', error);
  }
};

const updateFacilityStats = async (facilities) => {
  try {
    // Update facility ratings and booking counts
    for (const facility of facilities) {
      await facility.calculateAverageRating();
      
      const bookingCount = await Booking.countDocuments({ 
        facility: facility._id,
        'payment.status': 'completed'
      });
      
      facility.totalBookings = bookingCount;
      await facility.save();
    }
    console.log('Facility stats updated');
  } catch (error) {
    console.error('Error updating facility stats:', error);
  }
};

const seedData = async () => {
  try {
    await connectDB();
    await clearDatabase();
    
    console.log('🌱 Starting database seeding...');
    
    const users = await seedUsers();
    const facilities = await seedFacilities(users);
    const courts = await seedCourts(facilities);
    const bookings = await seedBookings(users, facilities, courts);
    await seedReviews(users, facilities, courts, bookings);
    await updateFacilityStats(facilities);
    
    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Seeded Data Summary:');
    console.log(`👥 Users: ${users.length}`);
    console.log(`🏢 Facilities: ${facilities.length}`);
    console.log(`🏟️ Courts: ${courts.length}`);
    console.log(`📅 Bookings: ${bookings.length}`);
    
    console.log('\n🔐 Test Credentials:');
    console.log('Admin: admin@quickcourt.com / admin123');
    console.log('Facility Owner: john@example.com / password123');
    console.log('User: mike@example.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding
seedData();



