import React from 'react';
import { useSearchParams } from 'react-router-dom';

export default function ThankYouPage() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');

  const messages = {
    approved: {
      icon: '✅',
      title: 'Order Approved!',
      message: 'Thank you for approving your order. The seller has been notified and will process your order shortly.',
      color: '#4CAF50',
    },
    declined: {
      icon: '❌',
      title: 'Order Declined',
      message: 'Your order has been declined. The seller has been notified. If this was a mistake, please contact the seller directly.',
      color: '#f44336',
    },
    changed: {
      icon: '🔄',
      title: 'Changes Requested',
      message: 'Your change request has been submitted. The seller will review your notes and contact you shortly.',
      color: '#FF9800',
    },
  };

  const statusData = messages[status] || messages.approved;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ ...styles.icon, color: statusData.color }}>
          {statusData.icon}
        </div>
        
        <h1 style={styles.title}>{statusData.title}</h1>
        
        <p style={styles.message}>{statusData.message}</p>
        
        <div style={styles.info}>
          <p style={styles.infoText}>
            You will receive updates via WhatsApp and SMS.
          </p>
          <p style={styles.infoText}>
            For any questions, please contact your seller directly.
          </p>
        </div>
        
        <div style={styles.footer}>
          <p style={styles.footerText}>
            Order Confirmation Bot • Powered by WhatsApp & SMS
          </p>
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
    padding: '60px 40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '500px',
    textAlign: 'center',
  },
  icon: {
    fontSize: '80px',
    marginBottom: '20px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#333',
  },
  message: {
    fontSize: '16px',
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '30px',
  },
  info: {
    backgroundColor: '#f9f9f9',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '30px',
  },
  infoText: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px',
    lineHeight: '1.5',
  },
  footer: {
    paddingTop: '20px',
    borderTop: '1px solid #eee',
  },
  footerText: {
    fontSize: '12px',
    color: '#999',
  },
};
