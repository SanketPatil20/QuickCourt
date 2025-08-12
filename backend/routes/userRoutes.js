import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getUserBookings,
  getUserReviews,
  uploadAvatar,
  deleteAccount
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadSingle, handleUploadError } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.post('/upload-avatar', uploadSingle, handleUploadError, uploadAvatar);
router.get('/bookings', getUserBookings);
router.get('/reviews', getUserReviews);
router.delete('/account', deleteAccount);

export default router;



