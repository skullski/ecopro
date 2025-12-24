/**
 * IP Intelligence Routes
 * 
 * API endpoints for:
 * - Looking up IP intelligence
 * - Receiving client-side fingerprints
 * - Checking current visitor status
 */

import { Router, RequestHandler } from 'express';
import { getIPIntelligence, isIPSuspicious, saveClientFingerprint, logSecurityDecision, IPIntelligence } from '../services/ip-intelligence';
import { getClientIp, computeFingerprint, parseCookie, getGeo } from '../utils/security';
import { ensureConnection } from '../utils/database';

const router = Router();

/**
 * GET /api/intel/me
 * Get intelligence about the current visitor's IP
 * Public endpoint - used by client-side probes
 */
router.get('/me', async (req, res) => {
  try {
    const ip = getClientIp(req);
    
    if (!ip) {
      return res.json({
        ip: null,
        error: 'Could not determine IP',
      });
    }
    
    const intel = await getIPIntelligence(ip);
    const geo = getGeo(req, ip);
    
    // Don't expose full intelligence to client - only safe fields
    res.json({
      ip,
      country_code: intel.country_code,
      country_name: intel.country_name,
      region: intel.region,
      city: intel.city,
      timezone: intel.timezone,
      isp: intel.isp,
      org: intel.org,
      is_mobile: intel.is_mobile,
      // Risk indicators (limited exposure)
      risk_level: intel.risk_level,
      from_cache: intel.from_cache,
    });
  } catch (err) {
    console.error('[intel] /me error:', err);
    res.status(500).json({ error: 'Intelligence lookup failed' });
  }
});

/**
 * POST /api/intel/fingerprint
 * Receive client-side fingerprint data
 * Public endpoint - called by client probes
 */
router.post('/fingerprint', async (req, res) => {
  try {
    const ip = getClientIp(req);
    const ua = req.headers['user-agent'] || null;
    const fpCookie = parseCookie(req, 'ecopro_fp');
    const serverFingerprint = computeFingerprint({ ip, userAgent: ua, cookie: fpCookie });
    
    const {
      visitor_id,
      request_id,
      platform,
      screen_resolution,
      timezone,
      language,
      color_depth,
      hardware_concurrency,
      device_memory,
      touch_support,
      canvas_hash,
      webgl_hash,
      webgl_vendor,
      webgl_renderer,
      audio_hash,
      fonts_hash,
      webrtc_local_ip,
      webrtc_public_ip,
      confidence_score,
      bot_probability,
      incognito_detected,
    } = req.body || {};
    
    if (!visitor_id) {
      return res.status(400).json({ error: 'visitor_id is required' });
    }
    
    // Detect WebRTC leak
    const webrtc_leak_detected = Boolean(
      webrtc_local_ip || 
      (webrtc_public_ip && webrtc_public_ip !== ip)
    );
    
    await saveClientFingerprint({
      visitor_id,
      request_id,
      user_agent: ua,
      platform,
      screen_resolution,
      timezone,
      language,
      color_depth,
      hardware_concurrency,
      device_memory,
      touch_support,
      canvas_hash,
      webgl_hash,
      webgl_vendor,
      webgl_renderer,
      audio_hash,
      fonts_hash,
      webrtc_local_ip,
      webrtc_public_ip,
      webrtc_leak_detected,
      confidence_score,
      bot_probability,
      incognito_detected,
      server_fingerprint: serverFingerprint,
      ip,
    });
    
    // If WebRTC leak detected, log it
    if (webrtc_leak_detected) {
      await logSecurityDecision({
        ip,
        fingerprint: serverFingerprint,
        visitor_id,
        decision: 'flag',
        reason: 'webrtc_leak_detected',
        request_path: '/api/intel/fingerprint',
        request_method: 'POST',
        user_agent: ua,
        intel: { country_code: null },
      });
    }
    
    res.json({ 
      ok: true, 
      webrtc_leak_detected,
      server_fingerprint: serverFingerprint,
    });
  } catch (err) {
    console.error('[intel] /fingerprint error:', err);
    res.status(500).json({ error: 'Failed to save fingerprint' });
  }
});

/**
 * GET /api/intel/check
 * Full security check for current visitor
 * Returns decision: allow, block, challenge, flag
 */
router.get('/check', async (req, res) => {
  try {
    const ip = getClientIp(req);
    const ua = req.headers['user-agent'] || null;
    const fpCookie = parseCookie(req, 'ecopro_fp');
    const fingerprint = computeFingerprint({ ip, userAgent: ua, cookie: fpCookie });
    
    if (!ip) {
      return res.json({
        decision: 'allow',
        reason: 'no_ip',
        intel: null,
      });
    }
    
    const { suspicious, reason, intel } = await isIPSuspicious(ip);
    
    // Determine decision based on suspicion and country
    let decision: 'allow' | 'block' | 'challenge' | 'flag' = 'allow';
    let finalReason = reason;
    
    // Block Tor exit nodes
    if (intel.is_tor) {
      decision = 'block';
      finalReason = 'tor_exit_node';
    }
    // Block blacklisted IPs
    else if (intel.is_blacklisted && intel.blacklist_confidence >= 75) {
      decision = 'block';
      finalReason = 'blacklisted_high_confidence';
    }
    // Challenge VPNs/proxies from non-DZ
    else if ((intel.is_vpn || intel.is_proxy) && intel.country_code !== 'DZ') {
      decision = 'challenge';
      finalReason = 'vpn_proxy_non_dz';
    }
    // Challenge datacenter IPs
    else if (intel.is_datacenter) {
      decision = 'challenge';
      finalReason = 'datacenter_ip';
    }
    // Flag high risk but allow
    else if (intel.risk_level === 'high') {
      decision = 'flag';
      finalReason = 'high_risk';
    }
    // Flag medium risk VPNs
    else if (intel.is_vpn && intel.country_code === 'DZ') {
      decision = 'flag';
      finalReason = 'vpn_dz_allowed';
    }
    
    // Log the decision
    await logSecurityDecision({
      ip,
      fingerprint,
      visitor_id: null,
      decision,
      reason: finalReason || 'clean',
      request_path: req.path,
      request_method: req.method,
      user_agent: ua,
      intel,
    });
    
    res.json({
      decision,
      reason: finalReason,
      intel: {
        ip: intel.ip,
        country_code: intel.country_code,
        isp: intel.isp,
        is_vpn: intel.is_vpn,
        is_proxy: intel.is_proxy,
        is_tor: intel.is_tor,
        is_datacenter: intel.is_datacenter,
        risk_level: intel.risk_level,
        fraud_score: intel.fraud_score,
      },
    });
  } catch (err) {
    console.error('[intel] /check error:', err);
    res.status(500).json({ error: 'Security check failed' });
  }
});

// ============ KERNEL ADMIN ROUTES (require root auth) ============

function requireRoot(req: any, res: any, next: any) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  if (req.user.role !== 'root' || req.user.user_type !== 'root') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  return next();
}

/**
 * GET /api/intel/admin/lookup/:ip
 * Full IP intelligence lookup (admin only)
 */
router.get('/admin/lookup/:ip', requireRoot, async (req, res) => {
  try {
    const ip = req.params.ip;
    if (!ip) {
      return res.status(400).json({ error: 'IP is required' });
    }
    
    const intel = await getIPIntelligence(ip);
    res.json(intel);
  } catch (err) {
    console.error('[intel] /admin/lookup error:', err);
    res.status(500).json({ error: 'Lookup failed' });
  }
});

/**
 * GET /api/intel/admin/fingerprints
 * List recent client fingerprints (admin only)
 */
router.get('/admin/fingerprints', requireRoot, async (req, res) => {
  try {
    const limit = Math.min(500, parseInt(String(req.query.limit || '100'), 10) || 100);
    const pool = await ensureConnection();
    
    const result = await pool.query(
      `SELECT * FROM client_fingerprints 
       ORDER BY created_at DESC 
       LIMIT $1`,
      [limit]
    );
    
    res.json({ fingerprints: result.rows });
  } catch (err) {
    console.error('[intel] /admin/fingerprints error:', err);
    res.status(500).json({ error: 'Failed to fetch fingerprints' });
  }
});

/**
 * GET /api/intel/admin/decisions
 * List recent security decisions (admin only)
 */
router.get('/admin/decisions', requireRoot, async (req, res) => {
  try {
    const limit = Math.min(500, parseInt(String(req.query.limit || '100'), 10) || 100);
    const decision = req.query.decision as string | undefined;
    const pool = await ensureConnection();
    
    let query = `SELECT * FROM security_decisions`;
    const params: any[] = [];
    
    if (decision) {
      query += ` WHERE decision = $1`;
      params.push(decision);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);
    
    const result = await pool.query(query, params);
    res.json({ decisions: result.rows });
  } catch (err) {
    console.error('[intel] /admin/decisions error:', err);
    res.status(500).json({ error: 'Failed to fetch decisions' });
  }
});

/**
 * GET /api/intel/admin/cache
 * List cached IP intelligence (admin only)
 */
router.get('/admin/cache', requireRoot, async (req, res) => {
  try {
    const limit = Math.min(500, parseInt(String(req.query.limit || '100'), 10) || 100);
    const riskLevel = req.query.risk_level as string | undefined;
    const pool = await ensureConnection();
    
    let query = `SELECT * FROM ip_intelligence`;
    const params: any[] = [];
    
    if (riskLevel) {
      query += ` WHERE risk_level = $1`;
      params.push(riskLevel);
    }
    
    query += ` ORDER BY last_checked_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);
    
    const result = await pool.query(query, params);
    res.json({ cache: result.rows });
  } catch (err) {
    console.error('[intel] /admin/cache error:', err);
    res.status(500).json({ error: 'Failed to fetch cache' });
  }
});

/**
 * GET /api/intel/admin/stats
 * Intelligence statistics (admin only)
 */
router.get('/admin/stats', requireRoot, async (req, res) => {
  try {
    const days = Math.min(30, parseInt(String(req.query.days || '7'), 10) || 7);
    const pool = await ensureConnection();
    
    const [cacheStats, decisionStats, fingerprintStats, riskStats] = await Promise.all([
      pool.query(`
        SELECT 
          COUNT(*) as total_cached,
          COUNT(*) FILTER (WHERE is_vpn = true) as vpn_count,
          COUNT(*) FILTER (WHERE is_proxy = true) as proxy_count,
          COUNT(*) FILTER (WHERE is_tor = true) as tor_count,
          COUNT(*) FILTER (WHERE is_blacklisted = true) as blacklisted_count,
          COUNT(*) FILTER (WHERE last_checked_at > NOW() - INTERVAL '24 hours') as checked_today
        FROM ip_intelligence
      `),
      pool.query(`
        SELECT 
          decision,
          COUNT(*) as count
        FROM security_decisions
        WHERE created_at > NOW() - ($1 || ' days')::interval
        GROUP BY decision
      `, [String(days)]),
      pool.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE webrtc_leak_detected = true) as webrtc_leaks,
          COUNT(*) FILTER (WHERE incognito_detected = true) as incognito_users,
          COUNT(DISTINCT visitor_id) as unique_visitors
        FROM client_fingerprints
        WHERE created_at > NOW() - ($1 || ' days')::interval
      `, [String(days)]),
      pool.query(`
        SELECT 
          risk_level,
          COUNT(*) as count
        FROM ip_intelligence
        GROUP BY risk_level
      `),
    ]);
    
    res.json({
      days,
      cache: cacheStats.rows[0] || {},
      decisions: decisionStats.rows || [],
      fingerprints: fingerprintStats.rows[0] || {},
      risk_distribution: riskStats.rows || [],
    });
  } catch (err) {
    console.error('[intel] /admin/stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * DELETE /api/intel/admin/cache/:ip
 * Remove an IP from cache (force re-check)
 */
router.delete('/admin/cache/:ip', requireRoot, async (req, res) => {
  try {
    const ip = req.params.ip;
    const pool = await ensureConnection();
    
    await pool.query(`DELETE FROM ip_intelligence WHERE ip = $1`, [ip]);
    res.json({ ok: true, message: `Removed ${ip} from cache` });
  } catch (err) {
    console.error('[intel] /admin/cache delete error:', err);
    res.status(500).json({ error: 'Failed to remove from cache' });
  }
});

export default router;
