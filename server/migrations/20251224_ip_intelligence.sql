-- IP Intelligence Cache Table
-- Caches results from external APIs (ipinfo, IPQualityScore, AbuseIPDB) to avoid repeated lookups

CREATE TABLE IF NOT EXISTS ip_intelligence (
  ip TEXT PRIMARY KEY,
  
  -- Basic geo (enriched)
  country_code TEXT,
  country_name TEXT,
  region TEXT,
  city TEXT,
  postal TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  timezone TEXT,
  
  -- ISP / Network
  isp TEXT,
  org TEXT,
  asn TEXT,
  as_name TEXT,
  
  -- Proxy/VPN/Tor detection
  is_vpn BOOLEAN DEFAULT false,
  is_proxy BOOLEAN DEFAULT false,
  is_tor BOOLEAN DEFAULT false,
  is_datacenter BOOLEAN DEFAULT false,
  is_mobile BOOLEAN DEFAULT false,
  is_crawler BOOLEAN DEFAULT false,
  
  -- Risk scoring
  fraud_score INTEGER DEFAULT 0,
  abuse_score INTEGER DEFAULT 0,
  risk_level TEXT DEFAULT 'unknown', -- low, medium, high, critical
  
  -- Blacklist status
  is_blacklisted BOOLEAN DEFAULT false,
  blacklist_reports INTEGER DEFAULT 0,
  blacklist_confidence INTEGER DEFAULT 0,
  
  -- Source tracking
  sources_checked TEXT[], -- ['ipinfo', 'ipqs', 'abuseipdb']
  last_checked_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata
  raw_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ip_intelligence_risk ON ip_intelligence(risk_level);
CREATE INDEX IF NOT EXISTS idx_ip_intelligence_vpn ON ip_intelligence(is_vpn) WHERE is_vpn = true;
CREATE INDEX IF NOT EXISTS idx_ip_intelligence_blacklisted ON ip_intelligence(is_blacklisted) WHERE is_blacklisted = true;
CREATE INDEX IF NOT EXISTS idx_ip_intelligence_last_checked ON ip_intelligence(last_checked_at);

-- Client-side fingerprint table (from FingerprintJS)
CREATE TABLE IF NOT EXISTS client_fingerprints (
  id SERIAL PRIMARY KEY,
  visitor_id TEXT NOT NULL, -- FingerprintJS visitor ID
  request_id TEXT, -- Optional request correlation
  
  -- Browser fingerprint components
  user_agent TEXT,
  platform TEXT,
  screen_resolution TEXT,
  timezone TEXT,
  language TEXT,
  color_depth INTEGER,
  hardware_concurrency INTEGER,
  device_memory INTEGER,
  touch_support BOOLEAN DEFAULT false,
  
  -- Canvas/WebGL fingerprint hashes
  canvas_hash TEXT,
  webgl_hash TEXT,
  webgl_vendor TEXT,
  webgl_renderer TEXT,
  
  -- Audio fingerprint
  audio_hash TEXT,
  
  -- Font detection
  fonts_hash TEXT,
  
  -- WebRTC leak detection
  webrtc_local_ip TEXT,
  webrtc_public_ip TEXT,
  webrtc_leak_detected BOOLEAN DEFAULT false,
  
  -- Confidence and bot detection
  confidence_score DOUBLE PRECISION,
  bot_probability DOUBLE PRECISION,
  incognito_detected BOOLEAN DEFAULT false,
  
  -- Association
  server_fingerprint TEXT, -- Link to server-computed fingerprint
  ip TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_fingerprints_visitor ON client_fingerprints(visitor_id);
CREATE INDEX IF NOT EXISTS idx_client_fingerprints_ip ON client_fingerprints(ip);
CREATE INDEX IF NOT EXISTS idx_client_fingerprints_webrtc_leak ON client_fingerprints(webrtc_leak_detected) WHERE webrtc_leak_detected = true;
CREATE INDEX IF NOT EXISTS idx_client_fingerprints_created ON client_fingerprints(created_at);

-- Security decisions log (when we block/challenge based on intelligence)
CREATE TABLE IF NOT EXISTS security_decisions (
  id SERIAL PRIMARY KEY,
  ip TEXT,
  fingerprint TEXT,
  visitor_id TEXT,
  
  decision TEXT NOT NULL, -- 'allow', 'block', 'challenge', 'flag'
  reason TEXT NOT NULL, -- 'vpn_detected', 'high_risk_score', 'blacklisted', etc.
  
  -- Context
  request_path TEXT,
  request_method TEXT,
  user_agent TEXT,
  
  -- Intelligence snapshot
  risk_level TEXT,
  fraud_score INTEGER,
  is_vpn BOOLEAN,
  is_proxy BOOLEAN,
  country_code TEXT,
  
  -- Outcome
  was_challenged BOOLEAN DEFAULT false,
  challenge_passed BOOLEAN,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_decisions_ip ON security_decisions(ip);
CREATE INDEX IF NOT EXISTS idx_security_decisions_decision ON security_decisions(decision);
CREATE INDEX IF NOT EXISTS idx_security_decisions_created ON security_decisions(created_at);
