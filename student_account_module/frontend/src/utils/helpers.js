/**
 * Format date to a readable string
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

/**
 * Format date and time to a readable string
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename) => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

/**
 * Get file type icon based on extension
 */
export const getFileTypeIcon = (filename) => {
  const ext = getFileExtension(filename).toLowerCase();

  switch (ext) {
    case 'pdf':
      return '📄';
    case 'jpg':
    case 'jpeg':
    case 'png':
      return '🖼️';
    default:
      return '📎';
  }
};

/**
 * Validate file type and size
 */
export const validateFile = (file) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  const maxSizeInBytes = 10 * 1024 * 1024; // 10 MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message: 'Invalid file type. Only PDF, JPG, JPEG, and PNG files are allowed.'
    };
  }

  if (file.size > maxSizeInBytes) {
    return {
      valid: false,
      message: 'File size exceeds the limit of 10 MB.'
    };
  }

  return { valid: true };
};

/**
 * Create a blob URL for file viewing
 */
export const createBlobUrl = (blob) => {
  return URL.createObjectURL(blob);
};

/**
 * Revoke a blob URL
 */
export const revokeBlobUrl = (url) => {
  URL.revokeObjectURL(url);
};