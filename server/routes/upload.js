import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { upload, decodeFilename } from '../middleware/upload.js';

const router = express.Router();

router.post('/upload', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Файл не был загружен'
    });
  }

  const originalName = decodeFilename(req.file.originalname);
  const url = `${req.protocol}://${req.get('host')}/uploads/${encodeURIComponent(req.file.filename)}`;

  res.json({
    success: true,
    message: 'Файл успешно загружен',
    file: {
      originalName,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url
    }
  });
});

export default router;
