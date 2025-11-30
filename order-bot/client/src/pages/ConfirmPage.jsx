import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function ConfirmPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    fetchOrder();
  }, [token]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/confirm/${token}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Order not found');
      }

      setOrder(data.order);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (status) => {
    setSubmitting(true);

    try {
      const response = await fetch(`/api/orders/confirm/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes: notes || undefined }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update order');
      }

      // Redirect to thank you page
      navigate('/thank-you?status=' + status);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <p>Loading order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.errorTitle}>❌ Error</h2>
          <p style={styles.errorText}>{error}</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.errorTitle}>Order Not Found</h2>
        </div>
      </div>
    );
  }

  if (order.status !== 'pending') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Order Already Confirmed</h2>
          <p style={styles.statusBadge}>
            Status: <strong>{order.status.toUpperCase()}</strong>
          </p>
          <p style={styles.info}>This order has already been processed.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>📦 Order Confirmation</h1>
        
        <div style={styles.orderDetails}>
          <div style={styles.row}>
            <span style={styles.label}>Order Number:</span>
            <span style={styles.value}>#{order.order_number}</span>
          </div>
          
          <div style={styles.row}>
            <span style={styles.label}>Product:</span>
            <span style={styles.value}>{order.product_name}</span>
          </div>
          
          <div style={styles.row}>
            <span style={styles.label}>Quantity:</span>
            <span style={styles.value}>{order.quantity}</span>
          </div>
          
          <div style={styles.row}>
            <span style={styles.label}>Total Price:</span>
            <span style={styles.value}>{order.total_price} DZD</span>
          </div>
          
          <div style={styles.row}>
            <span style={styles.label}>Buyer:</span>
            <span style={styles.value}>{order.buyer_name}</span>
          </div>
          
          <div style={styles.row}>
            <span style={styles.label}>Delivery Address:</span>
            <span style={styles.value}>{order.buyer_address || 'N/A'}</span>
          </div>
        </div>

        <div style={styles.notesSection}>
          <label style={styles.label}>Add Notes (Optional):</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={styles.textarea}
            placeholder="Any comments or changes needed..."
            rows="4"
          />
        </div>

        <div style={styles.actions}>
          <button
            onClick={() => handleConfirm('approved')}
            style={{ ...styles.button, ...styles.approveButton }}
            disabled={submitting}
          >
            ✅ Approve
          </button>

          <button
            onClick={() => handleConfirm('declined')}
            style={{ ...styles.button, ...styles.declineButton }}
            disabled={submitting}
          >
            ❌ Decline
          </button>

          <button
            onClick={() => handleConfirm('changed')}
            style={{ ...styles.button, ...styles.changeButton }}
            disabled={submitting}
          >
            🔄 Request Changes
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '600px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '30px',
    color: '#333',
    textAlign: 'center',
  },
  orderDetails: {
    backgroundColor: '#f9f9f9',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '25px',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #eee',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#666',
  },
  value: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  notesSection: {
    marginBottom: '25px',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    marginTop: '8px',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  actions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  button: {
    padding: '14px 20px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    color: 'white',
    transition: 'all 0.2s',
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  declineButton: {
    backgroundColor: '#f44336',
  },
  changeButton: {
    backgroundColor: '#FF9800',
  },
  errorTitle: {
    fontSize: '24px',
    color: '#f44336',
    marginBottom: '15px',
    textAlign: 'center',
  },
  errorText: {
    color: '#666',
    textAlign: 'center',
  },
  statusBadge: {
    padding: '12px',
    backgroundColor: '#e3f2fd',
    borderRadius: '6px',
    textAlign: 'center',
    marginTop: '20px',
  },
  info: {
    color: '#666',
    textAlign: 'center',
    marginTop: '15px',
  },
};
