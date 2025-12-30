import { RequestHandler } from 'express';
import { ensureConnection } from '../utils/database';

// Handler to delete a store image
export const deleteStoreImage: RequestHandler = async (req, res) => {
  const user = (req as any).user;
  const clientId = user?.id;
  const { imageIndex } = req.body || {};

  if (!clientId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  if (typeof imageIndex !== 'number' || !Number.isFinite(imageIndex)) {
    return res.status(400).json({ error: 'Invalid request payload' });
  }

  try {
    const pool = await ensureConnection();

    // Fetch current store_images for this tenant only
    const result = await pool.query(
      'SELECT store_images FROM client_store_settings WHERE client_id = $1',
      [clientId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Store settings not found' });
    }

    const images: string[] = Array.isArray(result.rows[0].store_images) ? result.rows[0].store_images : [];
    if (imageIndex < 0 || imageIndex >= images.length) {
      return res.status(400).json({ error: 'Invalid image index' });
    }

    // Remove the image from the array
    images.splice(imageIndex, 1);

    // Update store_images (tenant-scoped)
    await pool.query(
      'UPDATE client_store_settings SET store_images = $2, updated_at = NOW() WHERE client_id = $1',
      [clientId, images]
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deleting store image:", error);
    res.status(500).json({ error: "Failed to delete store image" });
  }
};