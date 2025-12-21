import { RequestHandler } from "express";
import { pool } from "../utils/database";

/**
 * Middleware to enforce subscription status
 * Returns 403 if subscription is expired or not active
 * Allows access only if:
 * - Trial is still active (before trial_ends_at)
 * - Paid subscription is active (before period_end)
 */
export const requireActiveSubscription: RequestHandler = async (req, res, next) => {
  try {
    const user = req.user as any;
    const userId = user?.id;
    
    // Admin users bypass subscription check
    if (user?.user_type === 'admin') {
      return next();
    }

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Get subscription from database
    const result = await pool.query(
      `SELECT * FROM subscriptions WHERE user_id = $1`,
      [userId]
    );

    // No subscription found - this shouldn't happen, but allow with warning
    if (result.rows.length === 0) {
      return res.status(402).json({
        error: "No subscription found. Please create a store to start your free trial.",
        paymentRequired: true,
        code: "NO_SUBSCRIPTION"
      });
    }

    const subscription = result.rows[0];
    const now = new Date();

    // Check if trial is still active
    if (subscription.status === 'trial') {
      const trialEnd = new Date(subscription.trial_ends_at);
      if (now < trialEnd) {
        // Trial still active, allow access
        return next();
      }
      // Trial expired, move to expired status
      await pool.query(
        `UPDATE subscriptions SET status = 'expired' WHERE id = $1`,
        [subscription.id]
      );
      // Fall through to lock account
    }

    // Check if paid subscription is active
    if (subscription.status === 'active' && subscription.period_end) {
      const periodEnd = new Date(subscription.period_end);
      if (now < periodEnd) {
        // Paid subscription still active, allow access
        return next();
      }
      // Subscription expired, move to expired status
      await pool.query(
        `UPDATE subscriptions SET status = 'expired' WHERE id = $1`,
        [subscription.id]
      );
      // Fall through to lock account
    }

    // Subscription expired or not active - LOCK ACCOUNT
    const trialEnded = subscription.trial_ends_at ? new Date(subscription.trial_ends_at).toISOString() : null;
    
    return res.status(403).json({
      error: "Subscription expired. Your store access is temporarily disabled.",
      accountLocked: true,
      status: subscription.status,
      trialEndedAt: trialEnded,
      paymentRequired: true,
      paymentLink: "https://redotpay.com/checkout/session_placeholder",
      renewalUrl: "/api/billing/renew",
      message: "Pay $7/month to unlock your store and continue managing your business.",
      code: "SUBSCRIPTION_EXPIRED"
    });

  } catch (error) {
    console.error('Subscription check middleware error:', error);
    res.status(500).json({ 
      error: "Server error checking subscription",
      code: "SUBSCRIPTION_CHECK_ERROR"
    });
  }
};

export default requireActiveSubscription;
