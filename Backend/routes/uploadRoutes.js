const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimiter');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'service-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Upload service status/health check
router.get('/', (req, res) => {
  try {
    // Count files in upload directory
    const files = fs.existsSync(uploadDir) ? fs.readdirSync(uploadDir) : [];
    const imageFiles = files.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));

    // Calculate total size
    let totalSize = 0;
    imageFiles.forEach(file => {
      const filePath = path.join(uploadDir, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
    });

    res.json({
      success: true,
      message: 'Upload Service Operational',
      status: 'healthy',
      data: {
        uploadDirectory: uploadDir,
        totalFiles: imageFiles.length,
        totalSize: `${(totalSize / (1024 * 1024)).toFixed(2)} MB`,
        maxFileSize: '5 MB',
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        endpoints: {
          uploadSingle: 'POST /api/upload/image',
          uploadMultiple: 'POST /api/upload/images',
          deleteImage: 'DELETE /api/upload/image/:filename'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      message: 'Upload service error',
      error: error.message
    });
  }
});

// Upload single image (authentication + rate limiting required)
router.post('/image', authMiddleware, uploadLimiter, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('[Upload Error]', err);
      if (err instanceof multer.MulterError) {
        // Multer-specific errors
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 5MB'
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`
        });
      }
      // Other errors (like file type validation)
      return res.status(400).json({
        success: false,
        message: err.message || 'Error uploading image'
      });
    }

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Return relative path - frontend will construct full URL based on environment
      const imageUrl = `/uploads/${req.file.filename}`;

      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          url: imageUrl,
          filename: req.file.filename
        }
      });
    } catch (error) {
      console.error('[Upload Error]', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading image',
        error: error.message
      });
    }
  });
});

// Upload multiple images (max 4) - authentication + rate limiting required
router.post('/images', authMiddleware, uploadLimiter, upload.array('images', 4), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    // Return relative paths - frontend will construct full URLs based on environment
    const uploadedImages = req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename
    }));

    res.status(200).json({
      success: true,
      message: `${req.files.length} image(s) uploaded successfully`,
      data: uploadedImages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading images',
      error: error.message
    });
  }
});

// Delete image (authentication required)
router.delete('/image/:filename', authMiddleware, (req, res) => {
  try {
    const filePath = path.join(uploadDir, req.params.filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.status(200).json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting image',
      error: error.message
    });
  }
});

module.exports = router;
