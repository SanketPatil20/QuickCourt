# Team 328
# QuickCourt - Sports Facility Booking Platform
Video Link: https://drive.google.com/file/d/1y6kNY8orZVR5gUaJcInFJJ-BKG9KlSAM/view?usp=sharing

A full-stack web application for booking sports facilities and courts. Built with Node.js, Express, MongoDB, React, and Redux.

## 🚀 Features

- **User Authentication**: Register, login, and profile management
- **Facility Management**: Create and manage sports facilities
- **Court Booking**: Book courts with real-time availability
- **Admin Dashboard**: Manage users, facilities, and bookings
- **Owner Dashboard**: Manage owned facilities and courts
- **Payment Integration**: Razorpay payment gateway
- **Email Notifications**: Booking confirmations and updates
- **Image Upload**: Cloudinary integration for facility images

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploads
- **Cloudinary** - Image storage
- **Razorpay** - Payment gateway

### Frontend
- **React** - UI library
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB
- npm or yarn

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SanketPatil20/QuickCourt.git
   cd QuickCourt
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**
   
   Create a `.env` file in the backend directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/quickcourt
   JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
   JWT_EXPIRE=30d
   
   # Cloudinary Configuration (optional)
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   
   # Razorpay Configuration (optional)
   RAZORPAY_KEY_ID=rzp_test_your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   
   # Email Configuration (optional)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   
   # Frontend URL
   FRONTEND_URL=http://localhost:5173
   ```

## 🏃‍♂️ Running the Application

### Development Mode

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   Backend will run on: http://localhost:5000

2. **Start the frontend server**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on: http://localhost:5173

### Production Mode

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start the backend**
   ```bash
   cd backend
   npm start
   ```

## 📁 Project Structure

```
QuickCourt/
├── backend/
│   ├── config/          # Database and cloudinary config
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── scripts/         # Database seeding
│   ├── utils/           # Utility functions
│   └── server.js        # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── redux/       # Redux store and slices
│   │   └── utils/       # Utility functions
│   └── package.json
└── README.md
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - Verify OTP
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Facilities
- `GET /api/facilities` - Get all facilities
- `POST /api/facilities` - Create facility (owner only)
- `GET /api/facilities/:id` - Get facility details
- `PUT /api/facilities/:id` - Update facility

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id` - Update booking

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/facilities/pending` - Get pending facilities
- `PUT /api/admin/facilities/:id/approve` - Approve facility

## 👥 User Roles

- **User**: Can book courts and manage profile
- **Owner**: Can create and manage facilities
- **Admin**: Can manage all users and facilities

## 🔧 Configuration

### MongoDB
Make sure MongoDB is running locally or update the `MONGODB_URI` in your `.env` file.

### Cloudinary 
For image uploads, create a Cloudinary account and add your credentials to the `.env` file.

### Razorpay 
For payment processing, create a Razorpay account and add your test credentials to the `.env` file.

### Email 
For email notifications, configure your email service credentials in the `.env` file.

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Contributors

**Sanket Patil**
- GitHub: [@SanketPatil20](https://github.com/SanketPatil20)
  
**Gourav Chouhan**
- GitHub: [@GouravChouhan21](https://github.com/GouravChouhan21)


