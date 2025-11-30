import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to send reset email');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
    },
    card: {
      background: 'white',
      borderRadius: '12px',
      padding: '40px',
      width: '100%',
      maxWidth: '450px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      marginBottom: '10px',
      textAlign: 'center',
      color: '#333',
    },
    subtitle: {
      fontSize: '14px',
      color: '#666',
      textAlign: 'center',
      marginBottom: '30px',
    },
    input: {
      width: '100%',
      padding: '12px',
      marginBottom: '20px',
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '16px',
      boxSizing: 'border-box',
      transition: 'border-color 0.3s',
    },
    button: {
      width: '100%',
      padding: '14px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'transform 0.2s',
      marginBottom: '15px',
    },
    backButton: {
      width: '100%',
      padding: '12px',
      background: 'white',
      color: '#667eea',
      border: '2px solid #667eea',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s',
    },
    successBox: {
      background: '#d4edda',
      border: '1px solid #c3e6cb',
      color: '#155724',
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '20px',
      textAlign: 'center',
    },
    errorBox: {
      background: '#f8d7da',
      border: '1px solid #f5c6cb',
      color: '#721c24',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '20px',
      fontSize: '14px',
    },
  };

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>✉️ Check Your Email</h1>
          <div style={styles.successBox}>
            <p>Password reset instructions have been sent to <strong>{email}</strong></p>
            <p style={{ marginTop: '10px', fontSize: '14px' }}>
              Check your inbox and follow the link to reset your password.
            </p>
          </div>
          <button
            style={styles.backButton}
            onClick={() => navigate('/login')}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🔒 Forgot Password</h1>
        <p style={styles.subtitle}>
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit}>
          {error && <div style={styles.errorBox}>{error}</div>}

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>

          <button
            type="button"
            style={styles.backButton}
            onClick={() => navigate('/login')}
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
}
