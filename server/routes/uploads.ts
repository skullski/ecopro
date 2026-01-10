
import { RequestHandler } from 'express';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import multer from 'multer';
import { fileTypeFromFile } from 'file-type';
import { scanFileForMalware } from '../utils/malware-scan';
import { isSafeUploadName, signUploadPath, verifyUploadSignature } from '../utils/upload-signing';

const isProduction = process.env.NODE_ENV === 'production';

const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(process.cwd(), 'uploads');

const TMP_DIR = path.join(UPLOAD_DIR, 'tmp');

const MAX_UPLOAD_BYTES = (() => {
  const raw = process.env.MAX_UPLOAD_BYTES;
  const n = raw ? Number.parseInt(raw, 10) : NaN;
  if (Number.isFinite(n) && n > 0) return n;
  // Default to 10MB
  return 10 * 1024 * 1024;
})();

// Allowlist MIME types (validated again via magic bytes)
const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
]);

async function ensureDirs() {
  await fs.mkdir(TMP_DIR, { recursive: true });
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

// Multer stores to a private tmp dir; we verify magic bytes then rename
const storage = multer.diskStorage({
  destination: async function (_req, _file, cb) {
    try {
      await ensureDirs();
      cb(null, TMP_DIR);
    } catch (e) {
      cb(e as any, TMP_DIR);
    }
  },
  filename: function (_req, file, cb) {
    const id = crypto.randomUUID();
    const safeOrig = String(file.originalname || '').replace(/[^a-z0-9._-]/gi, '_').slice(0, 120);
    cb(null, `${id}__${safeOrig || 'upload'}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(new Error('File type not allowed'));
    }
    cb(null, true);
  },
});

// POST /api/upload (multipart/form-data)
export const uploadImage: RequestHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!req.user?.id) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Magic-byte detection (server-trusts file contents, not client headers)
    const detected = await fileTypeFromFile(req.file.path);
    if (!detected || !ALLOWED_MIME.has(detected.mime)) {
      await fs.unlink(req.file.path).catch(() => null);
      return res.status(400).json({ error: 'File contents not allowed' });
    }

    // Malware scan (ClamAV)
    const scan = await scanFileForMalware(req.file.path);
    if (scan.ok === false) {
      await fs.unlink(req.file.path).catch(() => null);
      return res.status(400).json({ error: scan.reason });
    }

    await ensureDirs();
    const finalName = `${crypto.randomUUID()}.${detected.ext}`;
    const finalPath = path.join(UPLOAD_DIR, finalName);
    await fs.rename(req.file.path, finalPath);

    // Return clean URL without signature (files are publicly accessible)
    const publicUrl = `/uploads/${finalName}`;

    return res.status(200).json({
      url: publicUrl,
      filename: finalName,
      size: req.file.size,
      mimetype: detected.mime,
    });
  } catch (err) {
    console.error('[uploadImage] Caught error:', isProduction ? (err as any)?.message : err);
    return res.status(500).json(isProduction ? { error: 'Upload failed' } : { error: 'Upload failed' });
  }
};

// GET /uploads/:filename?exp=..&sig=..
export const serveSignedUpload: RequestHandler = async (req, res) => {
  try {
    const filename = String((req.params as any).filename || '');

    if (!isSafeUploadName(filename)) return res.status(404).end();

    // Allow public access to uploaded files (logos, banners, product images)
    // These are user-uploaded content that should be publicly accessible
    const filePath = path.join(UPLOAD_DIR, filename);
    
    // Prevent path traversal
    if (!filePath.startsWith(UPLOAD_DIR)) return res.status(404).end();

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).end();
    }

    return res.sendFile(filePath, {
      headers: {
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });
  } catch (e) {
    return res.status(404).end();
  }
};

// GET /api/client/images - List all images for a client with usage info
import { ensureConnection } from '../utils/database';

export const listClientImages: RequestHandler = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const clientId = req.user.id;
    const pool = await ensureConnection();
    
    // Get all image references from the database for THIS CLIENT ONLY
    // 1. Product images
    const productImagesResult = await pool.query(
      `SELECT id, title, images, slug FROM client_store_products WHERE client_id = $1`,
      [clientId]
    );
    
    // 2. Store settings (logo, banner, hero images)
    const settingsResult = await pool.query(
      `SELECT store_logo, banner_url, hero_main_url, hero_tile1_url, hero_tile2_url, store_images
       FROM client_store_settings WHERE client_id = $1`,
      [clientId]
    );
    
    // 3. Stock images
    const stockImagesResult = await pool.query(
      `SELECT id, name, images FROM client_stock_products WHERE client_id = $1`,
      [clientId]
    );
    
    // Build a map of image URL -> usage info
    const imageUsage: Record<string, { type: string; name: string; id?: number }[]> = {};
    // Track all image URLs that belong to this client
    const clientImageUrls = new Set<string>();
    
    // Process product images
    for (const product of productImagesResult.rows) {
      const images = product.images || [];
      for (const imgUrl of images) {
        if (!imgUrl) continue;
        clientImageUrls.add(imgUrl);
        if (!imageUsage[imgUrl]) imageUsage[imgUrl] = [];
        imageUsage[imgUrl].push({
          type: 'product',
          name: product.title || `Product #${product.id}`,
          id: product.id
        });
      }
    }
    
    // Process stock images
    for (const stock of stockImagesResult.rows) {
      const images = stock.images || [];
      for (const imgUrl of images) {
        if (!imgUrl) continue;
        clientImageUrls.add(imgUrl);
        if (!imageUsage[imgUrl]) imageUsage[imgUrl] = [];
        imageUsage[imgUrl].push({
          type: 'stock',
          name: stock.name || `Stock #${stock.id}`,
          id: stock.id
        });
      }
    }
    
    // Process store settings images
    if (settingsResult.rows.length > 0) {
      const settings = settingsResult.rows[0];
      
      if (settings.store_logo) {
        clientImageUrls.add(settings.store_logo);
        if (!imageUsage[settings.store_logo]) imageUsage[settings.store_logo] = [];
        imageUsage[settings.store_logo].push({ type: 'store', name: 'Store Logo' });
      }
      
      if (settings.banner_url) {
        clientImageUrls.add(settings.banner_url);
        if (!imageUsage[settings.banner_url]) imageUsage[settings.banner_url] = [];
        imageUsage[settings.banner_url].push({ type: 'store', name: 'Banner' });
      }
      
      if (settings.hero_main_url) {
        clientImageUrls.add(settings.hero_main_url);
        if (!imageUsage[settings.hero_main_url]) imageUsage[settings.hero_main_url] = [];
        imageUsage[settings.hero_main_url].push({ type: 'store', name: 'Hero Main' });
      }
      
      if (settings.hero_tile1_url) {
        clientImageUrls.add(settings.hero_tile1_url);
        if (!imageUsage[settings.hero_tile1_url]) imageUsage[settings.hero_tile1_url] = [];
        imageUsage[settings.hero_tile1_url].push({ type: 'store', name: 'Hero Tile 1' });
      }
      
      if (settings.hero_tile2_url) {
        clientImageUrls.add(settings.hero_tile2_url);
        if (!imageUsage[settings.hero_tile2_url]) imageUsage[settings.hero_tile2_url] = [];
        imageUsage[settings.hero_tile2_url].push({ type: 'store', name: 'Hero Tile 2' });
      }
      
      // Process store_images array
      const storeImages = settings.store_images || [];
      for (let i = 0; i < storeImages.length; i++) {
        const imgUrl = storeImages[i];
        if (!imgUrl) continue;
        clientImageUrls.add(imgUrl);
        if (!imageUsage[imgUrl]) imageUsage[imgUrl] = [];
        imageUsage[imgUrl].push({ type: 'store', name: `Store Gallery Image ${i + 1}` });
      }
    }
    
    // Read actual files from uploads directory
    await ensureDirs();
    const files = await fs.readdir(UPLOAD_DIR);
    const imageFiles = files.filter(f => 
      !f.startsWith('.') && 
      f !== 'tmp' && 
      /\.(jpg|jpeg|png|gif|webp|mp4)$/i.test(f)
    );
    
    // Only include files that belong to this client (referenced in their data)
    const clientImageFiles = imageFiles.filter(filename => {
      const url = `/uploads/${filename}`;
      return clientImageUrls.has(url);
    });
    
    // Build response with only THIS CLIENT's images
    const images = await Promise.all(clientImageFiles.map(async (filename) => {
      const filePath = path.join(UPLOAD_DIR, filename);
      const stats = await fs.stat(filePath);
      const url = `/uploads/${filename}`;
      
      return {
        filename,
        url,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        usedIn: imageUsage[url] || [],
        isOrphaned: !imageUsage[url] || imageUsage[url].length === 0
      };
    }));
    
    // Sort by date (newest first)
    images.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    res.json({
      images,
      total: images.length,
      orphaned: images.filter(i => i.isOrphaned).length,
      inUse: images.filter(i => !i.isOrphaned).length
    });
  } catch (err) {
    console.error('[listClientImages] Error:', isProduction ? (err as any)?.message : err);
    res.status(500).json({ error: 'Failed to list images' });
  }
};

// DELETE /api/client/images/:filename - Delete an image
export const deleteClientImage: RequestHandler = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const filename = String(req.params.filename || '');
    if (!isSafeUploadName(filename)) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    
    const clientId = req.user.id;
    const pool = await ensureConnection();
    const url = `/uploads/${filename}`;
    
    // Check if image is in use by this client
    const productCheck = await pool.query(
      `SELECT id, title FROM client_store_products 
       WHERE client_id = $1 AND $2 = ANY(images)`,
      [clientId, url]
    );
    
    const settingsCheck = await pool.query(
      `SELECT client_id FROM client_store_settings 
       WHERE client_id = $1 
         AND (store_logo = $2 OR banner_url = $2 OR hero_main_url = $2 
              OR hero_tile1_url = $2 OR hero_tile2_url = $2 
              OR $2 = ANY(store_images))`,
      [clientId, url]
    );
    
    if (productCheck.rows.length > 0) {
      const product = productCheck.rows[0];
      return res.status(400).json({ 
        error: 'Image in use',
        message: `This image is used by product "${product.title}". Remove it from the product first.`,
        usedBy: { type: 'product', id: product.id, name: product.title }
      });
    }
    
    if (settingsCheck.rows.length > 0) {
      return res.status(400).json({
        error: 'Image in use',
        message: 'This image is used in your store settings (logo, banner, or hero). Remove it from settings first.',
        usedBy: { type: 'store' }
      });
    }
    
    // Delete the file
    const filePath = path.join(UPLOAD_DIR, filename);
    if (!filePath.startsWith(UPLOAD_DIR)) {
      return res.status(400).json({ error: 'Invalid path' });
    }
    
    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
      res.json({ ok: true, message: 'Image deleted successfully' });
    } catch {
      res.status(404).json({ error: 'Image not found' });
    }
  } catch (err) {
    console.error('[deleteClientImage] Error:', isProduction ? (err as any)?.message : err);
    res.status(500).json({ error: 'Failed to delete image' });
  }
};
