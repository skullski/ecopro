
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

    const { exp, sig } = signUploadPath({ filename: finalName, expiresInSeconds: 10 * 60 });
    const signedUrl = `/uploads/${finalName}?exp=${exp}&sig=${sig}`;

    return res.status(200).json({
      url: signedUrl,
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
    const exp = Number.parseInt(String((req.query as any).exp || ''), 10);
    const sig = String((req.query as any).sig || '');

    if (!isSafeUploadName(filename)) return res.status(404).end();
    if (!sig || !Number.isFinite(exp)) return res.status(404).end();
    if (!verifyUploadSignature({ filename, exp, sig })) return res.status(404).end();

    const filePath = path.join(UPLOAD_DIR, filename);
    // Prevent path traversal
    if (!filePath.startsWith(UPLOAD_DIR)) return res.status(404).end();

    return res.sendFile(filePath, {
      headers: {
        'Cache-Control': 'private, max-age=300',
      },
    });
  } catch (e) {
    return res.status(404).end();
  }
};


