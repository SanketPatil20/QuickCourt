import { uploadImage as cloudinaryUpload, deleteImage as cloudinaryDelete, bufferToDataURL } from '../utils/cloudinaryUpload.js';

// @desc    Upload single image
// @route   POST /api/upload/image
// @access  Private
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const { folder = 'quickcourt/general' } = req.body;

    // Convert buffer to data URL
    const dataURL = bufferToDataURL(req.file.buffer, req.file.mimetype);

    // Upload to cloudinary
    const result = await cloudinaryUpload(dataURL, folder);

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.url,
        public_id: result.public_id
      }
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({
      success: false,
      message: `Image upload failed: ${error.message}`
    });
  }
};

// @desc    Delete image
// @route   DELETE /api/upload/image/:publicId
// @access  Private
export const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }

    // Delete from cloudinary
    const result = await cloudinaryDelete(publicId);

    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to delete image'
      });
    }
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: `Image deletion failed: ${error.message}`
    });
  }
};



