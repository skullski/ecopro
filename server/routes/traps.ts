import { Router } from 'express';
import { logSecurityEvent, getClientIp, getGeo, computeFingerprint, parseCookie } from '../utils/security';

const router = Router();

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
// HONEYPOT ENDPOINTS - Only paths NO legitimate user would EVER hit
// Express 5 uses path-to-regexp v8+ which requires {*name} for wildcards
// ============================================

// robots.txt - honeypot! Only bots/hackers look for this to find hidden paths
router.all('/robots.txt', trapHandler);

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
