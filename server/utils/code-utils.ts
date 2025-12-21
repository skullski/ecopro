/**
 * Code Generation and Validation Utilities
 * Handles secure subscription code generation, validation, and redemption
 */

import crypto from 'crypto';
import { pool } from './database';

/**
 * Generate a secure, unique subscription code
 * Format: XXXX-XXXX-XXXX-XXXX (16 alphanumeric characters)
 * Example: A7K2-9M3Q-5R8T-2B9L
 */
export function generateSubscriptionCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';

  // Generate 16 random alphanumeric characters
  for (let i = 0; i < 16; i++) {
    const randomIndex = crypto.randomInt(0, characters.length);
    code += characters[randomIndex];

    // Add hyphens for readability (every 4 characters)
    if ((i + 1) % 4 === 0 && i !== 15) {
      code += '-';
    }
  }

  return code;
}

/**
 * Validate code format
 */
export function isValidCodeFormat(code: string): boolean {
  const codeRegex = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  return codeRegex.test(code.toUpperCase());
}

/**
 * Get code age in hours
 */
export function getCodeAgeHours(issuedAt: Date | string): number {
  const issued = typeof issuedAt === 'string' ? new Date(issuedAt) : issuedAt;
  const now = new Date();
  return (now.getTime() - issued.getTime()) / (1000 * 60 * 60);
}

/**
 * Check if code is expired
 */
export function isCodeExpired(expiryDate: Date | string): boolean {
  const expiry = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
  return new Date() > expiry;
}

/**
 * Get hours until code expiry
 */
export function getHoursUntilExpiry(expiryDate: Date | string): number {
  const expiry = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
  const now = new Date();
  return (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
}

/**
 * Format expiry time in human-readable format
 */
export function formatExpiryTime(expiryDate: Date | string): string {
  const hours = getHoursUntilExpiry(expiryDate);

  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} remaining`;
  }

  if (hours < 24) {
    const wholeHours = Math.floor(hours);
    return `${wholeHours} hour${wholeHours !== 1 ? 's' : ''} remaining`;
  }

  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} remaining`;
}

/**
 * Rate limit check for code validation attempts
 * Max 5 attempts per minute per user
 */
export async function checkCodeValidationRateLimit(
  userId: number,
  userType: 'client' | 'seller',
  ipAddress?: string
): Promise<{ allowed: boolean; attemptsRemaining: number; resetIn: number }> {
  try {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

    // Get attempts in last minute
    const result = await pool.query(
      `SELECT COUNT(*) as attempt_count 
       FROM code_validation_attempts 
       WHERE user_id = $1 AND user_type = $2 AND created_at > $3`,
      [userId, userType, oneMinuteAgo]
    );

    const attemptCount = parseInt(result.rows[0].attempt_count);
    const maxAttempts = 5;
    const allowed = attemptCount < maxAttempts;

    // Calculate reset time (seconds until oldest attempt expires)
    const oldestAttempt = await pool.query(
      `SELECT created_at FROM code_validation_attempts 
       WHERE user_id = $1 AND user_type = $2 AND created_at > $3
       ORDER BY created_at ASC LIMIT 1`,
      [userId, userType, oneMinuteAgo]
    );

    let resetIn = 0;
    if (oldestAttempt.rows.length > 0) {
      const oldestTime = new Date(oldestAttempt.rows[0].created_at).getTime();
      resetIn = Math.ceil((oldestTime + 60 * 1000 - Date.now()) / 1000);
    }

    return {
      allowed,
      attemptsRemaining: Math.max(0, maxAttempts - attemptCount),
      resetIn: Math.max(0, resetIn)
    };
  } catch (error: any) {
    console.error('Rate limit check error:', error);
    // On error, allow the attempt but log it
    return { allowed: true, attemptsRemaining: 5, resetIn: 0 };
  }
}

/**
 * Record code validation attempt for rate limiting
 */
export async function recordCodeValidationAttempt(
  userId: number,
  userType: 'client' | 'seller',
  attemptedCode: string,
  result: 'success' | 'invalid' | 'expired' | 'already_used',
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO code_validation_attempts (user_id, user_type, attempted_code, attempt_result, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, userType, attemptedCode, result, ipAddress || null, userAgent || null]
    );
  } catch (error: any) {
    console.error('Error recording validation attempt:', error);
  }
}

/**
 * Validate subscription code and return details
 * Checks: format, expiry, already used, valid status
 */
export async function validateSubscriptionCode(
  code: string
): Promise<{
  valid: boolean;
  codeRequest?: any;
  error?: string;
}> {
  try {
    // Format validation
    if (!isValidCodeFormat(code)) {
      return {
        valid: false,
        error: 'Invalid code format. Use format: XXXX-XXXX-XXXX-XXXX'
      };
    }

    // Query database
    const result = await pool.query(
      `SELECT * FROM code_requests WHERE generated_code = $1`,
      [code.toUpperCase()]
    );

    if (result.rows.length === 0) {
      return {
        valid: false,
        error: 'Code not found. Please check and try again.'
      };
    }

    const codeRequest = result.rows[0];

    // Check if code is in correct status
    if (codeRequest.status !== 'issued') {
      return {
        valid: false,
        error: `Code has already been ${codeRequest.status}. Each code can only be used once.`
      };
    }

    // Check expiry
    if (isCodeExpired(codeRequest.expiry_date)) {
      return {
        valid: false,
        error: `Code has expired. Codes are valid for 1 hour after being issued.`
      };
    }

    return {
      valid: true,
      codeRequest
    };
  } catch (error: any) {
    return {
      valid: false,
      error: 'Error validating code. Please try again.'
    };
  }
}

/**
 * Redeem a code for a client
 * This activates/upgrades their subscription
 */
export async function redeemSubscriptionCode(
  code: string,
  clientId: number,
  userAgent?: string,
  ipAddress?: string
): Promise<{
  success: boolean;
  subscription?: any;
  error?: string;
}> {
  try {
    // Check rate limit first
    const rateLimit = await checkCodeValidationRateLimit(clientId, 'client', ipAddress);
    if (!rateLimit.allowed) {
      return {
        success: false,
        error: `Too many attempts. Please try again in ${rateLimit.resetIn} second${rateLimit.resetIn !== 1 ? 's' : ''}.`
      };
    }

    // Validate code
    const validation = await validateSubscriptionCode(code);
    if (!validation.valid) {
      // Record failed attempt
      await recordCodeValidationAttempt(
        clientId,
        'client',
        code,
        'invalid',
        ipAddress,
        userAgent
      );

      return {
        success: false,
        error: validation.error
      };
    }

    const codeRequest = validation.codeRequest;

    // Verify client matches the code request
    if (codeRequest.client_id !== clientId) {
      await recordCodeValidationAttempt(
        clientId,
        'client',
        code,
        'invalid',
        ipAddress,
        userAgent
      );

      return {
        success: false,
        error: 'This code was not issued to your account.'
      };
    }

    // Begin transaction: update code status and subscription
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Mark code as used
      const updateCodeResult = await client.query(
        `UPDATE code_requests 
         SET status = 'used', redeemed_at = NOW(), redeemed_by_client_id = $1, is_redeemable = false
         WHERE id = $2 AND status = 'issued'
         RETURNING *`,
        [clientId, codeRequest.id]
      );

      if (updateCodeResult.rows.length === 0) {
        throw new Error('Code was already redeemed');
      }

      // Get user associated with client
      const userResult = await client.query(
        `SELECT u.id FROM users u
         JOIN clients c ON c.user_id = u.id
         WHERE c.id = $1`,
        [clientId]
      );

      if (userResult.rows.length === 0) {
        throw new Error('Client user not found');
      }

      const userId = userResult.rows[0].id;

      // Get or create subscription
      const subResult = await client.query(
        `SELECT * FROM subscriptions WHERE user_id = $1`,
        [userId]
      );

      let subscriptionId;
      if (subResult.rows.length === 0) {
        // Create new subscription with 30-day trial-to-active conversion
        const newSub = await client.query(
          `INSERT INTO subscriptions (user_id, status, trial_started_at, trial_ends_at, current_period_start, current_period_end)
           VALUES ($1, 'active', NOW() - INTERVAL '1 day', NOW(), NOW(), NOW() + INTERVAL '30 days')
           RETURNING *`,
          [userId]
        );
        subscriptionId = newSub.rows[0].id;
      } else {
        // Update existing subscription to active (or extend if already active)
        const currentSub = subResult.rows[0];
        const newEndDate = currentSub.status === 'active' 
          ? new Date(currentSub.current_period_end).getTime() + (30 * 24 * 60 * 60 * 1000)
          : Date.now() + (30 * 24 * 60 * 60 * 1000);

        const updateSubResult = await client.query(
          `UPDATE subscriptions 
           SET status = 'active', 
               current_period_end = to_timestamp($1 / 1000.0),
               updated_at = NOW()
           WHERE id = $2
           RETURNING *`,
          [newEndDate, currentSub.id]
        );
        subscriptionId = updateSubResult.rows[0].id;
      }

      // Get final subscription state
      const finalSub = await client.query(
        `SELECT * FROM subscriptions WHERE id = $1`,
        [subscriptionId]
      );

      // Record successful attempt
      await recordCodeValidationAttempt(
        clientId,
        'client',
        code,
        'success',
        ipAddress,
        userAgent
      );

      await client.query('COMMIT');

      return {
        success: true,
        subscription: finalSub.rows[0]
      };
    } catch (error: any) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Code redemption error:', error);
    return {
      success: false,
      error: error.message || 'Failed to redeem code. Please try again.'
    };
  }
}

/**
 * Get code status for display in chat
 */
export function getCodeStatus(codeRequest: any): {
  status: 'pending' | 'issued' | 'used' | 'expired' | 'expiring-soon';
  label: string;
  color: string;
  icon: string;
} {
  if (codeRequest.status === 'used') {
    return {
      status: 'used',
      label: `Redeemed ${new Date(codeRequest.redeemed_at).toLocaleDateString()}`,
      color: 'bg-green-100 text-green-800',
      icon: '✓'
    };
  }

  if (codeRequest.status === 'pending') {
    return {
      status: 'pending',
      label: 'Awaiting payment confirmation',
      color: 'bg-yellow-100 text-yellow-800',
      icon: '⏳'
    };
  }

  if (isCodeExpired(codeRequest.expiry_date)) {
    return {
      status: 'expired',
      label: 'Code expired',
      color: 'bg-red-100 text-red-800',
      icon: '✗'
    };
  }

  const hoursLeft = getHoursUntilExpiry(codeRequest.expiry_date);
  if (hoursLeft < 0.25) { // Less than 15 minutes
    return {
      status: 'expiring-soon',
      label: `Expires in ${Math.round(hoursLeft * 60)} minutes`,
      color: 'bg-red-100 text-red-800 animate-pulse',
      icon: '⚠'
    };
  }

  return {
    status: 'issued',
    label: `${formatExpiryTime(codeRequest.expiry_date)}`,
    color: 'bg-blue-100 text-blue-800',
    icon: '📋'
  };
}

/**
 * Delete expired codes and mark as expired in database
 * Should run as a background job
 */
export async function cleanupExpiredCodes(): Promise<{ cleaned: number; notified: number }> {
  try {
    // Find expired codes that haven't been marked as expired yet
    const expiredResult = await pool.query(
      `UPDATE code_requests 
       SET status = 'expired', is_redeemable = false
       WHERE status = 'issued' AND expiry_date < NOW()
       RETURNING id, client_id, seller_id, chat_id`
    );

    const cleaned = expiredResult.rows.length;
    let notified = 0;

    // Send notifications for each expired code
    for (const expiredCode of expiredResult.rows) {
      try {
        // Add system message to chat about expiration
        await pool.query(
          `INSERT INTO chat_messages (chat_id, sender_id, sender_type, message_content, message_type)
           VALUES ($1, $2, 'system', 'Code has expired. Seller must issue a new code.', 'system')`,
          [expiredCode.chat_id, expiredCode.seller_id]
        );
        notified++;
      } catch (error) {
        console.error('Error notifying about expired code:', error);
      }
    }

    console.log(`[Code Cleanup] Cleaned ${cleaned} expired codes, notified about ${notified}`);
    return { cleaned, notified };
  } catch (error: any) {
    console.error('Code cleanup error:', error);
    return { cleaned: 0, notified: 0 };
  }
}
