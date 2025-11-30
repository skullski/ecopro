import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(data.error || 'Failed to reset password');
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
      marginBottom: '15px',
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
      marginTop: '10px',
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
    passwordHint: {
      fontSize: '12px',
      color: '#666',
      marginBottom: '20px',
    },
  };

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>✅ Password Reset!</h1>
          <div style={styles.successBox}>
            <p>Your password has been successfully reset.</p>
            <p style={{ marginTop: '10px', fontSize: '14px' }}>
              Redirecting to login page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🔑 Reset Password</h1>
        <p style={styles.subtitle}>
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit}>
          {error && <div style={styles.errorBox}>{error}</div>}

          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            style={styles.input}
          />

          <p style={styles.passwordHint}>
            Password must be at least 6 characters long
          </p>

          <button
            type="submit"
            disabled={loading || !token}
            style={{
              ...styles.button,
              opacity: (loading || !token) ? 0.7 : 1,
              cursor: (loading || !token) ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
