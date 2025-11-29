import { RequestHandler } from "express";
import { pool } from "../utils/database";

export const getPublicProduct: RequestHandler = async (req, res) => {
  const { clientId, slug } = req.params;

  try {
    // Get product with store settings
    const productResult = await pool.query(
      `SELECT 
        p.*,
        s.store_name,
        s.primary_color,
        s.secondary_color
      FROM client_store_products p
      LEFT JOIN client_store_settings s ON p.client_id = s.client_id
      WHERE p.client_id = $1 AND p.slug = $2 AND p.status = 'active'`,
      [clientId, slug]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = productResult.rows[0];

    // Increment view count
    await pool.query(
      'UPDATE client_store_products SET views = views + 1 WHERE id = $1',
      [product.id]
    );

    res.json({
      ...product,
      views: product.views + 1, // Return updated view count
    });
  } catch (error) {
    console.error('Get public product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};
