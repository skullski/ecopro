
import { RequestHandler } from 'express';
import { jsonError } from '../utils/httpHelpers';
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
    console.log('[uploadImage] Upload request received');
    console.log('[uploadImage] Request user:', req.user?.id);
    console.log('[uploadImage] Has file:', !!req.file);

    if (!req.file) {
      console.error('[uploadImage] No file in request');
      res.set('Content-Type', 'application/json');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!req.user?.id) {
      console.error('[uploadImage] No user in request');
      res.set('Content-Type', 'application/json');
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const urlPath = `/uploads/${req.file.filename}`;
    console.log('[uploadImage] Upload successful:', urlPath);
    console.log('[uploadImage] File size:', req.file.size);
    console.log('[uploadImage] MIME type:', req.file.mimetype);

    res.set('Content-Type', 'application/json');
    const response = { url: urlPath };
    console.log('[uploadImage] Sending response:', JSON.stringify(response));
    
    return res.status(200).json(response);
  } catch (err) {
    console.error('[uploadImage] Caught error:', err);
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    
    res.set('Content-Type', 'application/json');
    return res.status(500).json({ 
      error: 'Upload failed',
      message: errorMsg 
    });
  }
};

