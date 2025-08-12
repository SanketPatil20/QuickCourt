import express from 'express';
import { body } from 'express-validator';
import {
  createBooking,
  getUserBookings,
  getBooking,
  updateBookingStatus,
  confirmPayment,
  getFacilityBookings,
  getAvailableSlots
} from '../controllers/bookingController.js';
import { protect, facilityOwner } from '../middleware/authMiddleware.js';

const router = express.Router();

// Validation rules
const bookingValidation = [
  body('facility')
    .isMongoId()
    .withMessage('Valid facility ID is required'),
  body('court')
    .isMongoId()
    .withMessage('Valid court ID is required'),
  body('date')
    .isISO8601()
    .withMessage('Valid date is required'),
  body('timeSlot.startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Valid start time in HH:MM format is required'),
  body('timeSlot.endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Valid end time in HH:MM format is required'),
  body('participants.count')
    .isInt({ min: 1 })
    .withMessage('At least one participant is required'),
  body('participants.details')
    .isArray({ min: 1 })
    .withMessage('Participant details are required'),
  body('participants.details.*.name')
    .trim()
    .notEmpty()
    .withMessage('Participant name is required')
];

// Public routes
router.get('/available-slots/:courtId', getAvailableSlots);

// Protected routes
router.use(protect);

// User booking routes
router.post('/', bookingValidation, createBooking);
router.get('/', getUserBookings);
router.get('/:id', getBooking);
router.put('/:id/status', updateBookingStatus);
router.post('/:id/confirm-payment', confirmPayment);

// Facility owner routes
router.get('/facility/:facilityId', facilityOwner, getFacilityBookings);

export default router;



