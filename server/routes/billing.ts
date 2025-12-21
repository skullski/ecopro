import { RequestHandler } from "express";
import { pool } from "../utils/database";
import { jsonError } from "../utils/httpHelpers";
import { createCheckoutSession, handlePaymentCompleted, handlePaymentFailed, verifyWebhookSignature } from "../utils/redotpay";

/**
 * Get subscription status for current user
 * GET /api/billing/subscription
 */
export const getSubscription: RequestHandler = async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) return jsonError(res, 401, "Not authenticated");

    const result = await pool.query(
      `SELECT * FROM subscriptions WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      // Create new subscription if doesn't exist
      const newSub = await pool.query(
        `INSERT INTO subscriptions (user_id, trial_started_at, trial_ends_at)
         VALUES ($1, NOW(), NOW() + INTERVAL '30 days')
         RETURNING *`,
        [userId]
      );
      return res.json(newSub.rows[0]);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error getting subscription:", error);
    return jsonError(res, 500, "Failed to get subscription");
  }
};

/**
 * Check if store owner has access (not expired)
 * GET /api/billing/check-access
 */
export const checkAccess: RequestHandler = async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) return jsonError(res, 401, "Not authenticated");

    const result = await pool.query(
      `SELECT * FROM subscriptions WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      // New user - create subscription with 30-day trial
      await pool.query(
        `INSERT INTO subscriptions (user_id, status, trial_started_at, trial_ends_at)
         VALUES ($1, 'trial', NOW(), NOW() + INTERVAL '30 days')`,
        [userId]
      );
      return res.json({ hasAccess: true, status: "trial", message: "Free trial active" });
    }

    const subscription = result.rows[0];
    const now = new Date();
    const trialEnds = new Date(subscription.trial_ends_at);

    // Trial still active
    if (subscription.status === "trial" && now < trialEnds) {
      return res.json({ 
        hasAccess: true, 
        status: "trial", 
        daysLeft: Math.ceil((trialEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        message: "Free trial active" 
      });
    }

    // Trial expired - check if paid
    if (subscription.status === "active") {
      return res.json({ hasAccess: true, status: "active", message: "Subscription active" });
    }

    // Expired/suspended
    return res.json({ 
      hasAccess: false, 
      status: subscription.status,
      message: `Subscription ${subscription.status}. Please pay $7/month to continue.`
    });
  } catch (error) {
    console.error("Error checking access:", error);
    return jsonError(res, 500, "Failed to check access");
  }
};

/**
 * Get all subscriptions (admin only)
 * GET /api/billing/admin/subscriptions
 */
export const getAllSubscriptions: RequestHandler = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        s.id, s.user_id, u.email, u.name,
        s.tier, s.status, s.trial_started_at, s.trial_ends_at,
        s.current_period_start, s.current_period_end, s.created_at
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      WHERE u.user_type = 'client'
      ORDER BY s.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error getting subscriptions:", error);
    return jsonError(res, 500, "Failed to get subscriptions");
  }
};

/**
 * Get billing metrics (admin only)
 * GET /api/billing/admin/metrics
 */
export const getBillingMetrics: RequestHandler = async (req, res) => {
  try {
    // Total revenue (paid subscriptions)
    const revenueResult = await pool.query(
      `SELECT SUM(amount) as total_revenue FROM payments 
       WHERE status = 'completed' AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())`
    );

    // Active subscriptions
    const activeResult = await pool.query(
      `SELECT COUNT(*) as count FROM subscriptions WHERE status = 'active'`
    );

    // Unpaid/Expired subscriptions
    const unpaidResult = await pool.query(
      `SELECT COUNT(*) as count FROM subscriptions WHERE status IN ('expired', 'cancelled')`
    );

    // New signups this month
    const newSignupsResult = await pool.query(
      `SELECT COUNT(*) as count FROM subscriptions 
       WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())`
    );

    // Trial active
    const trialResult = await pool.query(
      `SELECT COUNT(*) as count FROM subscriptions WHERE status = 'trial'`
    );

    // Payment failures
    const failuresResult = await pool.query(
      `SELECT COUNT(*) as count FROM payments WHERE status = 'failed'`
    );

    res.json({
      totalRevenue: parseFloat(revenueResult.rows[0].total_revenue) || 0,
      activeSubscriptions: parseInt(activeResult.rows[0].count),
      unpaidExpired: parseInt(unpaidResult.rows[0].count),
      trialActive: parseInt(trialResult.rows[0].count),
      newSignupsThisMonth: parseInt(newSignupsResult.rows[0].count),
      paymentFailures: parseInt(failuresResult.rows[0].count)
    });
  } catch (error) {
    console.error("Error getting billing metrics:", error);
    return jsonError(res, 500, "Failed to get billing metrics");
  }
};

/**
 * Get platform settings (admin only)
 * GET /api/billing/admin/settings
 */
export const getPlatformSettings: RequestHandler = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT setting_key, setting_value, data_type FROM platform_settings`
    );

    const settings = result.rows.reduce((acc: any, row: any) => {
      acc[row.setting_key] = row.data_type === 'number' ? parseInt(row.setting_value) : row.setting_value;
      return acc;
    }, {});

    res.json(settings);
  } catch (error) {
    console.error("Error getting settings:", error);
    return jsonError(res, 500, "Failed to get settings");
  }
};

/**
 * Update platform settings (admin only)
 * POST /api/billing/admin/settings
 */
export const updatePlatformSettings: RequestHandler = async (req, res) => {
  try {
    const { settings } = req.body;
    const adminId = (req.user as any)?.id;

    if (!settings || typeof settings !== 'object') {
      return jsonError(res, 400, "Invalid settings object");
    }

    for (const [key, value] of Object.entries(settings)) {
      await pool.query(
        `UPDATE platform_settings SET setting_value = $1, updated_by = $2, updated_at = NOW()
         WHERE setting_key = $3`,
        [String(value), adminId, key]
      );
    }

    res.json({ message: "Settings updated successfully" });
  } catch (error) {
    console.error("Error updating settings:", error);
    return jsonError(res, 500, "Failed to update settings");
  }
};

/**
 * Get store details for admin (subscription + owner info)
 * GET /api/billing/admin/stores
 */
export const getStoresWithSubscription: RequestHandler = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        u.id, u.email, u.name,
        s.tier, s.status, s.trial_started_at, s.trial_ends_at,
        s.current_period_start, s.current_period_end,
        s.created_at as subscription_created,
        u.created_at as user_created
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      WHERE u.user_type = 'client'
      ORDER BY s.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error getting stores:", error);
    return jsonError(res, 500, "Failed to get stores");
  }
};

/**
 * Create a RedotPay checkout session for subscription renewal
 * POST /api/billing/checkout
 * Body: {} (uses authenticated user)
 */
export const createCheckout: RequestHandler = async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    const user = (req.user as any);
    
    if (!userId) {
      return jsonError(res, 401, "Not authenticated");
    }

    // Get user email for checkout
    const userResult = await pool.query(
      `SELECT email FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return jsonError(res, 404, "User not found");
    }

    const userEmail = userResult.rows[0].email;

    // Get or create subscription
    let subResult = await pool.query(
      `SELECT id FROM subscriptions WHERE user_id = $1`,
      [userId]
    );

    let subscriptionId: number;

    if (subResult.rows.length === 0) {
      // Create new subscription
      const newSub = await pool.query(
        `INSERT INTO subscriptions (user_id, status, trial_started_at, trial_ends_at)
         VALUES ($1, $2, NOW(), NOW() + INTERVAL '30 days')
         RETURNING id`,
        [userId, 'trial']
      );
      subscriptionId = newSub.rows[0].id;
    } else {
      subscriptionId = subResult.rows[0].id;
    }

    // Create checkout session with RedotPay
    const checkoutSession = await createCheckoutSession({
      userId,
      userEmail,
      subscriptionId,
      description: 'EcoPro monthly subscription - $7/month',
      metadata: {
        user_id: userId,
        subscription_id: subscriptionId,
        type: 'subscription_renewal',
        email: userEmail,
      },
    });

    console.log('[Billing] Checkout session created:', {
      userId,
      sessionToken: checkoutSession.sessionToken,
      checkoutUrl: checkoutSession.checkoutUrl,
    });

    res.json({
      message: 'Checkout session created successfully',
      sessionToken: checkoutSession.sessionToken,
      checkoutUrl: checkoutSession.checkoutUrl,
      expiresAt: checkoutSession.expiresAt,
      amount: 7.00,
      currency: 'DZD',
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return jsonError(res, 500, `Failed to create checkout session: ${(error as any).message}`);
  }
};

/**
 * Handle RedotPay webhook callback
 * POST /api/billing/webhook/redotpay
 * Headers: X-RedotPay-Signature
 * Body: RedotPay webhook payload
 */
export const handleRedotPayWebhook: RequestHandler = async (req, res) => {
  try {
    const signature = req.headers['x-redotpay-signature'] as string;
    
    if (!signature) {
      console.warn('[RedotPay Webhook] Missing signature header');
      return jsonError(res, 401, 'Missing signature');
    }

    // Get raw body for signature verification
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);

    // Verify webhook signature
    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn('[RedotPay Webhook] Invalid signature');
      return jsonError(res, 401, 'Invalid signature');
    }

    const payload = req.body;

    console.log('[RedotPay Webhook] Received event:', {
      event: payload.event,
      transactionId: payload.data?.transaction_id,
      status: payload.data?.status,
    });

    // Handle different webhook events
    switch (payload.event) {
      case 'payment.completed':
        await handlePaymentCompleted(payload);
        break;
      case 'payment.failed':
        await handlePaymentFailed(payload);
        break;
      case 'payment.cancelled':
        console.log('[RedotPay Webhook] Payment cancelled:', payload.data?.transaction_id);
        break;
      default:
        console.log('[RedotPay Webhook] Unhandled event:', payload.event);
    }

    // Always return 200 OK to acknowledge receipt
    res.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('[RedotPay Webhook] Error processing webhook:', error);
    // Still return 200 to prevent RedotPay from retrying
    res.json({ message: 'Webhook processed', error: (error as any).message });
  }
};

/**
 * Get payment history for current user
 * GET /api/billing/payments
 */
export const getPaymentHistory: RequestHandler = async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      return jsonError(res, 401, "Not authenticated");
    }

    const result = await pool.query(
      `SELECT 
        p.id,
        p.amount,
        p.currency,
        p.status,
        p.transaction_id,
        p.payment_method,
        p.paid_at,
        p.created_at,
        p.error_message,
        s.status as subscription_status
       FROM payments p
       LEFT JOIN subscriptions s ON p.subscription_id = s.id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC
       LIMIT 50`,
      [userId]
    );

    res.json({
      payments: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    console.error('Error getting payment history:', error);
    return jsonError(res, 500, 'Failed to get payment history');
  }
};

/**
 * ADMIN: Get all payment failures across platform
 * GET /api/billing/admin/payment-failures
 */
export const getPaymentFailures: RequestHandler = async (req, res) => {
  try {
    const user = req.user as any;
    if (user?.user_type !== 'admin') {
      return jsonError(res, 403, 'Admin access required');
    }

    const result = await pool.query(
      `SELECT 
        p.id,
        p.transaction_id,
        p.user_id,
        p.amount,
        p.currency,
        p.status,
        p.error_message as failure_reason,
        p.created_at,
        p.updated_at,
        u.email as store_owner_email,
        s.store_name,
        s.store_slug
       FROM payments p
       LEFT JOIN users u ON p.user_id = u.id
       LEFT JOIN clients s ON u.id = s.user_id
       WHERE p.status IN ('failed', 'pending_retry')
       ORDER BY p.updated_at DESC`,
      []
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error getting payment failures:', error);
    return jsonError(res, 500, 'Failed to get payment failures');
  }
};

/**
 * ADMIN: Retry a failed payment
 * POST /api/billing/admin/retry-payment
 */
export const retryPayment: RequestHandler = async (req, res) => {
  try {
    const user = req.user as any;
    if (user?.user_type !== 'admin') {
      return jsonError(res, 403, 'Admin access required');
    }

    const { transactionId } = req.body;
    if (!transactionId) {
      return jsonError(res, 400, 'Transaction ID is required');
    }

    // Get the payment details
    const paymentResult = await pool.query(
      `SELECT * FROM payments WHERE transaction_id = $1`,
      [transactionId]
    );

    if (paymentResult.rows.length === 0) {
      return jsonError(res, 404, 'Payment not found');
    }

    const payment = paymentResult.rows[0];

    // Update status to pending_retry
    await pool.query(
      `UPDATE payments 
       SET status = 'pending_retry', updated_at = NOW()
       WHERE transaction_id = $1`,
      [transactionId]
    );

    res.json({
      message: 'Payment retry initiated',
      transactionId,
      status: 'pending_retry',
    });
  } catch (error) {
    console.error('Error retrying payment:', error);
    return jsonError(res, 500, 'Failed to retry payment');
  }
};

/**
 * ADMIN: Get payment metrics (for dashboard)
 * GET /api/billing/admin/metrics
 */
export const getPaymentMetrics: RequestHandler = async (req, res) => {
  try {
    const user = req.user as any;
    if (user?.user_type !== 'admin') {
      return jsonError(res, 403, 'Admin access required');
    }

    // Get MRR (Monthly Recurring Revenue)
    const mrrResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as mrr
       FROM payments
       WHERE status = 'completed' 
       AND created_at >= NOW() - INTERVAL '30 days'`
    );

    // Get subscription counts
    const subscriptionResult = await pool.query(
      `SELECT 
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscriptions,
        COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_count,
        COUNT(CASE WHEN status = 'trial' THEN 1 END) as trial_count
       FROM subscriptions`
    );

    // Get failed payments count
    const failedPaymentsResult = await pool.query(
      `SELECT COUNT(*) as count FROM payments WHERE status = 'failed'`
    );

    // Get churn rate (cancelled subscriptions this month)
    const churnResult = await pool.query(
      `SELECT COUNT(*) as churn_count FROM subscriptions 
       WHERE status = 'cancelled' 
       AND updated_at >= NOW() - INTERVAL '30 days'`
    );

    // Get new signups this month
    const signupsResult = await pool.query(
      `SELECT COUNT(*) as new_signups FROM users
       WHERE created_at >= NOW() - INTERVAL '30 days'
       AND user_type != 'admin'`
    );

    const metrics = {
      mrr: parseFloat(mrrResult.rows[0]?.mrr || 0),
      active_subscriptions: parseInt(subscriptionResult.rows[0]?.active_subscriptions || 0),
      expired_count: parseInt(subscriptionResult.rows[0]?.expired_count || 0),
      trial_count: parseInt(subscriptionResult.rows[0]?.trial_count || 0),
      failed_payments: parseInt(failedPaymentsResult.rows[0]?.count || 0),
      churn_rate: (parseInt(churnResult.rows[0]?.churn_count || 0) / Math.max(parseInt(subscriptionResult.rows[0]?.active_subscriptions || 1), 1) * 100).toFixed(1),
      new_signups: parseInt(signupsResult.rows[0]?.new_signups || 0),
    };

    res.json(metrics);
  } catch (error) {
    console.error('Error getting payment metrics:', error);
    return jsonError(res, 500, 'Failed to get payment metrics');
  }
};
