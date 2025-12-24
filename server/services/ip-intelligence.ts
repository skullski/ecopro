/**
 * IP Intelligence Service
 * 
 * Integrates with external APIs to gather comprehensive IP intelligence:
 * - ipinfo.io: Basic geo + ASN/ISP
 * - IPQualityScore: VPN/proxy/fraud detection
 * - AbuseIPDB: Blacklist status
 * 
 * Results are cached in the database to minimize API calls.
 */

import { ensureConnection } from '../utils/database';

// Environment variables for API keys
const IPINFO_TOKEN = process.env.IPINFO_TOKEN || '';
const IPQS_KEY = process.env.IPQS_KEY || '';
const ABUSEIPDB_KEY = process.env.ABUSEIPDB_KEY || '';

// Cache TTL (24 hours for normal IPs, 1 hour for flagged IPs)
const CACHE_TTL_NORMAL_MS = 24 * 60 * 60 * 1000;
const CACHE_TTL_FLAGGED_MS = 60 * 60 * 1000;

export interface IPIntelligence {
  ip: string;
  
  // Geo
  country_code: string | null;
  country_name: string | null;
  region: string | null;
  city: string | null;
  postal: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  
  // Network
  isp: string | null;
  org: string | null;
  asn: string | null;
  as_name: string | null;
  
  // Proxy/VPN detection
  is_vpn: boolean;
  is_proxy: boolean;
  is_tor: boolean;
  is_datacenter: boolean;
  is_mobile: boolean;
  is_crawler: boolean;
  
  // Risk
  fraud_score: number;
  abuse_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical' | 'unknown';
  
  // Blacklist
  is_blacklisted: boolean;
  blacklist_reports: number;
  blacklist_confidence: number;
  
  // Meta
  sources_checked: string[];
  last_checked_at: Date;
  from_cache: boolean;
}

/**
 * Check if IP is private/local
 */
function isPrivateIP(ip: string): boolean {
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') return true;
  if (ip.startsWith('10.')) return true;
  if (ip.startsWith('192.168.')) return true;
  if (ip.startsWith('172.')) {
    const second = parseInt(ip.split('.')[1] || '0', 10);
    if (second >= 16 && second <= 31) return true;
  }
  return false;
}

/**
 * Calculate risk level from scores
 */
function calculateRiskLevel(intel: Partial<IPIntelligence>): 'low' | 'medium' | 'high' | 'critical' | 'unknown' {
  const fraudScore = intel.fraud_score || 0;
  const abuseScore = intel.abuse_score || 0;
  
  // Critical: Tor, blacklisted, or very high fraud score
  if (intel.is_tor || intel.is_blacklisted || fraudScore >= 90) {
    return 'critical';
  }
  
  // High: VPN/proxy from datacenter, or high fraud score
  if ((intel.is_vpn || intel.is_proxy) && intel.is_datacenter) {
    return 'high';
  }
  if (fraudScore >= 75 || abuseScore >= 50) {
    return 'high';
  }
  
  // Medium: VPN/proxy or moderate fraud score
  if (intel.is_vpn || intel.is_proxy || fraudScore >= 50 || abuseScore >= 25) {
    return 'medium';
  }
  
  // Low: Clean
  if (fraudScore < 50 && abuseScore < 25) {
    return 'low';
  }
  
  return 'unknown';
}

/**
 * Fetch from ipinfo.io
 */
async function fetchIPInfo(ip: string): Promise<Partial<IPIntelligence>> {
  if (!IPINFO_TOKEN) {
    console.warn('[ip-intel] IPINFO_TOKEN not set, skipping ipinfo.io lookup');
    return {};
  }
  
  try {
    const response = await fetch(`https://ipinfo.io/${ip}?token=${IPINFO_TOKEN}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    
    if (!response.ok) {
      console.warn(`[ip-intel] ipinfo.io returned ${response.status} for ${ip}`);
      return {};
    }
    
    const data = await response.json();
    
    // Parse ASN from org field (format: "AS12345 Company Name")
    let asn: string | null = null;
    let as_name: string | null = null;
    if (data.org) {
      const match = data.org.match(/^(AS\d+)\s+(.+)$/);
      if (match) {
        asn = match[1];
        as_name = match[2];
      }
    }
    
    // Parse location
    let latitude: number | null = null;
    let longitude: number | null = null;
    if (data.loc) {
      const [lat, lon] = data.loc.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lon)) {
        latitude = lat;
        longitude = lon;
      }
    }
    
    return {
      country_code: data.country || null,
      region: data.region || null,
      city: data.city || null,
      postal: data.postal || null,
      latitude,
      longitude,
      timezone: data.timezone || null,
      org: data.org || null,
      asn,
      as_name,
    };
  } catch (err) {
    console.warn('[ip-intel] ipinfo.io error:', (err as Error).message);
    return {};
  }
}

/**
 * Fetch from IPQualityScore
 */
async function fetchIPQS(ip: string): Promise<Partial<IPIntelligence>> {
  if (!IPQS_KEY) {
    console.warn('[ip-intel] IPQS_KEY not set, skipping IPQualityScore lookup');
    return {};
  }
  
  try {
    const url = `https://ipqualityscore.com/api/json/ip/${IPQS_KEY}/${ip}?strictness=1&allow_public_access_points=true&lighter_penalties=false`;
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    
    if (!response.ok) {
      console.warn(`[ip-intel] IPQualityScore returned ${response.status} for ${ip}`);
      return {};
    }
    
    const data = await response.json();
    
    if (!data.success) {
      console.warn('[ip-intel] IPQualityScore error:', data.message);
      return {};
    }
    
    return {
      isp: data.ISP || null,
      org: data.organization || null,
      asn: data.ASN ? `AS${data.ASN}` : null,
      country_code: data.country_code || null,
      region: data.region || null,
      city: data.city || null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      timezone: data.timezone || null,
      is_vpn: Boolean(data.vpn),
      is_proxy: Boolean(data.proxy),
      is_tor: Boolean(data.tor),
      is_datacenter: Boolean(data.is_datacenter || data.host?.startsWith('datacenter')),
      is_mobile: Boolean(data.mobile),
      is_crawler: Boolean(data.is_crawler),
      fraud_score: data.fraud_score || 0,
    };
  } catch (err) {
    console.warn('[ip-intel] IPQualityScore error:', (err as Error).message);
    return {};
  }
}

/**
 * Fetch from AbuseIPDB
 */
async function fetchAbuseIPDB(ip: string): Promise<Partial<IPIntelligence>> {
  if (!ABUSEIPDB_KEY) {
    console.warn('[ip-intel] ABUSEIPDB_KEY not set, skipping AbuseIPDB lookup');
    return {};
  }
  
  try {
    const response = await fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90`, {
      headers: {
        'Accept': 'application/json',
        'Key': ABUSEIPDB_KEY,
      },
      signal: AbortSignal.timeout(5000),
    });
    
    if (!response.ok) {
      console.warn(`[ip-intel] AbuseIPDB returned ${response.status} for ${ip}`);
      return {};
    }
    
    const json = await response.json();
    const data = json.data;
    
    if (!data) {
      return {};
    }
    
    return {
      isp: data.isp || null,
      country_code: data.countryCode || null,
      abuse_score: data.abuseConfidenceScore || 0,
      is_blacklisted: (data.abuseConfidenceScore || 0) >= 50,
      blacklist_reports: data.totalReports || 0,
      blacklist_confidence: data.abuseConfidenceScore || 0,
      is_tor: Boolean(data.isTor),
    };
  } catch (err) {
    console.warn('[ip-intel] AbuseIPDB error:', (err as Error).message);
    return {};
  }
}

/**
 * Get cached intelligence from database
 */
async function getCachedIntelligence(ip: string): Promise<IPIntelligence | null> {
  try {
    const pool = await ensureConnection();
    const result = await pool.query(
      `SELECT * FROM ip_intelligence WHERE ip = $1`,
      [ip]
    );
    
    if (!result.rows[0]) return null;
    
    const row = result.rows[0];
    const lastChecked = new Date(row.last_checked_at);
    const now = new Date();
    const age = now.getTime() - lastChecked.getTime();
    
    // Check if cache is stale
    const isFlagged = row.is_vpn || row.is_proxy || row.is_tor || row.is_blacklisted || row.fraud_score >= 50;
    const ttl = isFlagged ? CACHE_TTL_FLAGGED_MS : CACHE_TTL_NORMAL_MS;
    
    if (age > ttl) {
      return null; // Cache expired
    }
    
    return {
      ip: row.ip,
      country_code: row.country_code,
      country_name: row.country_name,
      region: row.region,
      city: row.city,
      postal: row.postal,
      latitude: row.latitude,
      longitude: row.longitude,
      timezone: row.timezone,
      isp: row.isp,
      org: row.org,
      asn: row.asn,
      as_name: row.as_name,
      is_vpn: row.is_vpn,
      is_proxy: row.is_proxy,
      is_tor: row.is_tor,
      is_datacenter: row.is_datacenter,
      is_mobile: row.is_mobile,
      is_crawler: row.is_crawler,
      fraud_score: row.fraud_score,
      abuse_score: row.abuse_score,
      risk_level: row.risk_level,
      is_blacklisted: row.is_blacklisted,
      blacklist_reports: row.blacklist_reports,
      blacklist_confidence: row.blacklist_confidence,
      sources_checked: row.sources_checked || [],
      last_checked_at: lastChecked,
      from_cache: true,
    };
  } catch (err) {
    console.warn('[ip-intel] Cache read error:', (err as Error).message);
    return null;
  }
}

/**
 * Save intelligence to cache
 */
async function cacheIntelligence(intel: IPIntelligence): Promise<void> {
  try {
    const pool = await ensureConnection();
    await pool.query(
      `INSERT INTO ip_intelligence (
        ip, country_code, country_name, region, city, postal,
        latitude, longitude, timezone,
        isp, org, asn, as_name,
        is_vpn, is_proxy, is_tor, is_datacenter, is_mobile, is_crawler,
        fraud_score, abuse_score, risk_level,
        is_blacklisted, blacklist_reports, blacklist_confidence,
        sources_checked, last_checked_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9,
        $10, $11, $12, $13,
        $14, $15, $16, $17, $18, $19,
        $20, $21, $22,
        $23, $24, $25,
        $26, NOW(), NOW()
      )
      ON CONFLICT (ip) DO UPDATE SET
        country_code = EXCLUDED.country_code,
        country_name = EXCLUDED.country_name,
        region = EXCLUDED.region,
        city = EXCLUDED.city,
        postal = EXCLUDED.postal,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        timezone = EXCLUDED.timezone,
        isp = EXCLUDED.isp,
        org = EXCLUDED.org,
        asn = EXCLUDED.asn,
        as_name = EXCLUDED.as_name,
        is_vpn = EXCLUDED.is_vpn,
        is_proxy = EXCLUDED.is_proxy,
        is_tor = EXCLUDED.is_tor,
        is_datacenter = EXCLUDED.is_datacenter,
        is_mobile = EXCLUDED.is_mobile,
        is_crawler = EXCLUDED.is_crawler,
        fraud_score = EXCLUDED.fraud_score,
        abuse_score = EXCLUDED.abuse_score,
        risk_level = EXCLUDED.risk_level,
        is_blacklisted = EXCLUDED.is_blacklisted,
        blacklist_reports = EXCLUDED.blacklist_reports,
        blacklist_confidence = EXCLUDED.blacklist_confidence,
        sources_checked = EXCLUDED.sources_checked,
        last_checked_at = NOW(),
        updated_at = NOW()`,
      [
        intel.ip,
        intel.country_code,
        intel.country_name,
        intel.region,
        intel.city,
        intel.postal,
        intel.latitude,
        intel.longitude,
        intel.timezone,
        intel.isp,
        intel.org,
        intel.asn,
        intel.as_name,
        intel.is_vpn,
        intel.is_proxy,
        intel.is_tor,
        intel.is_datacenter,
        intel.is_mobile,
        intel.is_crawler,
        intel.fraud_score,
        intel.abuse_score,
        intel.risk_level,
        intel.is_blacklisted,
        intel.blacklist_reports,
        intel.blacklist_confidence,
        intel.sources_checked,
      ]
    );
  } catch (err) {
    console.warn('[ip-intel] Cache write error:', (err as Error).message);
  }
}

/**
 * Main function: Get full IP intelligence
 */
export async function getIPIntelligence(ip: string): Promise<IPIntelligence> {
  // Return safe defaults for private IPs
  if (isPrivateIP(ip)) {
    return {
      ip,
      country_code: 'DZ',
      country_name: 'Algeria (Local)',
      region: null,
      city: null,
      postal: null,
      latitude: null,
      longitude: null,
      timezone: null,
      isp: 'Local Network',
      org: null,
      asn: null,
      as_name: null,
      is_vpn: false,
      is_proxy: false,
      is_tor: false,
      is_datacenter: false,
      is_mobile: false,
      is_crawler: false,
      fraud_score: 0,
      abuse_score: 0,
      risk_level: 'low',
      is_blacklisted: false,
      blacklist_reports: 0,
      blacklist_confidence: 0,
      sources_checked: ['local'],
      last_checked_at: new Date(),
      from_cache: false,
    };
  }
  
  // Check cache first
  const cached = await getCachedIntelligence(ip);
  if (cached) {
    return cached;
  }
  
  // Fetch from all APIs in parallel
  const sources: string[] = [];
  const [ipinfoData, ipqsData, abuseData] = await Promise.all([
    fetchIPInfo(ip).then(d => { if (Object.keys(d).length) sources.push('ipinfo'); return d; }),
    fetchIPQS(ip).then(d => { if (Object.keys(d).length) sources.push('ipqs'); return d; }),
    fetchAbuseIPDB(ip).then(d => { if (Object.keys(d).length) sources.push('abuseipdb'); return d; }),
  ]);
  
  // Merge results (IPQS takes priority for VPN/proxy detection, AbuseIPDB for blacklist)
  const merged: IPIntelligence = {
    ip,
    country_code: ipqsData.country_code || abuseData.country_code || ipinfoData.country_code || null,
    country_name: null,
    region: ipqsData.region || ipinfoData.region || null,
    city: ipqsData.city || ipinfoData.city || null,
    postal: ipinfoData.postal || null,
    latitude: ipqsData.latitude || ipinfoData.latitude || null,
    longitude: ipqsData.longitude || ipinfoData.longitude || null,
    timezone: ipqsData.timezone || ipinfoData.timezone || null,
    isp: ipqsData.isp || abuseData.isp || null,
    org: ipqsData.org || ipinfoData.org || null,
    asn: ipqsData.asn || ipinfoData.asn || null,
    as_name: ipinfoData.as_name || null,
    is_vpn: ipqsData.is_vpn || false,
    is_proxy: ipqsData.is_proxy || false,
    is_tor: ipqsData.is_tor || abuseData.is_tor || false,
    is_datacenter: ipqsData.is_datacenter || false,
    is_mobile: ipqsData.is_mobile || false,
    is_crawler: ipqsData.is_crawler || false,
    fraud_score: ipqsData.fraud_score || 0,
    abuse_score: abuseData.abuse_score || 0,
    risk_level: 'unknown',
    is_blacklisted: abuseData.is_blacklisted || false,
    blacklist_reports: abuseData.blacklist_reports || 0,
    blacklist_confidence: abuseData.blacklist_confidence || 0,
    sources_checked: sources,
    last_checked_at: new Date(),
    from_cache: false,
  };
  
  // Calculate risk level
  merged.risk_level = calculateRiskLevel(merged);
  
  // Cache the result
  await cacheIntelligence(merged);
  
  return merged;
}

/**
 * Quick check: Is this IP suspicious?
 */
export async function isIPSuspicious(ip: string): Promise<{ suspicious: boolean; reason: string | null; intel: IPIntelligence }> {
  const intel = await getIPIntelligence(ip);
  
  if (intel.is_tor) {
    return { suspicious: true, reason: 'tor_exit_node', intel };
  }
  
  if (intel.is_blacklisted) {
    return { suspicious: true, reason: 'blacklisted', intel };
  }
  
  if (intel.risk_level === 'critical') {
    return { suspicious: true, reason: 'critical_risk', intel };
  }
  
  if (intel.is_vpn && intel.is_datacenter) {
    return { suspicious: true, reason: 'datacenter_vpn', intel };
  }
  
  if (intel.fraud_score >= 85) {
    return { suspicious: true, reason: 'high_fraud_score', intel };
  }
  
  return { suspicious: false, reason: null, intel };
}

/**
 * Log a security decision
 */
export async function logSecurityDecision(opts: {
  ip: string | null;
  fingerprint: string | null;
  visitor_id: string | null;
  decision: 'allow' | 'block' | 'challenge' | 'flag';
  reason: string;
  request_path: string;
  request_method: string;
  user_agent: string | null;
  intel?: Partial<IPIntelligence>;
}): Promise<void> {
  try {
    const pool = await ensureConnection();
    await pool.query(
      `INSERT INTO security_decisions (
        ip, fingerprint, visitor_id,
        decision, reason,
        request_path, request_method, user_agent,
        risk_level, fraud_score, is_vpn, is_proxy, country_code
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        opts.ip,
        opts.fingerprint,
        opts.visitor_id,
        opts.decision,
        opts.reason,
        opts.request_path,
        opts.request_method,
        opts.user_agent,
        opts.intel?.risk_level || null,
        opts.intel?.fraud_score || null,
        opts.intel?.is_vpn || false,
        opts.intel?.is_proxy || false,
        opts.intel?.country_code || null,
      ]
    );
  } catch (err) {
    console.warn('[ip-intel] Decision log error:', (err as Error).message);
  }
}

/**
 * Save client fingerprint from FingerprintJS
 */
export async function saveClientFingerprint(data: {
  visitor_id: string;
  request_id?: string;
  user_agent?: string;
  platform?: string;
  screen_resolution?: string;
  timezone?: string;
  language?: string;
  color_depth?: number;
  hardware_concurrency?: number;
  device_memory?: number;
  touch_support?: boolean;
  canvas_hash?: string;
  webgl_hash?: string;
  webgl_vendor?: string;
  webgl_renderer?: string;
  audio_hash?: string;
  fonts_hash?: string;
  webrtc_local_ip?: string;
  webrtc_public_ip?: string;
  webrtc_leak_detected?: boolean;
  confidence_score?: number;
  bot_probability?: number;
  incognito_detected?: boolean;
  server_fingerprint?: string;
  ip?: string;
}): Promise<void> {
  try {
    const pool = await ensureConnection();
    await pool.query(
      `INSERT INTO client_fingerprints (
        visitor_id, request_id,
        user_agent, platform, screen_resolution, timezone, language,
        color_depth, hardware_concurrency, device_memory, touch_support,
        canvas_hash, webgl_hash, webgl_vendor, webgl_renderer,
        audio_hash, fonts_hash,
        webrtc_local_ip, webrtc_public_ip, webrtc_leak_detected,
        confidence_score, bot_probability, incognito_detected,
        server_fingerprint, ip
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25
      )`,
      [
        data.visitor_id,
        data.request_id || null,
        data.user_agent || null,
        data.platform || null,
        data.screen_resolution || null,
        data.timezone || null,
        data.language || null,
        data.color_depth || null,
        data.hardware_concurrency || null,
        data.device_memory || null,
        data.touch_support || false,
        data.canvas_hash || null,
        data.webgl_hash || null,
        data.webgl_vendor || null,
        data.webgl_renderer || null,
        data.audio_hash || null,
        data.fonts_hash || null,
        data.webrtc_local_ip || null,
        data.webrtc_public_ip || null,
        data.webrtc_leak_detected || false,
        data.confidence_score || null,
        data.bot_probability || null,
        data.incognito_detected || false,
        data.server_fingerprint || null,
        data.ip || null,
      ]
    );
  } catch (err) {
    console.warn('[ip-intel] Fingerprint save error:', (err as Error).message);
  }
}
