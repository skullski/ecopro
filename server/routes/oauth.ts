/**
 * OAuth Social Login Routes
 * 
 * Supports:
 * - Google Sign-In
 * - Facebook Login (future)
 */

import { Router, RequestHandler } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { jsonError } from '../utils/httpHelpers';
import { ensureConnection, findUserByEmail, createUser } from '../utils/database';
import { generateToken, generateRefreshToken, hashPassword } from '../utils/auth';
import crypto from 'crypto';
import { getCookieOptions, cookieNames } from '../utils/auth-cookies';
import { createTrialSubscription } from './billing';

const router = Router();

// Google OAuth client
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:8080/api/oauth/google/callback';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);

// Cookie names
const ACCESS_COOKIE = cookieNames.ACCESS_COOKIE;
const REFRESH_COOKIE = cookieNames.REFRESH_COOKIE;
const CSRF_COOKIE = cookieNames.CSRF_COOKIE;

function setAuthCookies(res: any, accessToken: string, refreshToken: string) {
  const { isProduction, sameSite, domain } = getCookieOptions();

  res.cookie(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite,
    domain,
    path: '/',
    maxAge: 15 * 60 * 1000,
  });

  res.cookie(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite,
    domain,
    path: '/api/auth',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  // Ensure CSRF cookie exists
  if (!res.req?.cookies?.[CSRF_COOKIE]) {
    const csrf = crypto.randomBytes(32).toString('hex');
    res.cookie(CSRF_COOKIE, csrf, {
      httpOnly: false,
      secure: isProduction,
      sameSite,
      domain,
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }
}

/**
 * GET /api/oauth/google/url
 * Returns the Google OAuth URL for the frontend to redirect to
 */
router.get('/google/url', (req, res) => {
  if (!GOOGLE_CLIENT_ID) {
    return jsonError(res, 503, 'Google OAuth not configured');
  }

  const state = crypto.randomBytes(16).toString('hex');
  
  // Store state in cookie for verification
  const { isProduction, sameSite, domain } = getCookieOptions();
  res.cookie('oauth_state', state, {
    httpOnly: true,
    secure: isProduction,
    sameSite,
    domain,
    path: '/',
    maxAge: 10 * 60 * 1000, // 10 minutes
  });

  const authUrl = googleClient.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
    state,
    prompt: 'select_account',
  });

  res.json({ url: authUrl });
});

/**
 * GET /api/oauth/google/callback
 * Handles the Google OAuth callback
 */
router.get('/google/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    const storedState = req.cookies?.oauth_state;

    // Verify state to prevent CSRF
    if (!state || state !== storedState) {
      return res.redirect('/login?error=invalid_state');
    }

    // Clear state cookie
    res.clearCookie('oauth_state');

    if (!code || typeof code !== 'string') {
      return res.redirect('/login?error=no_code');
    }

    // Exchange code for tokens
    const { tokens } = await googleClient.getToken(code);
    googleClient.setCredentials(tokens);

    // Get user info
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token!,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.redirect('/login?error=no_email');
    }

    const { email, name, picture, sub: googleId } = payload;

    // Find or create user
    const pool = await ensureConnection();
    let user = await findUserByEmail(email);

    if (!user) {
      // Create new user with Google
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const hashedPassword = await hashPassword(randomPassword);

      user = await createUser({
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        role: 'client',
        user_type: 'client',
      });

      // Store Google ID for future logins
      await pool.query(
        `UPDATE users SET google_id = $1, avatar_url = $2 WHERE id = $3`,
        [googleId, picture, user.id]
      );

      // Create client record
      try {
        await pool.query(
          `INSERT INTO clients (email, password, name, role, created_at, updated_at)
           VALUES ($1, $2, $3, $4, NOW(), NOW())
           ON CONFLICT (email) DO NOTHING`,
          [email, hashedPassword, name || 'Store Owner', 'client']
        );
      } catch (e) {
        console.warn('[OAUTH] Could not create client record:', e);
      }

      // Create trial subscription for new OAuth users
      await createTrialSubscription(Number(user.id));
    } else {
      // Update existing user with Google info if not already linked
      await pool.query(
        `UPDATE users SET google_id = COALESCE(google_id, $1), avatar_url = COALESCE(avatar_url, $2) WHERE id = $3`,
        [googleId, picture, user.id]
      );
    }

    // Check if account is locked
    if (user.is_locked) {
      return res.redirect('/login?error=account_locked');
    }

    // Generate tokens
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role || 'client',
      user_type: user.user_type || 'client',
    };
    const accessToken = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token
    await pool.query(
      `UPDATE users SET refresh_token = $1 WHERE id = $2`,
      [refreshToken, user.id]
    );

    // Set auth cookies
    setAuthCookies(res, accessToken, refreshToken);

    // Redirect to dashboard based on role
    const redirectPath = user.role === 'admin' ? '/platform-admin' : '/dashboard';
    res.redirect(redirectPath);

  } catch (error) {
    console.error('[OAUTH] Google callback error:', error);
    res.redirect('/login?error=oauth_failed');
  }
});

/**
 * POST /api/oauth/google/token
 * Verify a Google ID token from frontend (for popup/redirect flow)
 */
router.post('/google/token', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return jsonError(res, 400, 'Missing credential');
    }

    // Verify the token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return jsonError(res, 400, 'Invalid token');
    }

    const { email, name, picture, sub: googleId } = payload;

    // Find or create user
    const pool = await ensureConnection();
    let user = await findUserByEmail(email);

    if (!user) {
      // Create new user
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const hashedPassword = await hashPassword(randomPassword);

      user = await createUser({
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        role: 'client',
        user_type: 'client',
      });

      await pool.query(
        `UPDATE users SET google_id = $1, avatar_url = $2 WHERE id = $3`,
        [googleId, picture, user.id]
      );

      // Create client record
      try {
        await pool.query(
          `INSERT INTO clients (email, password, name, role, created_at, updated_at)
           VALUES ($1, $2, $3, $4, NOW(), NOW())
           ON CONFLICT (email) DO NOTHING`,
          [email, hashedPassword, name || 'Store Owner', 'client']
        );
      } catch (e) {
        console.warn('[OAUTH] Could not create client record:', e);
      }

      // Create trial subscription for new OAuth users
      await createTrialSubscription(Number(user.id));
    } else {
      await pool.query(
        `UPDATE users SET google_id = COALESCE(google_id, $1), avatar_url = COALESCE(avatar_url, $2) WHERE id = $3`,
        [googleId, picture, user.id]
      );
    }

    if (user.is_locked) {
      return jsonError(res, 403, 'Account is locked');
    }

    // Generate tokens
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role || 'client',
      user_type: user.user_type || 'client',
    };
    const accessToken = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await pool.query(
      `UPDATE users SET refresh_token = $1 WHERE id = $2`,
      [refreshToken, user.id]
    );

    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        user_type: user.user_type,
        avatar_url: picture,
      },
      token: accessToken,
    });

  } catch (error) {
    console.error('[OAUTH] Google token verification error:', error);
    return jsonError(res, 401, 'Authentication failed');
  }
});

/**
 * GET /api/oauth/config
 * Returns OAuth configuration for frontend
 */
router.get('/config', (req, res) => {
  res.json({
    google: {
      enabled: !!GOOGLE_CLIENT_ID,
      clientId: GOOGLE_CLIENT_ID || null,
    },
    facebook: {
      enabled: false, // Not implemented yet
      appId: null,
    },
  });
});

export default router;
