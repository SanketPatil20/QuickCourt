import cloudinary from '../config/cloudinary.js';

// Upload single image to cloudinary
export const uploadImage = async (file, folder = 'quickcourt') => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: 'image',
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    return {
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

// Upload multiple images to cloudinary
export const uploadMultipleImages = async (files, folder = 'quickcourt') => {
  try {
    const uploadPromises = files.map(file => uploadImage(file, folder));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    throw new Error(`Multiple image upload failed: ${error.message}`);
  }
};

// Delete image from cloudinary
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Image deletion failed: ${error.message}`);
  }
};

// Delete multiple images from cloudinary
export const deleteMultipleImages = async (publicIds) => {
  try {
    const deletePromises = publicIds.map(publicId => deleteImage(publicId));
    const results = await Promise.all(deletePromises);
    return results;
  } catch (error) {
    throw new Error(`Multiple image deletion failed: ${error.message}`);
  }
};

// Convert buffer to base64 data URL for cloudinary upload
export const bufferToDataURL = (buffer, mimetype) => {
  return `data:${mimetype};base64,${buffer.toString('base64')}`;
};



