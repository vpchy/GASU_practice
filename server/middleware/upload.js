import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = path.resolve(__dirname, '../uploads');

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

export function decodeFilename(originalName) {
  if (!originalName) return originalName;

  try {
    return Buffer.from(originalName, 'latin1').toString('utf8');
  } catch {
    return originalName;
  }
}

const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const originalName = decodeFilename(file.originalname);
    const safeName = path.basename(originalName).replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  }
});

export const upload = multer({
  storage: uploadStorage,
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Только файлы PNG, JPG, PDF, DOC, DOCX или TXT.'));
    }
  }
});
