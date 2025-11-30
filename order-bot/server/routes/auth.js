import express from 'express';
import { Client } from '../models/Client.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../utils/email.js';

const router = express.Router();

// Register new client
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, company_name } = req.body;

    // Check if client already exists
    const existing = await Client.findByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const client = await Client.create({
      name,
      email,
      password,
      phone,
      company_name,
    });

    const token = jwt.sign(
      { clientId: client.id, email: client.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Send welcome email
    sendWelcomeEmail(client);

    res.status(201).json({ client, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const client = await Client.findByEmail(email);
    if (!client) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await Client.verifyPassword(password, client.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { clientId: client.id, email: client.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Remove password hash from response
    delete client.password_hash;

    res.json({ client, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const client = await Client.findByEmail(email);
    if (!client) {
      return res.status(404).json({ error: 'Email not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

    // Save token to database
    await Client.saveResetToken(client.id, resetToken, resetTokenExpires);

    // Send reset email
    await sendPasswordResetEmail(client, resetToken);

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    const client = await Client.findByResetToken(token);
    
    if (!client) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Update password
    await Client.updatePassword(client.id, password);
    
    // Clear reset token
    await Client.clearResetToken(client.id);

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

export default router;
