/**
 * Fraud Detection / Fake Order Risk Scoring System
 * 
 * Analyzes customer phone history and order patterns to calculate
 * a risk score (0-100) for potential fake orders.
 */

import { ensureConnection } from './database';

export interface RiskAssessment {
  score: number;           // 0-100 (higher = more risky)
  level: 'low' | 'medium' | 'high' | 'critical';
  flags: string[];         // Reasons for the score
  phoneHistory: {
    totalOrders: number;
    cancelledOrders: number;
    fakeOrders: number;
    noAnswerOrders: number;
    completedOrders: number;
    returnedOrders: number;
  };
  recommendation: string;
}

/**
 * Calculate risk score for a new order based on phone number history
 */
export async function assessOrderRisk(
  clientId: number,
  customerPhone: string,
  address?: string
): Promise<RiskAssessment> {
  const pool = await ensureConnection();
  const flags: string[] = [];
  let score = 0;

  // Normalize phone number
  const normalizedPhone = customerPhone.replace(/\D/g, '').slice(-10);
  
  // 1. Check phone history for this client
  const historyRes = await pool.query(`
    SELECT 
      status,
      COUNT(*) as count
    FROM store_orders
    WHERE client_id = $1 
      AND REPLACE(REPLACE(REPLACE(customer_phone, ' ', ''), '-', ''), '+', '') LIKE '%' || $2
    GROUP BY status
  `, [clientId, normalizedPhone]);

  const history = {
    totalOrders: 0,
    cancelledOrders: 0,
    fakeOrders: 0,
    noAnswerOrders: 0,
    completedOrders: 0,
    returnedOrders: 0,
    confirmedOrders: 0,
    deliveredOrders: 0,
  };

  for (const row of historyRes.rows) {
    const count = parseInt(row.count);
    history.totalOrders += count;
    
    switch (row.status) {
      case 'cancelled':
        history.cancelledOrders = count;
        break;
      case 'fake':
        history.fakeOrders = count;
        break;
      case 'no_answer_1':
      case 'no_answer_2':
      case 'no_answer_3':
        history.noAnswerOrders += count;
        break;
      case 'completed':
      case 'delivered':
        history.completedOrders += count;
        history.deliveredOrders += count;
        break;
      case 'returned':
        history.returnedOrders = count;
        break;
      case 'confirmed':
        history.confirmedOrders = count;
        break;
    }
  }

  // 2. Calculate risk based on history
  
  // Previous fake orders - CRITICAL
  if (history.fakeOrders > 0) {
    score += 50 + (history.fakeOrders * 10); // 50+ for any fake, +10 per additional
    flags.push(`⚠️ ${history.fakeOrders} طلب/طلبات وهمية سابقة من هذا الرقم`);
  }

  // High return rate
  if (history.returnedOrders > 0 && history.totalOrders > 0) {
    const returnRate = history.returnedOrders / history.totalOrders;
    if (returnRate > 0.5) {
      score += 30;
      flags.push(`🔄 معدل إرجاع مرتفع: ${Math.round(returnRate * 100)}%`);
    } else if (returnRate > 0.3) {
      score += 15;
      flags.push(`🔄 معدل إرجاع متوسط: ${Math.round(returnRate * 100)}%`);
    }
  }

  // High cancel rate
  if (history.cancelledOrders > 0 && history.totalOrders > 0) {
    const cancelRate = history.cancelledOrders / history.totalOrders;
    if (cancelRate > 0.5) {
      score += 25;
      flags.push(`❌ معدل إلغاء مرتفع: ${Math.round(cancelRate * 100)}%`);
    } else if (cancelRate > 0.3) {
      score += 10;
      flags.push(`❌ معدل إلغاء متوسط: ${Math.round(cancelRate * 100)}%`);
    }
  }

  // No answer pattern
  if (history.noAnswerOrders >= 3) {
    score += 20;
    flags.push(`📵 ${history.noAnswerOrders} طلبات بدون رد على المكالمات`);
  } else if (history.noAnswerOrders >= 2) {
    score += 10;
    flags.push(`📵 ${history.noAnswerOrders} طلبات بدون رد`);
  }

  // 3. Check for velocity (multiple orders in short time)
  const velocityRes = await pool.query(`
    SELECT COUNT(*) as recent_orders
    FROM store_orders
    WHERE client_id = $1 
      AND REPLACE(REPLACE(REPLACE(customer_phone, ' ', ''), '-', ''), '+', '') LIKE '%' || $2
      AND created_at > NOW() - INTERVAL '24 hours'
  `, [clientId, normalizedPhone]);

  const recentOrders = parseInt(velocityRes.rows[0]?.recent_orders || '0');
  if (recentOrders >= 5) {
    score += 25;
    flags.push(`🚨 ${recentOrders} طلبات في آخر 24 ساعة - مشبوه`);
  } else if (recentOrders >= 3) {
    score += 10;
    flags.push(`⚡ ${recentOrders} طلبات في آخر 24 ساعة`);
  }

  // 4. Check address quality
  if (address) {
    const trimmedAddress = address.trim();
    if (trimmedAddress.length < 10) {
      score += 15;
      flags.push('📍 عنوان قصير جداً أو غير مكتمل');
    } else if (trimmedAddress.length < 20) {
      score += 5;
      flags.push('📍 عنوان قصير');
    }
    
    // Check for suspicious addresses (just dots, numbers, etc)
    if (/^[\d\s\.\-]+$/.test(trimmedAddress)) {
      score += 20;
      flags.push('📍 عنوان مشبوه (أرقام فقط)');
    }
  }

  // 5. Check if phone is in global blacklist for this client
  const blacklistRes = await pool.query(`
    SELECT 1 FROM customer_blacklist 
    WHERE client_id = $1 AND phone LIKE '%' || $2
    LIMIT 1
  `, [clientId, normalizedPhone]);

  if (blacklistRes.rows.length > 0) {
    score += 60;
    flags.push('🚫 الرقم في القائمة السوداء');
  }

  // 6. Positive signals (reduce score)
  if (history.completedOrders > 0) {
    const successRate = history.completedOrders / history.totalOrders;
    if (successRate > 0.7) {
      score -= 20;
      flags.push(`✅ عميل موثوق: ${history.completedOrders} طلبات ناجحة`);
    } else if (history.completedOrders >= 2) {
      score -= 10;
      flags.push(`✅ ${history.completedOrders} طلبات ناجحة سابقة`);
    }
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));

  // Determine risk level
  let level: RiskAssessment['level'];
  let recommendation: string;

  if (score >= 70) {
    level = 'critical';
    recommendation = '🚨 خطر عالي جداً - يُنصح برفض الطلب أو طلب دفع مسبق';
  } else if (score >= 50) {
    level = 'high';
    recommendation = '⚠️ خطر عالي - تحقق من العميل قبل التأكيد';
  } else if (score >= 25) {
    level = 'medium';
    recommendation = '⚡ خطر متوسط - تأكد من صحة المعلومات';
  } else {
    level = 'low';
    recommendation = '✅ خطر منخفض - يمكن المتابعة بشكل طبيعي';
  }

  // New customer with no history
  if (history.totalOrders === 0) {
    flags.push('🆕 عميل جديد - لا يوجد سجل سابق');
  }

  return {
    score,
    level,
    flags,
    phoneHistory: history,
    recommendation
  };
}

/**
 * Get all high-risk orders for a client
 */
export async function getHighRiskOrders(clientId: number, limit = 50): Promise<any[]> {
  const pool = await ensureConnection();
  
  // Find orders from phones with bad history
  const result = await pool.query(`
    WITH phone_stats AS (
      SELECT 
        customer_phone,
        COUNT(*) FILTER (WHERE status = 'fake') as fake_count,
        COUNT(*) FILTER (WHERE status IN ('cancelled', 'returned')) as bad_count,
        COUNT(*) FILTER (WHERE status IN ('completed', 'delivered')) as good_count,
        COUNT(*) as total_count
      FROM store_orders
      WHERE client_id = $1
      GROUP BY customer_phone
      HAVING COUNT(*) FILTER (WHERE status = 'fake') > 0 
         OR COUNT(*) FILTER (WHERE status IN ('cancelled', 'returned')) > COUNT(*) FILTER (WHERE status IN ('completed', 'delivered'))
    )
    SELECT o.*, 
           ps.fake_count,
           ps.bad_count,
           ps.good_count,
           ps.total_count
    FROM store_orders o
    JOIN phone_stats ps ON o.customer_phone = ps.customer_phone
    WHERE o.client_id = $1
      AND o.status = 'pending'
    ORDER BY ps.fake_count DESC, ps.bad_count DESC
    LIMIT $2
  `, [clientId, limit]);

  return result.rows;
}

/**
 * Auto-flag suspicious orders (can be called periodically)
 */
export async function flagSuspiciousOrders(clientId: number): Promise<number> {
  const pool = await ensureConnection();
  
  // Get pending orders
  const pendingRes = await pool.query(`
    SELECT id, customer_phone, address
    FROM store_orders
    WHERE client_id = $1 AND status = 'pending'
    ORDER BY created_at DESC
    LIMIT 100
  `, [clientId]);

  let flaggedCount = 0;

  for (const order of pendingRes.rows) {
    const risk = await assessOrderRisk(clientId, order.customer_phone, order.address);
    
    if (risk.level === 'critical' || risk.level === 'high') {
      // Add a note to the order
      await pool.query(`
        UPDATE store_orders 
        SET notes = COALESCE(notes, '') || E'\n\n🚨 تحذير تلقائي: ' || $1
        WHERE id = $2
      `, [risk.recommendation + '\n' + risk.flags.join('\n'), order.id]);
      
      flaggedCount++;
    }
  }

  return flaggedCount;
}
