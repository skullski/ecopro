import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWilayaList, getCommunesByWilaya } from '../data/algeriaLocations';

export default function StorefrontPage() {
  const { clientId } = useParams();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(true);
  const [storeInfo, setStoreInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchStoreInfo();
  }, [clientId]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/storefront/${clientId}/products`);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreInfo = async () => {
    try {
      const response = await fetch(`/api/storefront/${clientId}/info`);
      const data = await response.json();
      setStoreInfo(data);
    } catch (error) {
      console.error('Failed to fetch store info:', error);
    }
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity === 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
    },
    header: {
      backgroundColor: 'white',
      padding: '20px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      marginBottom: '30px',
    },
    storeName: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '5px',
    },
    storeInfo: {
      fontSize: '14px',
      color: '#666',
    },
    cartButton: {
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '50px',
      padding: '15px 25px',
      fontSize: '18px',
      fontWeight: 'bold',
      cursor: 'pointer',
      boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    badge: {
      backgroundColor: 'white',
      color: '#4CAF50',
      borderRadius: '50%',
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: 'bold',
    },
    productsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '25px',
      padding: '20px',
      maxWidth: '1400px',
      margin: '0 auto',
    },
    productCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      transition: 'transform 0.3s, box-shadow 0.3s',
      cursor: 'pointer',
    },
    productImage: {
      width: '100%',
      height: '220px',
      objectFit: 'cover',
      backgroundColor: '#f0f0f0',
    },
    productInfo: {
      padding: '20px',
    },
    productName: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '8px',
    },
    productDescription: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '15px',
      minHeight: '40px',
    },
    productPrice: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#4CAF50',
      marginBottom: '15px',
    },
    addButton: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
    },
    outOfStock: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#ccc',
      color: '#666',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'not-allowed',
    },
    empty: {
      textAlign: 'center',
      padding: '60px 20px',
      fontSize: '18px',
      color: '#999',
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.empty}>Loading products...</div>
      </div>
    );
  }

  if (showCheckout) {
    return (
      <CheckoutModal
        cart={cart}
        storeInfo={storeInfo}
        clientId={clientId}
        onClose={() => setShowCheckout(false)}
        onSuccess={() => {
          setCart([]);
          setShowCheckout(false);
          navigate('/thank-you');
        }}
      />
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.storeName}>
          {storeInfo?.company_name || 'Online Store'}
        </h1>
        {storeInfo?.support_phone && (
          <p style={styles.storeInfo}>📞 {storeInfo.support_phone}</p>
        )}
      </div>

      {products.length === 0 ? (
        <div style={styles.empty}>No products available at the moment</div>
      ) : (
        <div style={styles.productsGrid}>
          {products.map((product) => (
            <div
              key={product.id}
              style={styles.productCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  style={styles.productImage}
                />
              )}
              <div style={styles.productInfo}>
                <h3 style={styles.productName}>{product.name}</h3>
                <p style={styles.productDescription}>{product.description}</p>
                <p style={styles.productPrice}>{product.price} DZD</p>
                
                {product.stock > 0 ? (
                  <button
                    onClick={() => addToCart(product)}
                    style={styles.addButton}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#45a049'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#4CAF50'}
                  >
                    🛒 Add to Cart
                  </button>
                ) : (
                  <button style={styles.outOfStock} disabled>
                    Out of Stock
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {cart.length > 0 && (
        <button
          onClick={() => setShowCheckout(true)}
          style={styles.cartButton}
        >
          🛒 Cart
          <span style={styles.badge}>{cart.length}</span>
        </button>
      )}
    </div>
  );
}

function CheckoutModal({ cart, storeInfo, clientId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    wilaya: '',
    commune: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const wilayaList = getWilayaList();
  const communeList = formData.wilaya ? getCommunesByWilaya(formData.wilaya) : [];

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Create order for each item
      const orders = cart.map(item => ({
        client_id: clientId,
        buyer: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
        },
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        total_price: item.price * item.quantity,
        wilaya: formData.wilaya,
        commune: formData.commune,
        notes: formData.notes,
      }));

      const response = await fetch(`/api/storefront/${clientId}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders }),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
      } else {
        setError(data.error || 'Failed to place order');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '30px',
      maxWidth: '700px',
      width: '100%',
      maxHeight: '90vh',
      overflowY: 'auto',
    },
    header: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '20px',
      color: '#333',
    },
    cartSummary: {
      backgroundColor: '#f9f9f9',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '25px',
    },
    cartItem: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '10px',
      fontSize: '14px',
    },
    total: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginTop: '15px',
      paddingTop: '15px',
      borderTop: '2px solid #ddd',
    },
    field: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '8px',
      color: '#333',
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px',
      boxSizing: 'border-box',
    },
    select: {
      width: '100%',
      padding: '12px',
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: 'white',
      cursor: 'pointer',
      boxSizing: 'border-box',
    },
    textarea: {
      width: '100%',
      padding: '12px',
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '14px',
      minHeight: '80px',
      fontFamily: 'inherit',
      resize: 'vertical',
      boxSizing: 'border-box',
    },
    error: {
      backgroundColor: '#ffebee',
      color: '#c62828',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '20px',
    },
    footer: {
      display: 'flex',
      gap: '12px',
      marginTop: '25px',
    },
    submitButton: {
      flex: 1,
      padding: '14px',
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
    },
    cancelButton: {
      padding: '14px 24px',
      backgroundColor: 'white',
      color: '#666',
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.header}>🛒 Checkout</h2>

        <div style={styles.cartSummary}>
          <h3>Order Summary</h3>
          {cart.map((item) => (
            <div key={item.id} style={styles.cartItem}>
              <span>{item.name} x {item.quantity}</span>
              <span>{item.price * item.quantity} DZD</span>
            </div>
          ))}
          <div style={styles.total}>
            Total: {getTotalPrice()} DZD
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Phone Number *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              style={styles.input}
              placeholder="+213..."
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Wilaya *</label>
            <select
              value={formData.wilaya}
              onChange={(e) => setFormData({ ...formData, wilaya: e.target.value, commune: '' })}
              style={styles.select}
              required
            >
              <option value="">Select Wilaya</option>
              {wilayaList.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.code} - {w.name}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Commune *</label>
            <select
              value={formData.commune}
              onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
              style={styles.select}
              disabled={!formData.wilaya}
              required
            >
              <option value="">Select Commune</option>
              {communeList.map((commune) => (
                <option key={commune} value={commune}>
                  {commune}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Delivery Address *</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              style={styles.textarea}
              placeholder="Street, building, floor..."
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Order Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              style={styles.textarea}
              placeholder="Any special requests..."
            />
          </div>

          <div style={styles.footer}>
            <button
              type="button"
              onClick={onClose}
              style={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                ...styles.submitButton,
                opacity: submitting ? 0.7 : 1,
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? 'Placing Order...' : '✅ Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
