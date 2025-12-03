import { RequestHandler } from 'express';
import path from 'path';
import fs from 'fs';
import { pool } from '../utils/database';
import multer from 'multer';

const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({ dest: uploadDir });

export const createProduct: RequestHandler = async (req, res) => {
  const { storeSlug } = req.params as any;
  const { title, description, price, category } = req.body;
  try {
    const r = await pool.query(
      `INSERT INTO client_store_products (store_slug, title, description, price, category, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id`,
      [storeSlug, title, description ?? null, Number(price), category ?? null]
    );
    res.json({ id: r.rows[0].id });
  } catch (e) {
    res.status(500).send((e as any).message);
  }
};

export const updateProduct: RequestHandler = async (req, res) => {
  const { storeSlug, id } = req.params as any;
  const { title, description, price, category } = req.body;
  try {
    await pool.query(
      `UPDATE client_store_products SET title=$3, description=$4, price=$5, category=$6, updated_at=NOW()
       WHERE id=$2 AND store_slug=$1`,
      [storeSlug, id, title, description ?? null, Number(price), category ?? null]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).send((e as any).message);
  }
};

export const deleteProduct: RequestHandler = async (req, res) => {
  const { storeSlug, id } = req.params as any;
  try {
    await pool.query(
      `DELETE FROM client_store_products WHERE id=$2 AND store_slug=$1`,
      [storeSlug, id]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).send((e as any).message);
  }
};

export const handleUploadImages = [
  upload.array('files', 6),
  (async (req: any, res: any) => {
    const { storeSlug, id } = req.params;
    try {
      const files = (req.files as Express.Multer.File[]).map((f) => `/uploads/${path.basename(f.path)}`);
      const r = await pool.query(`SELECT images FROM client_store_products WHERE id=$2 AND store_slug=$1`, [storeSlug, id]);
      const existing = Array.isArray(r.rows[0]?.images) ? r.rows[0].images : [];
      const next = [...existing, ...files].slice(0, 6);
      await pool.query(`UPDATE client_store_products SET images=$3, updated_at=NOW() WHERE id=$2 AND store_slug=$1`, [storeSlug, id, next]);
      res.json({ images: next });
    } catch (e) {
      res.status(500).send((e as any).message);
    }
  })
];
