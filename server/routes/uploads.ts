import { RequestHandler } from 'express';
import fs from 'fs/promises';
import path from 'path';

// Accepts JSON body: { filename, data } where data is base64 image string (data URL or raw base64)
export const uploadImage: RequestHandler = async (req, res) => {
  try {
    const { filename, data } = req.body as { filename: string; data: string };
    if (!filename || !data) return res.status(400).json({ error: 'Missing filename or data' });

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    // strip data URL prefix if present
    const base64 = data.includes(',') ? data.split(',')[1] : data;
    const buffer = Buffer.from(base64, 'base64');
    // Limit to 2MB per upload for demo
    const MAX_SIZE = 2 * 1024 * 1024;
    if (buffer.length > MAX_SIZE) {
      return res.status(413).json({ error: 'File too large (max 2MB)' });
    }
    // ensure filename safe
    const safeName = filename.replace(/[^a-z0-9.-_]/gi, '_');
    const filePath = path.join(uploadsDir, `${Date.now()}_${safeName}`);
    await fs.writeFile(filePath, buffer);

    // Build public url
  const urlPath = `/uploads/${path.basename(filePath)}`;
    res.json({ url: urlPath });
  } catch (err) {
    console.error('Upload error', err);
    res.status(500).json({ error: 'Upload failed' });
  }
};
