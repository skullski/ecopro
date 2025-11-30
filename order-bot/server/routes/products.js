import express from 'express';
import { Product } from '../models/Product.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all products for a client
router.get('/', authMiddleware, async (req, res) => {
  try {
    const clientId = req.clientId;
    const { includeInactive } = req.query;

    const products = await Product.findByClientId(
      clientId,
      includeInactive === 'true'
    );

    res.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
});

// Search products
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const clientId = req.clientId;
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const products = await Product.search(clientId, q);

    res.json({ products });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ error: 'Failed to search products' });
  }
});

// Get single product
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const clientId = req.clientId;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.client_id !== clientId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to get product' });
  }
});

// Create product
router.post('/', authMiddleware, async (req, res) => {
  try {
    const clientId = req.clientId;
    const { name, description, price, stock, category, image_url } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const product = await Product.create({
      client_id: clientId,
      name,
      description,
      price,
      stock: stock || 0,
      category,
      image_url,
    });

    res.status(201).json({ product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const clientId = req.clientId;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.client_id !== clientId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedProduct = await Product.update(id, req.body);

    res.json({ product: updatedProduct });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const clientId = req.clientId;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.client_id !== clientId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Product.delete(id);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
