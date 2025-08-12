import express from 'express';
import { body } from 'express-validator';
import {
  getFacilities,
  getFacility,
  createFacility,
  updateFacility,
  deleteFacility,
  getMyFacilities,
  getPopularFacilities,
  getFacilityStats,
  parseFormData
} from '../controllers/facilityController.js';
import { protect, facilityOwner } from '../middleware/authMiddleware.js';
import { uploadMultiple, handleUploadError } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Validation rules
const facilityValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Facility name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('address.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  body('address.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('address.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('address.zipCode')
    .trim()
    .notEmpty()
    .withMessage('Zip code is required'),
  body('address.coordinates.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Valid latitude is required'),
  body('address.coordinates.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Valid longitude is required'),
  body('contactInfo.phone')
    .matches(/^\d{10}$/)
    .withMessage('Valid 10-digit phone number is required'),
  body('contactInfo.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('sportsOffered')
    .isArray({ min: 1 })
    .withMessage('At least one sport must be offered'),
  body('pricing.basePrice')
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number')
];

// Public routes
router.get('/', getFacilities);
router.get('/popular', getPopularFacilities);
router.get('/:id', getFacility);

// Protected routes for facility owners
router.use(protect);
router.get('/owner/my-facilities', facilityOwner, getMyFacilities);
router.post('/', facilityOwner, uploadMultiple, handleUploadError, parseFormData, facilityValidation, createFacility);

// Test route for validation (remove in production)
router.post('/test-validation', parseFormData, facilityValidation, (req, res) => {
  res.json({
    success: true,
    message: 'Validation passed',
    data: req.body
  });
});

// Test route for cloudinary configuration (remove in production)
router.get('/test-cloudinary', (req, res) => {
  try {
    const cloudinaryConfig = {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY ? '***configured***' : 'NOT_CONFIGURED',
      apiSecret: process.env.CLOUDINARY_API_SECRET ? '***configured***' : 'NOT_CONFIGURED'
    };
    
    res.json({
      success: true,
      message: 'Cloudinary configuration check',
      cloudinary: cloudinaryConfig,
      isConfigured: !!(process.env.CLOUDINARY_CLOUD_NAME && 
                       process.env.CLOUDINARY_API_KEY && 
                       process.env.CLOUDINARY_API_SECRET)
    });
  } catch (error) {
    console.error('Test cloudinary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking cloudinary configuration'
    });
  }
});
router.put('/:id', facilityOwner, uploadMultiple, handleUploadError, updateFacility);
router.delete('/:id', facilityOwner, deleteFacility);
router.get('/:id/stats', facilityOwner, getFacilityStats);

export default router;
