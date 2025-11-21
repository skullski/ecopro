
import { RequestHandler } from 'express';
import fs from 'fs/promises';
import path from 'path';
import multer from 'multer';

// Set up multer storage
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const safeName = file.originalname.replace(/[^a-z0-9.-_]/gi, '_');
    cb(null, `${Date.now()}_${safeName}`);
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

// POST /api/products/upload (multipart/form-data)
export const uploadImage: RequestHandler = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    // Build public url
    const urlPath = `/uploads/${req.file.filename}`;
    res.json({ url: urlPath });
  } catch (err) {
    console.error('Upload error', err);
    res.status(500).json({ error: 'Upload failed' });
  }
};
