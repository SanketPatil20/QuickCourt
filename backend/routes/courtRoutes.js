import express from 'express';
import { body } from 'express-validator';
import {
  getCourts,
  getCourt,
  createCourt,
  updateCourt,
  deleteCourt,
  getFacilityCourts
} from '../controllers/courtController.js';
import { protect, facilityOwner } from '../middleware/authMiddleware.js';
import { uploadMultiple, handleUploadError } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Validation rules
const courtValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Court name must be between 2 and 50 characters'),
  body('facility')
    .isMongoId()
    .withMessage('Valid facility ID is required'),
  body('sport')
    .notEmpty()
    .withMessage('Sport is required'),
  body('courtType')
    .isIn(['Indoor', 'Outdoor', 'Semi-Covered'])
    .withMessage('Valid court type is required'),
  body('dimensions.length')
    .isFloat({ min: 0 })
    .withMessage('Valid length is required'),
  body('dimensions.width')
    .isFloat({ min: 0 })
    .withMessage('Valid width is required'),
  body('capacity.players')
    .isInt({ min: 1 })
    .withMessage('Player capacity must be at least 1'),
  body('pricing.hourlyRate')
    .isFloat({ min: 0 })
    .withMessage('Hourly rate must be a positive number'),
  body('pricing.peakHourRate')
    .isFloat({ min: 0 })
    .withMessage('Peak hour rate must be a positive number')
];

// Public routes
router.get('/', getCourts);
router.get('/facility/:facilityId', getFacilityCourts);
router.get('/:id', getCourt);

// Protected routes for facility owners
router.use(protect);
router.use(facilityOwner);

router.post('/', uploadMultiple, handleUploadError, courtValidation, createCourt);
router.put('/:id', uploadMultiple, handleUploadError, updateCourt);
router.delete('/:id', deleteCourt);

export default router;



