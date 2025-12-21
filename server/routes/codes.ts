/**
 * Subscription Codes Routes
 * Handles code generation, validation, and redemption
 */

import { Router, Request, Response, RequestHandler } from 'express';
import { pool } from '../utils/database';
import { jsonError } from '../utils/httpHelpers';
import {
  generateSubscriptionCode,
  validateSubscriptionCode,
  redeemSubscriptionCode,
  checkCodeValidationRateLimit,
  recordCodeValidationAttempt,
  getCodeStatus,
  cleanupExpiredCodes
} from '../utils/code-utils';

const router = Router();

/**
 * POST /api/codes/validate
 * Validate a subscription code without redeeming it
 * Used for UI feedback before redemption
 */
export const validateCode: RequestHandler = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code || typeof code !== 'string') {
      return jsonError(res, 400, 'Code is required');
    }

    const validation = await validateSubscriptionCode(code.trim().toUpperCase());

    res.json({
      valid: validation.valid,
      error: validation.error,
      codeStatus: validation.codeRequest ? getCodeStatus(validation.codeRequest) : null
    });
  } catch (error: any) {
    return jsonError(res, 500, 'Validation failed');
  }
};

/**
 * POST /api/codes/redeem
 * Redeem a subscription code
 * REQUIRES: Authentication (client), valid code, active subscription (seller)
 */
export const redeemCode: RequestHandler = async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    const clientId = (req.user as any)?.clientId;

    if (!clientId) {
      return jsonError(res, 401, 'Only clients can redeem codes');
    }

    const { code } = req.body;

    if (!code || typeof code !== 'string') {
      return jsonError(res, 400, 'Code is required');
    }

    // Check rate limit
    const ipAddress = req.ip;
    const userAgent = req.get('user-agent');
    const rateLimit = await checkCodeValidationRateLimit(clientId, 'client', ipAddress);

    if (!rateLimit.allowed) {
      return res.status(429).json({
        error: `Too many attempts. Please try again in ${rateLimit.resetIn} seconds`,
        attemptsRemaining: rateLimit.attemptsRemaining,
        resetIn: rateLimit.resetIn
      });
    }

    // Redeem code
    const redemption = await redeemSubscriptionCode(
      code.trim().toUpperCase(),
      clientId,
      userAgent,
      ipAddress
    );

    if (!redemption.success) {
      return res.status(400).json({
        success: false,
        error: redemption.error,
        attemptsRemaining: rateLimit.attemptsRemaining - 1
      });
    }

    res.json({
      success: true,
      message: 'Code redeemed successfully! Your subscription has been activated.',
      subscription: redemption.subscription
    });
  } catch (error: any) {
    console.error('Code redemption error:', error);
    return jsonError(res, 500, 'Redemption failed');
  }
};

/**
 * POST /api/codes/request
 * Client requests a subscription code (in chat context)
 * REQUIRES: Authentication (client), chat_id
 */
export const requestCode: RequestHandler = async (req, res) => {
  try {
    const clientId = (req.user as any)?.clientId;

    if (!clientId) {
      return jsonError(res, 401, 'Only clients can request codes');
    }

    const { chat_id, code_type, message } = req.body;

    if (!chat_id) {
      return jsonError(res, 400, 'Chat ID is required');
    }

    // Verify client owns this chat
    const chatCheck = await pool.query(
      'SELECT * FROM chats WHERE id = $1 AND client_id = $2',
      [chat_id, clientId]
    );

    if (chatCheck.rows.length === 0) {
      return jsonError(res, 403, 'You do not have access to this chat');
    }

    const chat = chatCheck.rows[0];

    // Create code request
    const result = await pool.query(
      `INSERT INTO code_requests (chat_id, client_id, seller_id, requested_code_type, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
      [chat_id, clientId, chat.seller_id, code_type || 'subscription']
    );

    const codeRequest = result.rows[0];

    // Send system message to chat
    await pool.query(
      `INSERT INTO chat_messages (chat_id, sender_id, sender_type, message_content, message_type, metadata)
       VALUES ($1, $2, 'system', $3, 'code_request', $4)`,
      [
        chat_id,
        clientId,
        message || 'Client requested a subscription code',
        JSON.stringify({ code_request_id: codeRequest.id, code_type: code_type || 'subscription' })
      ]
    );

    res.json({ code_request: codeRequest });
  } catch (error: any) {
    console.error('Code request error:', error);
    return jsonError(res, 500, 'Failed to request code');
  }
};

/**
 * POST /api/codes/issue
 * Seller issues a code to a client
 * REQUIRES: Authentication (seller), code_request_id, payment_method
 */
export const issueCode: RequestHandler = async (req, res) => {
  try {
    const sellerId = (req.user as any)?.sellerId;

    if (!sellerId) {
      return jsonError(res, 401, 'Only sellers can issue codes');
    }

    const { code_request_id, payment_method, notes } = req.body;

    if (!code_request_id || !payment_method) {
      return jsonError(res, 400, 'Code request ID and payment method are required');
    }

    // Verify code request belongs to this seller
    const codeReqCheck = await pool.query(
      'SELECT * FROM code_requests WHERE id = $1 AND seller_id = $2',
      [code_request_id, sellerId]
    );

    if (codeReqCheck.rows.length === 0) {
      return jsonError(res, 403, 'Code request not found or does not belong to you');
    }

    const codeRequest = codeReqCheck.rows[0];

    if (codeRequest.status !== 'pending') {
      return jsonError(res, 400, `Code request has already been ${codeRequest.status}`);
    }

    // Generate unique code
    let code = generateSubscriptionCode();
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const checkDuplicate = await pool.query(
        'SELECT id FROM code_requests WHERE generated_code = $1',
        [code]
      );
      if (checkDuplicate.rows.length === 0) {
        isUnique = true;
      } else {
        code = generateSubscriptionCode();
        attempts++;
      }
    }

    if (!isUnique) {
      return jsonError(res, 500, 'Failed to generate unique code');
    }

    // Update code request
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1); // 1 hour expiry

    const updateResult = await pool.query(
      `UPDATE code_requests 
       SET generated_code = $1, 
           expiry_date = $2, 
           status = 'issued',
           payment_method = $3,
           payment_confirmed_at = NOW(),
           seller_notes = $4,
           issued_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [code, expiryDate, payment_method, notes || null, code_request_id]
    );

    const updatedCode = updateResult.rows[0];

    // Send code to client via chat
    await pool.query(
      `INSERT INTO chat_messages (chat_id, sender_id, sender_type, message_content, message_type, metadata)
       VALUES ($1, $2, 'seller', $3, 'code_response', $4)`,
      [
        codeRequest.chat_id,
        sellerId,
        `Your subscription code is: ${code}\n\nCode expires in: 1 hour\n\nPayment method: ${payment_method}`,
        JSON.stringify({
          code,
          expiry_date: expiryDate,
          payment_method,
          code_request_id
        })
      ]
    );

    // Update seller statistics
    await pool.query(
      `UPDATE code_statistics 
       SET total_codes_generated = total_codes_generated + 1,
           last_code_issued_at = NOW(),
           payment_methods_used = 
             CASE 
               WHEN payment_methods_used IS NULL THEN jsonb_build_object($2, 1)
               ELSE jsonb_set(
                 payment_methods_used, 
                 ARRAY[$2], 
                 (COALESCE(payment_methods_used->>$2, '0')::int + 1)::text::jsonb
               )
             END
       WHERE seller_id = $1`,
      [sellerId, payment_method]
    );

    res.json({
      success: true,
      code: updatedCode,
      message: `Code issued and sent to client. Expires in 1 hour.`
    });
  } catch (error: any) {
    console.error('Code issuance error:', error);
    return jsonError(res, 500, 'Failed to issue code');
  }
};

/**
 * GET /api/codes/my-codes
 * Get all codes for current seller or client
 * Seller sees: all codes they issued
 * Client sees: all codes requested/redeemed
 */
export const getMyCodes: RequestHandler = async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    const clientId = (req.user as any)?.clientId;
    const sellerId = (req.user as any)?.sellerId;

    if (clientId) {
      // Client - show codes they requested
      const result = await pool.query(
        `SELECT cr.*, c.id as chat_id, c.seller_id
         FROM code_requests cr
         JOIN chats c ON cr.chat_id = c.id
         WHERE cr.client_id = $1
         ORDER BY cr.created_at DESC
         LIMIT 100`,
        [clientId]
      );

      return res.json({
        codes: result.rows,
        type: 'client',
        total: result.rows.length
      });
    }

    if (sellerId) {
      // Seller - show codes they issued
      const result = await pool.query(
        `SELECT cr.*, c.client_id, cl.email as client_email, cl.name as client_name
         FROM code_requests cr
         JOIN chats c ON cr.chat_id = c.id
         JOIN clients cl ON c.client_id = cl.id
         WHERE cr.seller_id = $1
         ORDER BY cr.created_at DESC
         LIMIT 100`,
        [sellerId]
      );

      return res.json({
        codes: result.rows,
        type: 'seller',
        total: result.rows.length
      });
    }

    return jsonError(res, 401, 'Unauthorized');
  } catch (error: any) {
    console.error('Get codes error:', error);
    return jsonError(res, 500, 'Failed to fetch codes');
  }
};

/**
 * GET /api/codes/stats
 * Get code statistics (seller only)
 */
export const getCodeStats: RequestHandler = async (req, res) => {
  try {
    const sellerId = (req.user as any)?.sellerId;

    if (!sellerId) {
      return jsonError(res, 401, 'Only sellers can view code statistics');
    }

    const result = await pool.query(
      'SELECT * FROM code_statistics WHERE seller_id = $1',
      [sellerId]
    );

    if (result.rows.length === 0) {
      // Create default stats
      const newStats = await pool.query(
        `INSERT INTO code_statistics (seller_id)
         VALUES ($1)
         RETURNING *`,
        [sellerId]
      );

      return res.json(newStats.rows[0]);
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    return jsonError(res, 500, 'Failed to fetch statistics');
  }
};

/**
 * POST /api/codes/cleanup
 * Admin endpoint to cleanup expired codes (background job)
 */
export const cleanupCodes: RequestHandler = async (req, res) => {
  try {
    // Only allow if admin or internal call
    const isAdmin = (req.user as any)?.role === 'admin';
    const apiKey = req.get('x-api-key');
    const internalKey = process.env.INTERNAL_API_KEY;

    if (!isAdmin && apiKey !== internalKey) {
      return jsonError(res, 401, 'Unauthorized');
    }

    const result = await cleanupExpiredCodes();

    res.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    return jsonError(res, 500, 'Cleanup failed');
  }
};

export default router;
