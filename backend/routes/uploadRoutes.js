import express from 'express';
import { uploadImage, deleteImage } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadSingle, handleUploadError } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// All upload routes require authentication
router.use(protect);

router.post('/image', uploadSingle, handleUploadError, uploadImage);
router.delete('/image/:publicId', deleteImage);

export default router;



