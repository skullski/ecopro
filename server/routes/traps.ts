import { Router } from 'express';
import { logSecurityEvent, getClientIp, getGeo, computeFingerprint, parseCookie, isPrivateIp } from '../utils/security';
import { ensureConnection } from '../utils/database';

const router = Router();

// Auto-block an IP address - NUCLEAR response to honeypot traps
async function autoBlockIp(ip: string, reason: string, fingerprint: string | null): Promise<void> {
  if (!ip || isPrivateIp(ip)) return; // Don't block localhost/dev
  
  try {
    const pool = await ensureConnection();
    
    // Check if already blocked
    const existing = await pool.query(
      `SELECT id FROM security_ip_blocks WHERE ip = $1 AND is_active = true`,
      [ip]
    );
    
    if (existing.rows.length === 0) {
      // Auto-block this IP
      await pool.query(
        `INSERT INTO security_ip_blocks (ip, reason, is_active, created_by, created_at, updated_at)
         VALUES ($1, $2, true, 'auto_honeypot', NOW(), NOW())
         ON CONFLICT (ip) DO UPDATE SET is_active = true, reason = $2, updated_at = NOW()`,
        [ip, reason]
      );
      console.log(`[HONEYPOT] 🚨 AUTO-BLOCKED IP: ${ip} - Reason: ${reason}`);
    }
    
    // Also log the fingerprint for tracking across IPs
    if (fingerprint) {
      await pool.query(
        `INSERT INTO security_events (event_type, severity, ip, fingerprint, metadata, created_at)
         VALUES ('honeypot_fingerprint', 'error', $1, $2, $3, NOW())`,
        [ip, fingerprint, JSON.stringify({ reason, auto_blocked: true })]
      );
    }
  } catch (e) {
    console.warn('[HONEYPOT] Failed to auto-block:', (e as any)?.message);
  }
}

// Flag/ban a user account - they're a confirmed attacker
async function flagHackerAccount(userId: number, reason: string, path: string): Promise<void> {
  if (!userId) return;
  
  try {
    const pool = await ensureConnection();
    
    // Get user details for logging
    const userResult = await pool.query(
      `SELECT id, email, full_name, name, phone, user_type, role, is_locked FROM users WHERE id = $1`,
      [userId]
    );
    const user = userResult.rows[0];
    
    if (user) {
      // Lock the account immediately in users table
      // Try to set locked_reason and locked_at if columns exist
      try {
        await pool.query(
          `UPDATE users SET is_locked = true, locked_reason = $2, locked_at = NOW(), locked_by = 'auto_honeypot', updated_at = NOW() WHERE id = $1`,
          [userId, `🚨 HONEYPOT TRAP: ${reason}`]
        );
      } catch {
        // Fallback if locked_reason/locked_at don't exist yet
        await pool.query(
          `UPDATE users SET is_locked = true, updated_at = NOW() WHERE id = $1`,
          [userId]
        );
      }

      // If user is a client, also lock in clients table (for admin panel visibility)
      if (user.user_type === 'client') {
        try {
          await pool.query(
            `UPDATE clients SET is_locked = true, locked_reason = $2, locked_at = NOW() WHERE id = $1`,
            [userId, `🚨 HONEYPOT TRAP: ${reason}`]
          );
        } catch (e) {
          console.warn('[HONEYPOT] Could not update clients table:', (e as any)?.message);
        }
      }
      
      // Log detailed hacker info
      await pool.query(
        `INSERT INTO security_events (event_type, severity, user_id, path, metadata, created_at)
         VALUES ('hacker_account_flagged', 'error', $1, $2, $3, NOW())`,
        [
          String(userId), 
          path,
          JSON.stringify({
            reason,
            account_locked: true,
            user_details: {
              email: user.email,
              full_name: user.full_name || user.name,
              phone: user.phone,
              user_type: user.user_type,
              role: user.role,
              was_already_locked: user.is_locked,
            }
          })
        ]
      );
      
      console.log(`[HONEYPOT] 🚨 LOCKED HACKER ACCOUNT: User #${userId} (${user.email}) - Reason: ${reason}`);
    }
  } catch (e) {
    console.warn('[HONEYPOT] Failed to flag account:', (e as any)?.message);
  }
}

async function trapHandler(req: any, res: any) {
  const ip = getClientIp(req);
  const ua = (req.headers['user-agent'] as string | undefined) || null;
  const linuxUa = !!ua && /Linux/i.test(ua) && !/Android/i.test(ua);
  const geo = getGeo(req, ip);
  const fpCookie = parseCookie(req, 'ecopro_fp');
  const fingerprint = computeFingerprint({ ip, userAgent: ua, cookie: fpCookie });
  const u = req.user;

  await logSecurityEvent({
    event_type: 'trap_hit',
    severity: linuxUa ? 'error' : 'warn',
    request_id: (req as any).requestId || null,
    method: req.method,
    path: req.path || req.url,
    status_code: 404,
    ip,
    user_agent: ua,
    fingerprint,
    country_code: geo.country_code,
    region: geo.region,
    city: geo.city,
    user_id: u?.id != null ? String(u.id) : null,
    user_type: u?.user_type != null ? String(u.user_type) : null,
    role: u?.role != null ? String(u.role) : null,
    metadata: {
      query: req.query || null,
      body_keys: req.body ? Object.keys(req.body).slice(0, 50) : null,
      headers: {
        referer: req.headers.referer || null,
        origin: req.headers.origin || null,
      },
    },
  });

  // Always deny and look uninteresting
  if ((req.path || '').startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  return res.status(404).send('Not found');
}

// ============================================
// NUCLEAR TRAP - For paths from robots.txt honeypot
// Anyone hitting these gets INSTANTLY blocked
// ============================================
async function nuclearTrapHandler(req: any, res: any) {
  const ip = getClientIp(req);
  const ua = (req.headers['user-agent'] as string | undefined) || null;
  const linuxUa = !!ua && /Linux/i.test(ua) && !/Android/i.test(ua);
  const geo = getGeo(req, ip);
  const fpCookie = parseCookie(req, 'ecopro_fp');
  const fingerprint = computeFingerprint({ ip, userAgent: ua, cookie: fpCookie });
  const u = req.user;
  const path = req.path || req.url;

  // Log with MAXIMUM severity - this is a confirmed attacker
  await logSecurityEvent({
    event_type: 'honeypot_trap',
    severity: 'error',
    request_id: (req as any).requestId || null,
    method: req.method,
    path,
    status_code: 403,
    ip,
    user_agent: ua,
    fingerprint,
    country_code: geo.country_code,
    region: geo.region,
    city: geo.city,
    user_id: u?.id != null ? String(u.id) : null,
    user_type: u?.user_type != null ? String(u.user_type) : null,
    role: u?.role != null ? String(u.role) : null,
    metadata: {
      trap_type: 'nuclear_honeypot',
      auto_blocked: true,
      logged_in_user: u ? {
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        phone: u.phone,
        user_type: u.user_type,
        role: u.role,
      } : null,
      query: req.query || null,
      body: req.body || null,
      headers: {
        referer: req.headers.referer || null,
        origin: req.headers.origin || null,
        'accept-language': req.headers['accept-language'] || null,
        'accept-encoding': req.headers['accept-encoding'] || null,
        'x-forwarded-for': req.headers['x-forwarded-for'] || null,
        'x-real-ip': req.headers['x-real-ip'] || null,
        authorization: req.headers.authorization ? '[REDACTED]' : null,
      },
      all_cookies: req.headers.cookie || null,
    },
  });

  // 🚨 AUTO-BLOCK THIS ATTACKER
  if (ip) {
    await autoBlockIp(ip, `Honeypot trap: ${path}`, fingerprint);
  }

  // 🚨 IF LOGGED IN - LOCK THEIR ACCOUNT TOO
  if (u?.id) {
    await flagHackerAccount(u.id, `Honeypot trap: ${path}`, path);
  }

  // Respond with something that wastes their time
  // Random delay to slow down automated scanners
  await new Promise(r => setTimeout(r, Math.random() * 2000 + 500));
  
  // Return a fake "error" that looks like they almost got in
  if ((path || '').startsWith('/api/')) {
    return res.status(403).json({ 
      error: 'Authentication required',
      code: 'AUTH_REQUIRED',
      hint: 'Use X-Admin-Token header' // Another troll - there's no such thing
    });
  }
  
  // For non-API paths, return a fake login page that goes nowhere
  return res.status(403).send(`
<!DOCTYPE html>
<html>
<head><title>Admin Login</title></head>
<body style="font-family: Arial; padding: 50px; background: #1a1a2e; color: #fff;">
  <h1>⚠️ Restricted Access</h1>
  <p>This area requires administrator credentials.</p>
  <form action="/admin-auth" method="POST">
    <input type="text" name="username" placeholder="Username" style="padding: 10px; margin: 5px;"><br>
    <input type="password" name="password" placeholder="Password" style="padding: 10px; margin: 5px;"><br>
    <button type="submit" style="padding: 10px 20px; margin: 5px;">Login</button>
  </form>
  <p style="color: #666; font-size: 12px;">Session ID: ${fingerprint?.slice(0, 16) || 'unknown'}</p>
</body>
</html>
  `);
}

// Special robots.txt trap - returns fake "secrets" that hackers will waste time cracking
// All hashes are SHA256 of troll messages, completely useless
async function robotsTrapHandler(req: any, res: any) {
  const ip = getClientIp(req);
  const ua = (req.headers['user-agent'] as string | undefined) || null;
  const linuxUa = !!ua && /Linux/i.test(ua) && !/Android/i.test(ua);
  const geo = getGeo(req, ip);
  const fpCookie = parseCookie(req, 'ecopro_fp');
  const fingerprint = computeFingerprint({ ip, userAgent: ua, cookie: fpCookie });
  const u = req.user;

  await logSecurityEvent({
    event_type: 'trap_hit',
    severity: linuxUa ? 'error' : 'warn',
    request_id: (req as any).requestId || null,
    method: req.method,
    path: req.path || req.url,
    status_code: 200,
    ip,
    user_agent: ua,
    fingerprint,
    country_code: geo.country_code,
    region: geo.region,
    city: geo.city,
    user_id: u?.id != null ? String(u.id) : null,
    user_type: u?.user_type != null ? String(u.user_type) : null,
    role: u?.role != null ? String(u.role) : null,
    metadata: {
      trap_type: 'robots_honeypot',
      query: req.query || null,
      headers: {
        referer: req.headers.referer || null,
        origin: req.headers.origin || null,
      },
    },
  });

  // Return fake "secrets" - all SHA256 hashes of troll messages
  // Hackers will waste hours trying to crack these thinking they're passwords
  const fakeSecrets = `# robots.txt - DO NOT SHARE
# Internal use only - contains sensitive paths

User-agent: *
Disallow: /api/v2/internal/
Disallow: /admin-backup-2024/
Disallow: /.env.production.local
Disallow: /debug/

# DEPRECATED - remove after migration
# DB_PASSWORD_HASH=34485af2e020123e22a93a5edb3f48beaa1337b79fde5f653f6eeab833e2d42f
# API_SECRET=6eed3afda2aeb54555f3c47eeebe24bdbd719237e99b9ca16f5b9e3514f3c368
# JWT_SIGNING_KEY=5d481143c5da3eeda5f971bd628fbd831ec230cfe98015e3a246d556e9fa9462
# ADMIN_TOKEN=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
`;

  res.type('text/plain').send(fakeSecrets);
}

// ============================================
// HONEYPOT ENDPOINTS - Only paths NO legitimate user would EVER hit
// Express 5 uses path-to-regexp v8+ which requires {*name} for wildcards
// ============================================

// robots.txt - honeypot with fake secrets! Hackers will waste time cracking useless hashes
router.all('/robots.txt', robotsTrapHandler);

// ============================================
// 🚨 NUCLEAR TRAPS - Fake paths from robots.txt
// Anyone hitting these gets INSTANTLY BLOCKED
// ============================================
router.all('/api/v2/internal', nuclearTrapHandler);
router.all('/api/v2/internal/{*rest}', nuclearTrapHandler);
router.all('/admin-backup-2024', nuclearTrapHandler);
router.all('/admin-backup-2024/{*rest}', nuclearTrapHandler);
router.all('/.env.production.local', nuclearTrapHandler);
router.all('/debug', nuclearTrapHandler);
router.all('/debug/{*rest}', nuclearTrapHandler);
// Fake admin-auth from the troll login page
router.all('/admin-auth', nuclearTrapHandler);

// WordPress (you don't use WordPress - 100% attacker)
router.all('/wp-login.php', trapHandler);
router.all('/wp-admin', trapHandler);
router.all('/wp-admin/{*rest}', trapHandler);
router.all('/wp-content/{*rest}', trapHandler);
router.all('/wp-includes/{*rest}', trapHandler);
router.all('/xmlrpc.php', trapHandler);

// PHP admin tools (you don't use PHP)
router.all('/phpmyadmin', trapHandler);
router.all('/phpmyadmin/{*rest}', trapHandler);
router.all('/pma', trapHandler);
router.all('/adminer.php', trapHandler);
router.all('/phpinfo.php', trapHandler);
router.all('/info.php', trapHandler);

// Hidden dot files (browsers never request these)
router.all('/.env', trapHandler);
router.all('/.env.local', trapHandler);
router.all('/.env.production', trapHandler);
router.all('/.env.backup', trapHandler);
router.all('/.git', trapHandler);
router.all('/.git/{*rest}', trapHandler);
router.all('/.gitignore', trapHandler);
router.all('/.svn', trapHandler);
router.all('/.svn/{*rest}', trapHandler);
router.all('/.htaccess', trapHandler);
router.all('/.htpasswd', trapHandler);
router.all('/.DS_Store', trapHandler);

// PHP config files (you don't use PHP)
router.all('/config.php', trapHandler);
router.all('/config.inc.php', trapHandler);
router.all('/wp-config.php', trapHandler);
router.all('/configuration.php', trapHandler);
router.all('/settings.php', trapHandler);
router.all('/local.php', trapHandler);

// AWS/Cloud credentials (attackers love these)
router.all('/.aws/credentials', trapHandler);
router.all('/.aws/{*rest}', trapHandler);

// SSH keys (no browser ever requests these)
router.all('/.ssh/{*rest}', trapHandler);
router.all('/id_rsa', trapHandler);
router.all('/id_rsa.pub', trapHandler);
router.all('/id_dsa', trapHandler);

// Apache server status (you use Node, not Apache)
router.all('/server-status', trapHandler);
router.all('/server-info', trapHandler);

// CGI-bin (ancient attack vector, you don't have CGI)
router.all('/cgi-bin/{*rest}', trapHandler);

// Shell/command execution (obviously malicious intent)
router.all('/shell', trapHandler);
router.all('/cmd', trapHandler);
router.all('/cmd.php', trapHandler);
router.all('/c99.php', trapHandler);
router.all('/r57.php', trapHandler);

// API shell/exec (malicious intent)
router.all('/api/shell', trapHandler);
router.all('/api/exec', trapHandler);
router.all('/api/cmd', trapHandler);
router.all('/api/eval', trapHandler);

// Specific known exploit paths
router.all('/actuator', trapHandler);
router.all('/actuator/{*rest}', trapHandler);
router.all('/.well-known/security.txt', trapHandler);
router.all('/telescope/requests', trapHandler);
router.all('/elfinder/{*rest}', trapHandler);

export default router;
