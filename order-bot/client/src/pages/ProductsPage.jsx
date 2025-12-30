import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    image_url: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');

      if (response.status === 401) {
        navigate('/login');
        return;
      }

      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchProducts();
        resetForm();
      }
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      category: product.category || '',
      image_url: product.image_url || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      fetchProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      category: '',
      image_url: '',
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div style={styles.container}><p>Loading products...</p></div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🛍️ Products</h1>
          <p style={styles.subtitle}>Manage your product catalog</p>
        </div>
        <div style={styles.headerActions}>
          <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
            ← Dashboard
          </button>
          <button onClick={() => setShowForm(!showForm)} style={styles.addButton}>
            {showForm ? 'Cancel' : '+ Add Product'}
          </button>
        </div>
      </div>

      {showForm && (
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>
            {editingProduct ? 'Edit Product' : 'New Product'}
          </h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formRow}>
              <div style={styles.field}>
                <label style={styles.label}>Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={styles.input}
                  placeholder="e.g., Electronics, Clothing"
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={styles.textarea}
                rows="3"
              />
            </div>

            <div style={styles.formRow}>
              <div style={styles.field}>
                <label style={styles.label}>Price (DZD) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  style={styles.input}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Stock</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  style={styles.input}
                  min="0"
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Image URL</label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                style={styles.input}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div style={styles.formActions}>
              <button type="submit" style={styles.saveButton}>
                💾 {editingProduct ? 'Update' : 'Create'} Product
              </button>
              <button type="button" onClick={resetForm} style={styles.cancelButton}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={styles.searchCard}>
        <input
          type="text"
          placeholder="🔍 Search products by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      <div style={styles.productsGrid}>
        {filteredProducts.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No products found</p>
            <button onClick={() => setShowForm(true)} style={styles.emptyButton}>
              Add your first product
            </button>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} style={styles.productCard}>
              {product.image_url && (
                <img src={product.image_url} alt={product.name} style={styles.productImage} />
              )}
              <div style={styles.productContent}>
                <div style={styles.productHeader}>
                  <h3 style={styles.productName}>{product.name}</h3>
                  {product.category && (
                    <span style={styles.categoryBadge}>{product.category}</span>
                  )}
                </div>
                
                {product.description && (
                  <p style={styles.productDescription}>{product.description}</p>
                )}
                
                <div style={styles.productMeta}>
                  <span style={styles.price}>{product.price} DZD</span>
                  <span style={styles.stock}>
                    Stock: {product.stock}
                  </span>
                </div>

                <div style={styles.productActions}>
                  <button onClick={() => handleEdit(product)} style={styles.editButton}>
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleDelete(product.id)} style={styles.deleteButton}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '5px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
  },
  backButton: {
    padding: '10px 20px',
    backgroundColor: '#2196F3',
    color: 'white',
    borderRadius: '6px',
    fontSize: '14px',
  },
  addButton: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '20px',
  },
  formTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
  },
  input: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
  },
  textarea: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    resize: 'vertical',
  },
  formActions: {
    display: 'flex',
    gap: '10px',
  },
  saveButton: {
    padding: '12px 24px',
    backgroundColor: '#4CAF50',
    color: 'white',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
  },
  cancelButton: {
    padding: '12px 24px',
    backgroundColor: '#999',
    color: 'white',
    borderRadius: '6px',
    fontSize: '14px',
  },
  searchCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '20px',
  },
  searchInput: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  },
  productContent: {
    padding: '20px',
  },
  productHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '10px',
  },
  productName: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
  },
  categoryBadge: {
    padding: '4px 12px',
    backgroundColor: '#e3f2fd',
    color: '#2196F3',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
  },
  productDescription: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '15px',
    lineHeight: '1.5',
  },
  productMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '15px',
  },
  price: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  stock: {
    fontSize: '14px',
    color: '#666',
  },
  productActions: {
    display: 'flex',
    gap: '10px',
  },
  editButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#FF9800',
    color: 'white',
    borderRadius: '6px',
    fontSize: '14px',
  },
  deleteButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#f44336',
    color: 'white',
    borderRadius: '6px',
    fontSize: '14px',
  },
  emptyState: {
    gridColumn: '1 / -1',
    padding: '60px 20px',
    textAlign: 'center',
    color: '#999',
  },
  emptyButton: {
    marginTop: '20px',
    padding: '12px 24px',
    backgroundColor: '#4CAF50',
    color: 'white',
    borderRadius: '6px',
    fontSize: '14px',
  },
};
