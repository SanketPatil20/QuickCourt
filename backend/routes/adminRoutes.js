import express from 'express';
import { body } from 'express-validator';
import {
  getDashboardStats,
  getPendingFacilities,
  approveFacility,
  getPendingCourts,
  approveCourt,
  getAllUsers,
  updateUserStatus
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(admin);

// Validation rules
const approvalValidation = [
  body('status')
    .isIn(['approved', 'rejected', 'active'])
    .withMessage('Invalid status'),
  body('adminComments')
    .optional()
    .isString()
    .withMessage('Admin comments must be a string')
];

// Dashboard
router.get('/dashboard', getDashboardStats);

// Facility management
router.get('/facilities/pending', getPendingFacilities);
router.put('/facilities/:id/approve', approvalValidation, approveFacility);

// Court management
router.get('/courts/pending', getPendingCourts);
router.put('/courts/:id/approve', approvalValidation, approveCourt);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/status', [
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean')
], updateUserStatus);

export default router;


