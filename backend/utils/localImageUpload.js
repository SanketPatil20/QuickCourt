// Simple local image upload utility
// Converts uploaded files to base64 data URLs for storage

export const convertToBase64 = (buffer, mimetype) => {
  return `data:${mimetype};base64,${buffer.toString('base64')}`;
};

export const processLocalImages = (files) => {
  if (!files || files.length === 0) {
    return [];
  }

  return files.map(file => ({
    url: convertToBase64(file.buffer, file.mimetype),
    public_id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    filename: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  }));
};

export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
  }

  if (file.size > maxSize) {
    throw new Error('File size too large. Maximum size is 5MB');
  }

  return true;
};



