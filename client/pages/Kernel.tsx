import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// CSS for flashing red animation
const flashingStyles = `
@keyframes flash-red {
  0%, 100% { 
    background-color: rgba(239, 68, 68, 0.3);
    border-color: rgba(239, 68, 68, 0.8);
    box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
  }
  50% { 
    background-color: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.4);
    box-shadow: 0 0 5px rgba(239, 68, 68, 0.2);
  }
}
.threat-flash {
  animation: flash-red 1s ease-in-out infinite;
}
.threat-row {
  background-color: rgba(239, 68, 68, 0.15) !important;
  border-left: 3px solid rgb(239, 68, 68) !important;
}
.threat-row:hover {
  background-color: rgba(239, 68, 68, 0.25) !important;
}
`;

type Summary = {
  days: number;
  blockedByCountry: Array<{ country_code: string; count: number }>;
  topIps: Array<{ ip: string; count: number }>;
  repeatFingerprints: Array<{ fingerprint: string; ip: string; user_agent: string; count: number; last_seen: string }>;
};

type SecurityEvent = {
  id: number;
  created_at: string;
  event_type: string;
  severity: string;
  method: string | null;
  path: string | null;
  status_code: number | null;
  ip: string | null;
  country_code: string | null;
  fingerprint: string | null;
  user_agent: string | null;
};

type KernelStatus = {
  environment: {
    nodeEnv: string;
    isRender: boolean;
    renderServiceId: string | null;
    renderServiceName: string | null;
    renderExternalUrl: string | null;
  };
  server: {
    now: string;
    hostname: string;
    pid: number;
    node: string;
    uptimeSeconds: number;
  };
  db?: {
    database?: string;
    server_addr?: string;
    server_port?: number;
    server_version?: string;
    error?: string;
  } | null;
};

type TrafficSummary = {
  minutes: number;
  total: number;
  byStatus: Array<{ status: number; count: number }>;
  topPaths: Array<{ path: string; count: number }>;
  topIps: Array<{ ip: string; count: number }>;
};

type TrafficRow = {
  ts: number;
  method: string;
  path: string;
  status: number;
  ip: string | null;
  country_code: string | null;
  user_agent: string | null;
  fingerprint: string | null;
  user_id: string | null;
  user_type: string | null;
  role: string | null;
  ms: number;
};

type IpBlock = {
  ip: string;
  reason: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type LinuxActor = {
  actor_key: string;
  ua_class?: 'linux' | 'unknown_ua';
  fingerprint: string | null;
  ip: string | null;
  country_code: string | null;
  user_agent: string | null;
  user_id: string | null;
  user_type: string | null;
  role: string | null;
  total_events: number;
  suspicious_events: number;
  trap_hits: number;
  admin_forbidden: number;
  suspicious_path: number;
  first_seen: string;
  last_seen: string;
  is_trusted?: boolean;
  trusted_label?: string | null;
  emergency: boolean;
  // IP Intelligence
  intel?: {
    isp: string | null;
    org: string | null;
    asn: string | null;
    is_vpn: boolean;
    is_proxy: boolean;
    is_tor: boolean;
    is_datacenter: boolean;
    is_blacklisted: boolean;
    fraud_score: number;
    abuse_score: number;
    risk_level: string;
  } | null;
};

type ActorDetails = {
  fingerprint: string | null;
  ip: string | null;
  topPaths: Array<{ path: string; count: number }>;
  eventTypes: Array<{ event_type: string; count: number }>;
  events: Array<SecurityEvent & { metadata?: any; request_id?: string | null; region?: string | null; city?: string | null; user_id?: string | null; user_type?: string | null; role?: string | null }>;
};

type IntelStats = {
  days: number;
  cache: {
    total_cached: number;
    vpn_count: number;
    proxy_count: number;
    tor_count: number;
    blacklisted_count: number;
    checked_today: number;
  };
  decisions: Array<{ decision: string; count: number }>;
  fingerprints: {
    total: number;
    webrtc_leaks: number;
    incognito_users: number;
    unique_visitors: number;
  };
  risk_distribution: Array<{ risk_level: string; count: number }>;
};

type IPIntelCache = {
  ip: string;
  country_code: string | null;
  isp: string | null;
  org: string | null;
  asn: string | null;
  is_vpn: boolean;
  is_proxy: boolean;
  is_tor: boolean;
  is_datacenter: boolean;
  is_blacklisted: boolean;
  fraud_score: number;
  abuse_score: number;
  risk_level: string;
  last_checked_at: string;
};

export default function Kernel() {
  const [token, setToken] = React.useState<string | null>(null);
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string>("");

  const [days, setDays] = React.useState(7);
  const [loading, setLoading] = React.useState(false);
  const [summary, setSummary] = React.useState<Summary | null>(null);
  const [events, setEvents] = React.useState<SecurityEvent[]>([]);

  const [status, setStatus] = React.useState<KernelStatus | null>(null);
  const [trafficMinutes, setTrafficMinutes] = React.useState(15);
  const [trafficSummary, setTrafficSummary] = React.useState<TrafficSummary | null>(null);
  const [traffic, setTraffic] = React.useState<TrafficRow[]>([]);

  const [blocks, setBlocks] = React.useState<IpBlock[]>([]);
  const [blockIp, setBlockIp] = React.useState('');
  const [blockReason, setBlockReason] = React.useState('');

  const [me, setMe] = React.useState<{ ip: string | null; user_agent: string | null; fingerprint: string | null; trusted?: any } | null>(null);

  const [linuxDays, setLinuxDays] = React.useState(7);
  const [linuxActors, setLinuxActors] = React.useState<LinuxActor[]>([]);
  const [openActorKey, setOpenActorKey] = React.useState<string | null>(null);
  const [actorDetails, setActorDetails] = React.useState<Record<string, ActorDetails | null>>({});

  // IP Intelligence state
  const [intelStats, setIntelStats] = React.useState<IntelStats | null>(null);
  const [intelCache, setIntelCache] = React.useState<IPIntelCache[]>([]);
  const [lookupIp, setLookupIp] = React.useState('');
  const [lookupResult, setLookupResult] = React.useState<IPIntelCache | null>(null);
  const [lookupLoading, setLookupLoading] = React.useState(false);

  // Threat tracking - IPs and fingerprints flagged as threats
  const [threatIps, setThreatIps] = React.useState<Set<string>>(new Set());
  const [threatFingerprints, setThreatFingerprints] = React.useState<Set<string>>(new Set());
  const [testThreatIp, setTestThreatIp] = React.useState('');

  // Emergency actors - must be defined before useEffect that uses it
  const emergencyActors = React.useMemo(() => {
    return linuxActors.filter((a) => !a.is_trusted && ((a.trap_hits || 0) > 0 || (a.admin_forbidden || 0) > 0));
  }, [linuxActors]);

  // Compute threat sets from various sources
  // ONLY active/new threats flash - blocked IPs are handled (no flash)
  React.useEffect(() => {
    const ips = new Set<string>();
    const fps = new Set<string>();
    
    // Get set of blocked IPs to exclude from flashing
    const blockedIpSet = new Set<string>();
    blocks.forEach(b => {
      if (b.is_active && b.ip) blockedIpSet.add(b.ip);
    });
    
    // Helper: only add if NOT already blocked
    const addIfNotBlocked = (ip: string | null | undefined) => {
      if (ip && !blockedIpSet.has(ip)) ips.add(ip);
    };
    
    // Add emergency actors (trap hits, admin forbidden) - only if NOT blocked
    emergencyActors.forEach(a => {
      addIfNotBlocked(a.ip);
      if (a.fingerprint) fps.add(a.fingerprint);
    });
    
    // Add blacklisted/VPN/Tor from intel cache - only if NOT blocked
    intelCache.forEach(c => {
      if (c.is_blacklisted || c.is_tor || c.risk_level === 'critical' || c.risk_level === 'high') {
        addIfNotBlocked(c.ip);
      }
      // Non-Algeria = 100% threat (but server auto-blocks these, so they get blocked)
      // Only flash if somehow not blocked yet
      if (c.country_code && c.country_code !== 'DZ') {
        addIfNotBlocked(c.ip);
      }
    });
    
    // HIGH-SEVERITY events - only if NOT blocked
    events.forEach(ev => {
      if (ev.severity === 'error' || ev.event_type === 'trap_hit' || ev.event_type === 'admin_forbidden') {
        addIfNotBlocked(ev.ip);
        if (ev.fingerprint) fps.add(ev.fingerprint);
      }
      // Non-Algeria events = threat (server should auto-block, but flash if not blocked yet)
      if (ev.country_code && ev.country_code !== 'DZ') {
        addIfNotBlocked(ev.ip);
      }
    });
    
    // Traffic from non-Algeria - flash if NOT blocked yet (server should block these)
    traffic.forEach(t => {
      if (t.country_code && t.country_code !== 'DZ') {
        addIfNotBlocked(t.ip);
      }
    });
    
    // Linux actors from non-Algeria - flash if NOT blocked
    linuxActors.forEach(a => {
      if (a.country_code && a.country_code !== 'DZ') {
        addIfNotBlocked(a.ip);
      }
    });
    
    setThreatIps(ips);
    setThreatFingerprints(fps);
  }, [emergencyActors, intelCache, blocks, events, traffic, linuxActors]);

  // Track IPs pending auto-block (non-DZ IPs detected)
  const [pendingAutoBlock, setPendingAutoBlock] = React.useState<Set<string>>(new Set());
  
  // Detect non-DZ IPs that need auto-blocking
  React.useEffect(() => {
    const toBlock = new Set<string>();
    
    // Get already blocked IPs
    const blockedIpSet = new Set<string>();
    blocks.forEach(b => {
      if (b.ip) blockedIpSet.add(b.ip);
    });
    
    // Check traffic for non-DZ IPs
    traffic.forEach(t => {
      if (t.ip && t.country_code && t.country_code !== 'DZ' && !blockedIpSet.has(t.ip)) {
        toBlock.add(t.ip);
      }
    });
    
    // Check events for non-DZ IPs  
    events.forEach(ev => {
      if (ev.ip && ev.country_code && ev.country_code !== 'DZ' && !blockedIpSet.has(ev.ip)) {
        toBlock.add(ev.ip);
      }
    });
    
    // Check Linux actors for non-DZ
    linuxActors.forEach(a => {
      if (a.ip && a.country_code && a.country_code !== 'DZ' && !blockedIpSet.has(a.ip)) {
        toBlock.add(a.ip);
      }
    });
    
    // Check intel cache for non-DZ
    intelCache.forEach(c => {
      if (c.ip && c.country_code && c.country_code !== 'DZ' && !blockedIpSet.has(c.ip)) {
        toBlock.add(c.ip);
      }
    });
    
    if (toBlock.size > 0) {
      setPendingAutoBlock(toBlock);
    }
  }, [traffic, events, linuxActors, intelCache, blocks]);

  // Helper to check if an IP or fingerprint is a threat
  const isThreat = (ip?: string | null, fingerprint?: string | null): boolean => {
    if (ip && threatIps.has(ip)) return true;
    if (fingerprint && threatFingerprints.has(fingerprint)) return true;
    return false;
  };

  // Test function to simulate a threat
  const simulateThreat = () => {
    const testIp = testThreatIp.trim() || '192.168.99.99';
    setThreatIps(prev => new Set([...prev, testIp]));
    setError('');
    // Auto-remove after 30 seconds
    setTimeout(() => {
      setThreatIps(prev => {
        const next = new Set(prev);
        next.delete(testIp);
        return next;
      });
    }, 30000);
  };

  const myUaClass = React.useMemo(() => {
    const ua = (me?.user_agent || '').trim();
    if (!ua) return 'unknown_ua';
    if (/Android/i.test(ua)) return 'android';
    if (/Linux/i.test(ua)) return 'linux';
    return 'other';
  }, [me?.user_agent]);

  React.useEffect(() => {
    if (!token) return;
    if (openActorKey) return;
    if (emergencyActors.length === 0) return;
    const first = emergencyActors[0];
    setOpenActorKey(first.actor_key);
    void loadActor(first.actor_key, first.fingerprint, first.ip);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, emergencyActors.length]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/kernel/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Login failed");
      }

      setToken("ok");
      setPassword("");
    } catch (e: any) {
      setError(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await fetch('/api/kernel/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setToken(null);
    setSummary(null);
    setEvents([]);
  }

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const [statusRes, meRes, summaryRes, eventsRes, trafficSummaryRes, trafficRes, blocksRes, linuxRes] = await Promise.all([
        fetch(`/api/kernel/status`),
        fetch(`/api/kernel/security/me`),
        fetch(`/api/kernel/security/summary?days=${days}`),
        fetch(`/api/kernel/security/events?limit=200`),
        fetch(`/api/kernel/traffic/summary?minutes=${trafficMinutes}`),
        fetch(`/api/kernel/traffic/recent?limit=200`),
        fetch(`/api/kernel/blocks`),
        fetch(`/api/kernel/security/linux/watchlist?days=${linuxDays}&limit=60`),
      ]);

      if (!statusRes.ok) throw new Error("Failed to load status");
      if (!meRes.ok) throw new Error('Failed to load device fingerprint');
      if (!summaryRes.ok) throw new Error("Failed to load summary");
      if (!eventsRes.ok) throw new Error("Failed to load events");
      if (!trafficSummaryRes.ok) throw new Error("Failed to load traffic summary");
      if (!trafficRes.ok) throw new Error("Failed to load traffic");
      if (!blocksRes.ok) throw new Error("Failed to load blocks");
      if (!linuxRes.ok) throw new Error("Failed to load Linux watchlist");

      const statusData = await statusRes.json();
      const meData = await meRes.json();
      const summaryData = await summaryRes.json();
      const eventsData = await eventsRes.json();
      const trafficSummaryData = await trafficSummaryRes.json();
      const trafficData = await trafficRes.json();
      const blocksData = await blocksRes.json();
      const linuxData = await linuxRes.json();

      setStatus(statusData);
      setMe(meData);
      setSummary(summaryData);
      setEvents(eventsData?.events || []);
      setTrafficSummary(trafficSummaryData);
      setTraffic(trafficData?.events || []);
      setBlocks(blocksData?.blocks || []);
      setLinuxActors(linuxData?.actors || []);
      
      // Load IP Intelligence stats (separate try to not break main load)
      try {
        const [intelStatsRes, intelCacheRes] = await Promise.all([
          fetch(`/api/intel/admin/stats?days=${days}`),
          fetch(`/api/intel/admin/cache?limit=50`),
        ]);
        if (intelStatsRes.ok) {
          const statsData = await intelStatsRes.json();
          setIntelStats(statsData);
        }
        if (intelCacheRes.ok) {
          const cacheData = await intelCacheRes.json();
          setIntelCache(cacheData?.cache || []);
        }
      } catch {
        // Intel endpoints may not exist yet, ignore
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load kernel data");
    } finally {
      setLoading(false);
    }
  }

  async function lookupIpIntel() {
    if (!token || !lookupIp.trim()) return;
    setLookupLoading(true);
    setLookupResult(null);
    try {
      const res = await fetch(`/api/intel/admin/lookup/${encodeURIComponent(lookupIp.trim())}`);
      if (!res.ok) throw new Error('Lookup failed');
      const data = await res.json();
      setLookupResult(data);
    } catch (e: any) {
      setError(e?.message || 'IP lookup failed');
    } finally {
      setLookupLoading(false);
    }
  }

  async function trustThisDevice() {
    if (!token || !me?.fingerprint) return;
    setError('');
    try {
      const res = await fetch('/api/kernel/security/trusted', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fingerprint: me.fingerprint, ip: me.ip, label: 'my_device' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to trust device');
      await loadAll();
    } catch (e: any) {
      setError(e?.message || 'Failed to trust device');
    }
  }

  async function loadActor(key: string, fingerprint: string | null, ip: string | null) {
    if (!token) return;
    if (actorDetails[key]) return;
    setActorDetails((prev) => ({ ...prev, [key]: null }));
    try {
      const qs = fingerprint ? `fingerprint=${encodeURIComponent(fingerprint)}` : `ip=${encodeURIComponent(ip || '')}`;
      const res = await fetch(`/api/kernel/security/actor/events?${qs}&limit=200`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to load actor');
      setActorDetails((prev) => ({ ...prev, [key]: data }));
    } catch (e) {
      setActorDetails((prev) => ({ ...prev, [key]: null }));
    }
  }

  async function blockIpNow(ip: string, reason?: string) {
    if (!token) return;
    setError('');
    try {
      const res = await fetch('/api/kernel/blocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ip, reason: reason || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to block IP');
      setBlockIp('');
      setBlockReason('');
      await loadAll();
    } catch (e: any) {
      setError(e?.message || 'Failed to block IP');
    }
  }

  async function unblockIpNow(ip: string) {
    if (!token) return;
    setError('');
    try {
      const res = await fetch(`/api/kernel/blocks/${encodeURIComponent(ip)}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to unblock IP');
      await loadAll();
    } catch (e: any) {
      setError(e?.message || 'Failed to unblock IP');
    }
  }

  // Clear security events functions
  async function clearAllEvents() {
    if (!token) return;
    if (!confirm('Are you sure you want to delete ALL security events? This cannot be undone.')) return;
    setError('');
    try {
      const res = await fetch('/api/kernel/security/events?confirm=yes', {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to clear events');
      alert(`Cleared ${data.deleted || 0} events`);
      await loadAll();
    } catch (e: any) {
      setError(e?.message || 'Failed to clear events');
    }
  }

  async function clearLocalhostEvents() {
    if (!token) return;
    setError('');
    try {
      const res = await fetch('/api/kernel/security/events/localhost', {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to clear localhost events');
      alert(`Cleared ${data.deleted || 0} localhost events`);
      await loadAll();
    } catch (e: any) {
      setError(e?.message || 'Failed to clear localhost events');
    }
  }

  async function clearEventsByIp(ip: string) {
    if (!token || !ip) return;
    if (!confirm(`Delete all events for IP: ${ip}?`)) return;
    setError('');
    try {
      const res = await fetch(`/api/kernel/security/events/ip/${encodeURIComponent(ip)}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to clear events');
      alert(`Cleared ${data.deleted || 0} events for ${ip}`);
      await loadAll();
    } catch (e: any) {
      setError(e?.message || 'Failed to clear events');
    }
  }

  async function clearEventsByFingerprint(fp: string) {
    if (!token || !fp) return;
    if (!confirm(`Delete all events for fingerprint: ${fp.slice(0, 20)}...?`)) return;
    setError('');
    try {
      const res = await fetch(`/api/kernel/security/events/fingerprint/${encodeURIComponent(fp)}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to clear events');
      alert(`Cleared ${data.deleted || 0} events`);
      await loadAll();
    } catch (e: any) {
      setError(e?.message || 'Failed to clear events');
    }
  }

  // AUTO-BLOCK: Immediately block any non-DZ IP detected
  React.useEffect(() => {
    if (!token || pendingAutoBlock.size === 0) return;
    
    const autoBlockAll = async () => {
      for (const ip of pendingAutoBlock) {
        try {
          await fetch('/api/kernel/blocks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ip, reason: 'AUTO:non_dz_geo' }),
          });
        } catch (e) {
          console.error('Auto-block failed for', ip, e);
        }
      }
      setPendingAutoBlock(new Set());
      // Refresh data
      await loadAll();
    };
    
    void autoBlockAll();
  }, [token, pendingAutoBlock]);

  React.useEffect(() => {
    if (token) {
      void loadAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, days, trafficMinutes, linuxDays]);

  if (!token) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-background text-foreground flex items-center justify-center p-4">
        <div className="w-full max-w-md border border-border rounded-xl bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-black tracking-tight">Kernel</h1>
            <span className="text-[10px] text-muted-foreground">root-only</span>
          </div>

          {error && (
            <div className="mb-3 text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
              {error}
            </div>
          )}

          <form onSubmit={login} className="space-y-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Username</label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="root" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-3 text-[10px] text-muted-foreground">
            Not linked anywhere. Access requires kernel credentials.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background text-foreground p-4">
      {/* Inject flashing styles */}
      <style dangerouslySetInnerHTML={{ __html: flashingStyles }} />
      
      {/* Global Threat Alert Banner */}
      {(threatIps.size > 0 || threatFingerprints.size > 0) && (
        <div className="fixed top-0 left-0 right-0 z-50 threat-flash">
          <div className="bg-red-600 text-white text-center py-2 px-4 flex items-center justify-center gap-3">
            <span className="text-lg">🚨</span>
            <span className="font-bold text-sm">
              ACTIVE THREATS DETECTED: {threatIps.size} IPs, {threatFingerprints.size} fingerprints
            </span>
            <span className="text-lg">🚨</span>
          </div>
        </div>
      )}
      
      <div className={`max-w-6xl mx-auto ${(threatIps.size > 0 || threatFingerprints.size > 0) ? 'mt-10' : ''}`}>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div>
            <h1 className="text-xl font-black tracking-tight">Kernel Security</h1>
            <p className="text-xs text-muted-foreground">Blocked by country • Top attacker IPs • Repeat fingerprints</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Days</span>
              <Input
                value={String(days)}
                onChange={(e) => setDays(Math.max(1, Math.min(90, parseInt(e.target.value || "7", 10) || 7)))}
                className="w-20"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Traffic (min)</span>
              <Input
                value={String(trafficMinutes)}
                onChange={(e) => setTrafficMinutes(Math.max(1, Math.min(180, parseInt(e.target.value || '15', 10) || 15)))}
                className="w-24"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Linux (days)</span>
              <Input
                value={String(linuxDays)}
                onChange={(e) => setLinuxDays(Math.max(1, Math.min(90, parseInt(e.target.value || '7', 10) || 7)))}
                className="w-24"
              />
            </div>
            <Button variant="outline" onClick={() => token && loadAll()} disabled={loading}>
              Refresh
            </Button>
            <Button variant="destructive" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>

        {/* Threat Test Panel */}
        <div className="mb-4 border border-border rounded-xl bg-card p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold">🧪 Threat Simulation</span>
              <Input
                value={testThreatIp}
                onChange={(e) => setTestThreatIp(e.target.value)}
                placeholder="IP to flag (or leave empty for test IP)"
                className="w-64 h-8 text-xs"
              />
              <Button 
                variant="destructive" 
                className="h-8 px-3 text-xs"
                onClick={simulateThreat}
              >
                Simulate Threat
              </Button>
              {(threatIps.size > 0 || threatFingerprints.size > 0) && (
                <Button 
                  variant="outline" 
                  className="h-8 px-3 text-xs border-green-500/50 text-green-400 hover:bg-green-500/10"
                  onClick={() => {
                    setThreatIps(new Set());
                    setThreatFingerprints(new Set());
                  }}
                >
                  ✓ Clear All Threats
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Active threats:</span>
              <span className={`font-bold ${threatIps.size > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {threatIps.size} IPs
              </span>
              <span className={`font-bold ${threatFingerprints.size > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {threatFingerprints.size} fingerprints
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-3 text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
            {error}
          </div>
        )}

        {emergencyActors.length > 0 && (
          <div className="mb-4 border border-red-500/30 bg-red-500/10 rounded-xl p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-sm font-black text-red-100">EMERGENCY MODE</div>
                <div className="text-[11px] text-red-200/80">
                  {emergencyActors.length} suspicious actor(s) hit traps/admin without access. Tracking details below.
                </div>
              </div>
              <Button
                variant="destructive"
                className="h-8 px-3 text-xs"
                onClick={() => {
                  const first = emergencyActors[0];
                  setOpenActorKey(first.actor_key);
                  void loadActor(first.actor_key, first.fingerprint, first.ip);
                }}
              >
                Focus
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="border border-border rounded-xl bg-card p-3">
            <h2 className="text-sm font-bold mb-2">Environment</h2>
            {!status ? (
              <div className="text-xs text-muted-foreground">Loading…</div>
            ) : (
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Server</span>
                  <span className="text-foreground font-semibold">{status.environment.isRender ? 'Render' : 'Local'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">NODE_ENV</span>
                  <span className="text-foreground">{status.environment.nodeEnv}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Host</span>
                  <span className="text-foreground truncate max-w-[220px]" title={status.server.hostname}>{status.server.hostname}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Uptime</span>
                  <span className="text-foreground">{Math.floor(status.server.uptimeSeconds / 60)}m</span>
                </div>
                {status.environment.renderExternalUrl && (
                  <div className="text-[10px] text-muted-foreground truncate" title={status.environment.renderExternalUrl}>
                    {status.environment.renderExternalUrl}
                  </div>
                )}
                {status.db?.database && (
                  <div className="mt-2 text-[10px] text-muted-foreground">
                    DB: {status.db.database}{status.db.server_addr ? ` @ ${status.db.server_addr}:${status.db.server_port}` : ''}
                  </div>
                )}
                {status.db?.error && (
                  <div className="mt-2 text-[10px] text-red-300">DB: {status.db.error}</div>
                )}
              </div>
            )}
          </div>

          <div className="border border-border rounded-xl bg-card p-3">
            <h2 className="text-sm font-bold mb-2">This Device</h2>
            {!me ? (
              <div className="text-xs text-muted-foreground">Loading…</div>
            ) : (
              <div className="space-y-2">
                <div className="text-[10px] text-muted-foreground break-words">fp: {me.fingerprint || '(none)'}</div>
                <div className="text-[10px] text-muted-foreground">ip: {me.ip || ''}</div>
                <div className="text-[10px] text-muted-foreground truncate" title={me.user_agent || ''}>ua: {me.user_agent || '(missing)'}</div>
                <div className="text-[10px] text-muted-foreground">
                  ua_class: {myUaClass} • excluded from watchlist
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={me.trusted ? 'outline' : 'default'}
                    className="h-8 px-3 text-xs"
                    disabled={!me.fingerprint || !!me.trusted}
                    onClick={trustThisDevice}
                  >
                    {me.trusted ? 'Trusted' : 'Mark Trusted'}
                  </Button>
                  {me.trusted?.label && (
                    <span className="text-[10px] text-muted-foreground">{me.trusted.label}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="border border-border rounded-xl bg-card p-3">
            <h2 className="text-sm font-bold mb-2">Traffic Summary (suspicious only)</h2>
            {!trafficSummary ? (
              <div className="text-xs text-muted-foreground">No suspicious traffic</div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Last {trafficSummary.minutes}m</span>
                  <span className="text-foreground font-semibold">{trafficSummary.total} req</span>
                </div>
                <div className="space-y-1">
                  {(trafficSummary.byStatus || []).slice(0, 6).map((r) => (
                    <div key={r.status} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{r.status}</span>
                      <span className="text-foreground font-semibold">{r.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="border border-border rounded-xl bg-card p-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold">Recent Traffic (suspicious only)</h2>
              <span className="text-[10px] text-muted-foreground">last 200</span>
            </div>
            <div className="overflow-auto">
              <table className="w-full text-xs">
                <thead className="text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-2">Time</th>
                    <th className="text-left py-2 pr-2">Method</th>
                    <th className="text-left py-2 pr-2">Path</th>
                    <th className="text-left py-2 pr-2">Status</th>
                    <th className="text-left py-2 pr-2">IP</th>
                    <th className="text-left py-2 pr-2">Block</th>
                  </tr>
                </thead>
                <tbody>
                  {traffic.map((r, idx) => {
                    const isThrt = isThreat(r.ip, r.fingerprint);
                    return (
                    <tr key={idx} className={`border-b border-border ${isThrt ? 'threat-row threat-flash' : 'hover:bg-muted/40'}`}>
                      <td className="py-2 pr-2 whitespace-nowrap text-muted-foreground">{new Date(r.ts).toLocaleString()}</td>
                      <td className="py-2 pr-2 text-foreground">{r.method}</td>
                      <td className="py-2 pr-2 text-foreground truncate max-w-[360px]" title={r.path}>{r.path}</td>
                      <td className="py-2 pr-2 text-foreground">{r.status}</td>
                      <td className="py-2 pr-2 text-foreground truncate max-w-[200px]" title={r.ip || ''}>
                        <div className="flex items-center gap-2">
                          <span className={`truncate ${isThrt ? 'text-red-400 font-bold' : ''}`} title={r.ip || ''}>{r.ip || ''}</span>
                          {isThrt && <span className="text-[10px] px-1 py-0.5 rounded bg-red-500 text-white font-bold">THREAT</span>}
                          {me?.fingerprint && r.fingerprint && me.fingerprint === r.fingerprint && (
                            <span className="text-[10px] px-2 py-1 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-100">Mine</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 pr-2">
                        <Button
                          variant={isThrt ? "destructive" : "outline"}
                          className="h-7 px-2 text-[10px]"
                          disabled={!r.ip || (!!me?.ip && r.ip === me.ip)}
                          onClick={() => r.ip && blockIpNow(r.ip, `traffic:${r.path}`)}
                        >
                          Block
                        </Button>
                      </td>
                    </tr>
                    );
                  })}
                  {traffic.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-4 text-muted-foreground">No suspicious traffic captured</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border border-border rounded-xl bg-card p-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold">Blocked IPs</h2>
              <span className="text-[10px] text-muted-foreground">last 500</span>
            </div>
            <div className="space-y-2">
              {blocks.filter((b) => b.is_active).slice(0, 20).map((b) => (
                <div key={b.ip} className="border border-border rounded-lg p-2 bg-muted/30">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs text-foreground truncate" title={b.ip}>{b.ip}</div>
                      {b.reason && <div className="text-[10px] text-muted-foreground truncate" title={b.reason}>{b.reason}</div>}
                    </div>
                    <Button variant="destructive" className="h-7 px-2 text-[10px]" onClick={() => unblockIpNow(b.ip)}>
                      Unblock
                    </Button>
                  </div>
                </div>
              ))}
              {blocks.filter((b) => b.is_active).length === 0 && (
                <div className="text-xs text-muted-foreground">No active blocks</div>
              )}
            </div>
          </div>
        </div>

        <div className="border border-border rounded-xl bg-card p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-bold">Linux Watchlist</h2>
                <p className="text-[10px] text-muted-foreground">Linux UA (excluding Android) + UA-missing scanners that hit traps/admin/probes. Emergency = trap hit or forbidden admin access.</p>
            </div>
            <span className="text-[10px] text-muted-foreground">top 60</span>
          </div>

          <div className="overflow-auto">
            <table className="w-full text-xs">
              <thead className="text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-2">Last Seen</th>
                  <th className="text-left py-2 pr-2">IP</th>
                  <th className="text-left py-2 pr-2">CC</th>
                  <th className="text-left py-2 pr-2">ISP</th>
                  <th className="text-left py-2 pr-2">VPN</th>
                  <th className="text-left py-2 pr-2">Proxy</th>
                  <th className="text-left py-2 pr-2">Tor</th>
                  <th className="text-left py-2 pr-2">Risk</th>
                  <th className="text-left py-2 pr-2">UA</th>
                  <th className="text-left py-2 pr-2">Trap</th>
                  <th className="text-left py-2 pr-2">403</th>
                  <th className="text-left py-2 pr-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {linuxActors.map((a) => {
                  const isOpen = openActorKey === a.actor_key;
                  const emergency = a.emergency;
                  const uaMissing = (a.ua_class || 'linux') === 'unknown_ua';
                  const trusted = !!a.is_trusted;
                  const linuxThreat = isThreat(a.ip || '', a.fingerprint || '');
                  const intel = a.intel;
                  const rowClass = linuxThreat
                    ? 'threat-row threat-flash'
                    : emergency
                    ? 'bg-red-500/10'
                    : uaMissing
                      ? 'bg-fuchsia-500/10'
                      : a.suspicious_events > 0
                      ? 'bg-amber-500/10'
                      : '';
                  return (
                    <React.Fragment key={a.actor_key}>
                      <tr className={`border-b border-border hover:bg-muted/40 ${rowClass}`}>
                        <td className="py-2 pr-2 whitespace-nowrap text-muted-foreground text-[10px]">{new Date(a.last_seen).toLocaleString()}</td>
                        <td className={`py-2 pr-2 truncate max-w-[140px] text-[10px] ${linuxThreat ? 'text-red-500 font-semibold' : 'text-foreground'}`} title={a.ip || ''}>
                          {linuxThreat && <span className="mr-1">⚠️</span>}
                          {a.ip || ''}
                        </td>
                        <td className="py-2 pr-2 text-foreground text-[10px]">{a.country_code || ''}</td>
                        <td className="py-2 pr-2 text-foreground text-[10px] truncate max-w-[100px]" title={intel?.isp || ''}>{intel?.isp || '-'}</td>
                        <td className="py-2 pr-2 text-[10px]">{intel?.is_vpn ? '🔴' : '🟢'}</td>
                        <td className="py-2 pr-2 text-[10px]">{intel?.is_proxy ? '🔴' : '🟢'}</td>
                        <td className="py-2 pr-2 text-[10px]">{intel?.is_tor ? '🔴' : '🟢'}</td>
                        <td className={`py-2 pr-2 text-[10px] ${
                          intel?.risk_level === 'critical' ? 'text-red-400 font-bold' :
                          intel?.risk_level === 'high' ? 'text-orange-400' :
                          intel?.risk_level === 'medium' ? 'text-amber-400' : 'text-green-400'
                        }`}>{intel?.risk_level || '-'}</td>
                        <td className="py-2 pr-2">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                            uaMissing
                              ? 'border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-100'
                              : 'border-border bg-muted/40 text-foreground'
                          }`}>
                            {uaMissing ? 'No UA' : 'Linux'}
                          </span>
                        </td>
                        <td className="py-2 pr-2 text-foreground text-[10px]">{a.trap_hits}</td>
                        <td className="py-2 pr-2 text-foreground text-[10px]">{a.admin_forbidden}</td>
                        <td className="py-2 pr-2">
                          <div className="flex items-center gap-1">
                            {a.ip && (
                              <Button
                                variant={trusted ? 'outline' : (emergency ? 'destructive' : 'outline')}
                                className="h-6 px-2 text-[9px]"
                                disabled={trusted || (!!me?.ip && a.ip === me.ip)}
                                onClick={() => blockIpNow(a.ip!, emergency ? 'EMERGENCY:linux_actor' : 'linux_actor')}
                              >
                                Block
                              </Button>
                            )}
                            {trusted && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-100">
                                OK
                              </span>
                            )}
                            <Button
                              variant="outline"
                              className="h-6 px-2 text-[9px]"
                              onClick={() => {
                                const next = isOpen ? null : a.actor_key;
                                setOpenActorKey(next);
                                if (!isOpen) void loadActor(a.actor_key, a.fingerprint, a.ip);
                              }}
                            >
                              {isOpen ? '▲' : '▼'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="border-b border-border">
                          <td colSpan={12} className="py-3">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                              {/* IP Intelligence Panel */}
                              <div className="border border-border rounded-lg p-3 bg-muted/30">
                                <div className="text-xs font-semibold mb-2">🔍 IP Intelligence</div>
                                {intel ? (
                                  <div className="space-y-1 text-[10px]">
                                    <div><span className="text-muted-foreground">IP:</span> <span className="font-mono">{a.ip}</span></div>
                                    <div><span className="text-muted-foreground">Country:</span> {a.country_code || 'Unknown'}</div>
                                    <div><span className="text-muted-foreground">ISP:</span> {intel.isp || 'Unknown'}</div>
                                    <div><span className="text-muted-foreground">Org:</span> {intel.org || 'Unknown'}</div>
                                    <div><span className="text-muted-foreground">ASN:</span> {intel.asn || 'Unknown'}</div>
                                    <div className="pt-1 border-t border-border mt-1">
                                      <div><span className="text-muted-foreground">VPN:</span> {intel.is_vpn ? '🔴 Yes' : '🟢 No'}</div>
                                      <div><span className="text-muted-foreground">Proxy:</span> {intel.is_proxy ? '🔴 Yes' : '🟢 No'}</div>
                                      <div><span className="text-muted-foreground">Tor:</span> {intel.is_tor ? '🔴 Yes' : '🟢 No'}</div>
                                      <div><span className="text-muted-foreground">Datacenter:</span> {intel.is_datacenter ? '⚠️ Yes' : '🟢 No'}</div>
                                      <div><span className="text-muted-foreground">Blacklisted:</span> {intel.is_blacklisted ? '🔴 Yes' : '🟢 No'}</div>
                                    </div>
                                    <div className="pt-1 border-t border-border mt-1">
                                      <div><span className="text-muted-foreground">Risk Level:</span> <span className={
                                        intel.risk_level === 'critical' ? 'text-red-400 font-bold' :
                                        intel.risk_level === 'high' ? 'text-orange-400 font-bold' :
                                        intel.risk_level === 'medium' ? 'text-amber-400' : 'text-green-400'
                                      }>{intel.risk_level?.toUpperCase()}</span></div>
                                      <div><span className="text-muted-foreground">Fraud Score:</span> {intel.fraud_score}</div>
                                      <div><span className="text-muted-foreground">Abuse Score:</span> {intel.abuse_score}</div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-[10px] text-muted-foreground">
                                    No intel data. Use IP Lookup above to fetch.
                                  </div>
                                )}
                              </div>

                              {/* Actor Info Panel */}
                              <div className="border border-border rounded-lg p-3 bg-muted/30">
                                <div className="text-xs font-semibold mb-2">👤 Actor Info</div>
                                <div className="text-[10px] text-muted-foreground break-words">UA: {a.user_agent || '(missing)'}</div>
                                {a.fingerprint && <div className="text-[10px] text-muted-foreground break-words">fp: {a.fingerprint}</div>}
                                {a.user_id && <div className="text-[10px] text-muted-foreground">user_id: {a.user_id}</div>}
                                <div className="text-[10px] text-muted-foreground">first: {new Date(a.first_seen).toLocaleString()}</div>
                                <div className="text-[10px] text-muted-foreground">last: {new Date(a.last_seen).toLocaleString()}</div>
                                <div className="mt-2 pt-2 border-t border-border">
                                  <div className="text-[10px]"><span className="text-muted-foreground">Total Events:</span> {a.total_events}</div>
                                  <div className="text-[10px]"><span className="text-muted-foreground">Suspicious:</span> {a.suspicious_events}</div>
                                  <div className="text-[10px]"><span className="text-muted-foreground">Trap Hits:</span> <span className={a.trap_hits > 0 ? 'text-red-400 font-bold' : ''}>{a.trap_hits}</span></div>
                                  <div className="text-[10px]"><span className="text-muted-foreground">Admin 403:</span> <span className={a.admin_forbidden > 0 ? 'text-red-400 font-bold' : ''}>{a.admin_forbidden}</span></div>
                                </div>
                                {emergency && (
                                  <div className="mt-2 text-xs text-red-200 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                                    🚨 EMERGENCY: Triggered traps/forbidden access!
                                  </div>
                                )}
                              </div>

                              {/* Activity Panel */}
                              <div className="border border-border rounded-lg p-3 bg-muted/30">
                                <div className="text-xs font-semibold mb-2">📊 Activity</div>
                                <div className="text-[10px] text-muted-foreground mb-2">Top paths</div>
                                <div className="space-y-1">
                                  {(actorDetails[a.actor_key]?.topPaths || []).slice(0, 10).map((p) => (
                                    <div key={p.path} className="flex items-center justify-between text-[10px]">
                                      <span className="text-foreground truncate max-w-[200px]" title={p.path}>{p.path}</span>
                                      <span className="text-foreground font-semibold">{p.count}</span>
                                    </div>
                                  ))}
                                  {!actorDetails[a.actor_key] && (
                                    <div className="text-[10px] text-muted-foreground">Loading…</div>
                                  )}
                                </div>

                                {!!actorDetails[a.actor_key]?.eventTypes?.length && (
                                  <>
                                    <div className="mt-3 text-[10px] text-muted-foreground mb-2">Event types</div>
                                    <div className="grid grid-cols-2 gap-1">
                                      {(actorDetails[a.actor_key]?.eventTypes || []).slice(0, 8).map((t) => (
                                        <div key={t.event_type} className="flex items-center justify-between text-[10px] border border-border rounded px-2 py-1 bg-muted/40">
                                          <span className="text-foreground truncate" title={t.event_type}>{t.event_type}</span>
                                          <span className="text-foreground font-semibold">{t.count}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </>
                                )}
                              </div>

                              {/* Recent Events Panel */}
                              <div className="border border-border rounded-lg p-3 bg-muted/30">
                                <div className="text-xs font-semibold mb-2">📜 Recent Events</div>
                                <div className="space-y-1">
                                  {(actorDetails[a.actor_key]?.events || []).slice(0, 15).map((ev) => (
                                    <div key={(ev as any).id} className={`text-[10px] border rounded px-2 py-1 ${
                                      ev.severity === 'error'
                                        ? 'border-red-500/30 bg-red-500/10 text-red-100'
                                        : ev.severity === 'warn'
                                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-100'
                                          : 'border-border bg-muted/40 text-foreground'
                                    }`}>
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="truncate" title={ev.event_type}>{ev.event_type}</span>
                                        <span className="text-muted-foreground">{new Date(ev.created_at).toLocaleString()}</span>
                                      </div>
                                      <div className="text-foreground truncate" title={ev.path || ''}>{ev.method || ''} {ev.path || ''}</div>
                                      <div className="text-muted-foreground">
                                        status: {(ev as any).status_code ?? ''} • cc: {(ev as any).country_code ?? ''}
                                        {(() => {
                                          const s = (ev as any)?.metadata?._server;
                                          if (!s) return null;
                                          const label = s.isRender ? 'Render' : 'Local';
                                          const host = s.hostname ? String(s.hostname) : '';
                                          return (
                                            <span className="ml-2">
                                              • src: {label}{host ? ` (${host})` : ''}
                                            </span>
                                          );
                                        })()}
                                      </div>
                                    </div>
                                  ))}
                                  {actorDetails[a.actor_key] && (actorDetails[a.actor_key]?.events || []).length === 0 && (
                                    <div className="text-[10px] text-muted-foreground">No events</div>
                                  )}
                                  {!actorDetails[a.actor_key] && (
                                    <div className="text-[10px] text-muted-foreground">Loading…</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
                {linuxActors.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-4 text-muted-foreground">No suspicious Linux / UA-missing actors in range</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* IP Intelligence Section */}
        <div className="border border-border rounded-xl bg-card p-3 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold">🔍 IP Intelligence</h2>
            <span className="text-[10px] text-muted-foreground">VPN/Proxy/Tor detection • Risk scoring</span>
          </div>

          {/* Stats Grid */}
          {intelStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              <div className="border border-border rounded-lg p-2 bg-muted/30">
                <div className="text-[10px] text-muted-foreground">Cached IPs</div>
                <div className="text-lg font-bold text-foreground">{intelStats.cache?.total_cached || 0}</div>
              </div>
              <div className="border border-border rounded-lg p-2 bg-muted/30">
                <div className="text-[10px] text-muted-foreground">VPNs Detected</div>
                <div className="text-lg font-bold text-foreground">{intelStats.cache?.vpn_count || 0}</div>
              </div>
              <div className="border border-border rounded-lg p-2 bg-muted/30">
                <div className="text-[10px] text-muted-foreground">Proxies</div>
                <div className="text-lg font-bold text-foreground">{intelStats.cache?.proxy_count || 0}</div>
              </div>
              <div className="border border-border rounded-lg p-2 bg-muted/30">
                <div className="text-[10px] text-muted-foreground">Tor Exit Nodes</div>
                <div className="text-lg font-bold text-foreground">{intelStats.cache?.tor_count || 0}</div>
              </div>
              <div className="border border-border rounded-lg p-2 bg-muted/30">
                <div className="text-[10px] text-muted-foreground">Blacklisted</div>
                <div className="text-lg font-bold text-foreground">{intelStats.cache?.blacklisted_count || 0}</div>
              </div>
              <div className="border border-border rounded-lg p-2 bg-muted/30">
                <div className="text-[10px] text-muted-foreground">Checked Today</div>
                <div className="text-lg font-bold text-foreground">{intelStats.cache?.checked_today || 0}</div>
              </div>
              <div className="border border-border rounded-lg p-2 bg-muted/30">
                <div className="text-[10px] text-muted-foreground">WebRTC Leaks</div>
                <div className="text-lg font-bold text-foreground">{intelStats.fingerprints?.webrtc_leaks || 0}</div>
              </div>
              <div className="border border-border rounded-lg p-2 bg-muted/30">
                <div className="text-[10px] text-muted-foreground">Unique Visitors</div>
                <div className="text-lg font-bold text-foreground">{intelStats.fingerprints?.unique_visitors || 0}</div>
              </div>
            </div>
          )}

          {/* Risk Distribution */}
          {intelStats?.risk_distribution && intelStats.risk_distribution.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-semibold mb-2">Risk Distribution</div>
              <div className="flex flex-wrap gap-2">
                {intelStats.risk_distribution.map((r) => (
                  <div key={r.risk_level} className={`px-2 py-1 rounded text-xs ${
                    r.risk_level === 'critical' ? 'bg-red-500/20 text-red-100 border border-red-500/30' :
                    r.risk_level === 'high' ? 'bg-orange-500/20 text-orange-100 border border-orange-500/30' :
                    r.risk_level === 'medium' ? 'bg-amber-500/20 text-amber-100 border border-amber-500/30' :
                    r.risk_level === 'low' ? 'bg-green-500/20 text-green-100 border border-green-500/30' :
                    'bg-muted text-muted-foreground border border-border'
                  }`}>
                    {r.risk_level}: {r.count}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* IP Lookup */}
          <div className="border border-border rounded-lg p-3 bg-muted/30 mb-4">
            <div className="text-xs font-semibold mb-2">IP Lookup</div>
            <div className="flex gap-2">
              <Input
                value={lookupIp}
                onChange={(e) => setLookupIp(e.target.value)}
                placeholder="Enter IP address..."
                className="flex-1 h-8 text-xs"
                onKeyDown={(e) => e.key === 'Enter' && lookupIpIntel()}
              />
              <Button
                onClick={lookupIpIntel}
                disabled={lookupLoading || !lookupIp.trim()}
                className="h-8 px-3 text-xs"
              >
                {lookupLoading ? 'Looking...' : 'Lookup'}
              </Button>
            </div>

            {lookupResult && (
              <div className="mt-3 border border-border rounded-lg p-3 bg-background">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-muted-foreground">IP:</span> <span className="font-mono">{lookupResult.ip}</span></div>
                  <div><span className="text-muted-foreground">Country:</span> {lookupResult.country_code || 'Unknown'}</div>
                  <div><span className="text-muted-foreground">ISP:</span> {lookupResult.isp || 'Unknown'}</div>
                  <div><span className="text-muted-foreground">ASN:</span> {lookupResult.asn || 'Unknown'}</div>
                  <div><span className="text-muted-foreground">VPN:</span> {lookupResult.is_vpn ? '🔴 Yes' : '🟢 No'}</div>
                  <div><span className="text-muted-foreground">Proxy:</span> {lookupResult.is_proxy ? '🔴 Yes' : '🟢 No'}</div>
                  <div><span className="text-muted-foreground">Tor:</span> {lookupResult.is_tor ? '🔴 Yes' : '🟢 No'}</div>
                  <div><span className="text-muted-foreground">Datacenter:</span> {lookupResult.is_datacenter ? '⚠️ Yes' : '🟢 No'}</div>
                  <div><span className="text-muted-foreground">Blacklisted:</span> {lookupResult.is_blacklisted ? '🔴 Yes' : '🟢 No'}</div>
                  <div>
                    <span className="text-muted-foreground">Risk:</span>{' '}
                    <span className={
                      lookupResult.risk_level === 'critical' ? 'text-red-400 font-bold' :
                      lookupResult.risk_level === 'high' ? 'text-orange-400 font-bold' :
                      lookupResult.risk_level === 'medium' ? 'text-amber-400' :
                      'text-green-400'
                    }>
                      {lookupResult.risk_level?.toUpperCase()}
                    </span>
                  </div>
                  <div><span className="text-muted-foreground">Fraud Score:</span> {lookupResult.fraud_score}</div>
                  <div><span className="text-muted-foreground">Abuse Score:</span> {lookupResult.abuse_score}</div>
                </div>
                {lookupResult.is_vpn || lookupResult.is_proxy || lookupResult.is_tor ? (
                  <div className="mt-2">
                    <Button
                      variant="destructive"
                      className="h-7 px-2 text-xs"
                      onClick={() => blockIpNow(lookupResult.ip, 'intel_lookup_block')}
                    >
                      Block This IP
                    </Button>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Recent Cache Entries */}
          {intelCache.length > 0 && (
            <div>
              <div className="text-xs font-semibold mb-2">Recent IP Intelligence Cache</div>
              <div className="overflow-auto max-h-64">
                <table className="w-full text-[10px]">
                  <thead className="text-muted-foreground sticky top-0 bg-card">
                    <tr className="border-b border-border">
                      <th className="text-left py-1 pr-2">IP</th>
                      <th className="text-left py-1 pr-2">Country</th>
                      <th className="text-left py-1 pr-2">ISP</th>
                      <th className="text-left py-1 pr-2">VPN</th>
                      <th className="text-left py-1 pr-2">Proxy</th>
                      <th className="text-left py-1 pr-2">Tor</th>
                      <th className="text-left py-1 pr-2">Risk</th>
                      <th className="text-left py-1 pr-2">Fraud</th>
                    </tr>
                  </thead>
                  <tbody>
                    {intelCache.map((c) => {
                      const intelThreat = isThreat(c.ip, '') || c.risk_level === 'critical' || c.risk_level === 'high' || c.is_vpn || c.is_tor;
                      return (
                        <tr key={c.ip} className={`border-b border-border hover:bg-muted/40 ${intelThreat ? 'threat-row threat-flash' : ''}`}>
                          <td className={`py-1 pr-2 font-mono ${intelThreat ? 'text-red-500 font-semibold' : ''}`}>
                            {intelThreat && <span className="mr-1">⚠️</span>}
                            {c.ip}
                          </td>
                          <td className="py-1 pr-2">{c.country_code || '-'}</td>
                          <td className="py-1 pr-2 truncate max-w-[120px]" title={c.isp || ''}>{c.isp || '-'}</td>
                          <td className="py-1 pr-2">{c.is_vpn ? '🔴' : '🟢'}</td>
                          <td className="py-1 pr-2">{c.is_proxy ? '🔴' : '🟢'}</td>
                          <td className="py-1 pr-2">{c.is_tor ? '🔴' : '🟢'}</td>
                          <td className={`py-1 pr-2 ${
                            c.risk_level === 'critical' ? 'text-red-400' :
                            c.risk_level === 'high' ? 'text-orange-400' :
                            c.risk_level === 'medium' ? 'text-amber-400' :
                            'text-green-400'
                          }`}>{c.risk_level}</td>
                          <td className="py-1 pr-2">{c.fraud_score}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!intelStats && (
            <div className="text-xs text-muted-foreground text-center py-4">
              IP Intelligence data not available. Configure API keys (IPINFO_TOKEN, IPQS_KEY, ABUSEIPDB_KEY) to enable.
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="border border-border rounded-xl bg-card p-3">
            <h2 className="text-sm font-bold mb-2">Blocked by Country</h2>
            <div className="space-y-1">
              {(summary?.blockedByCountry || []).slice(0, 10).map((r) => (
                <div key={r.country_code} className="flex items-center justify-between text-xs">
                  <span className="text-foreground">{r.country_code}</span>
                  <span className="text-foreground font-semibold">{r.count}</span>
                </div>
              ))}
              {(!summary || summary.blockedByCountry.length === 0) && (
                <div className="text-xs text-muted-foreground">No geo blocks in range</div>
              )}
            </div>
          </div>

          <div className="border border-border rounded-xl bg-card p-3">
            <h2 className="text-sm font-bold mb-2">Top Attacker IPs</h2>
            <div className="space-y-1">
              {(summary?.topIps || []).slice(0, 10).map((r) => {
                const attackerThreat = isThreat(r.ip, '');
                return (
                  <div key={r.ip} className={`flex items-center justify-between text-xs rounded px-1 ${attackerThreat ? 'threat-row threat-flash' : ''}`}>
                    <span className={`truncate max-w-[120px] ${attackerThreat ? 'text-red-500 font-semibold' : 'text-foreground'}`} title={r.ip}>
                      {attackerThreat && <span className="mr-1">⚠️</span>}
                      {r.ip}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-semibold">{r.count}</span>
                      <Button
                        variant="ghost"
                        className="h-5 w-5 p-0 text-[10px] text-muted-foreground hover:text-red-500"
                        onClick={() => clearEventsByIp(r.ip)}
                        title="Clear events for this IP"
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                );
              })}
              {(!summary || summary.topIps.length === 0) && (
                <div className="text-xs text-muted-foreground">No events in range</div>
              )}
            </div>
          </div>

          <div className="border border-border rounded-xl bg-card p-3">
            <h2 className="text-sm font-bold mb-2">Repeat Fingerprints</h2>
            <div className="space-y-2">
              {(summary?.repeatFingerprints || []).slice(0, 6).map((r) => {
                const fpThreat = isThreat(r.ip || '', r.fingerprint);
                return (
                  <div key={r.fingerprint} className={`text-xs border rounded-lg p-2 ${fpThreat ? 'threat-row threat-flash border-red-500/50' : 'border-border bg-muted/30'}`}>
                    <div className="flex items-center justify-between">
                      <span className={fpThreat ? 'text-red-500 font-semibold' : 'text-foreground'}>
                        {fpThreat && <span className="mr-1">⚠️</span>}
                        {r.ip || "unknown"}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-foreground font-semibold">{r.count}</span>
                        <Button
                          variant="ghost"
                          className="h-5 w-5 p-0 text-[10px] text-muted-foreground hover:text-red-500"
                          onClick={() => clearEventsByFingerprint(r.fingerprint)}
                          title="Clear events for this fingerprint"
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                    <div className="mt-1 text-[10px] text-muted-foreground truncate" title={r.fingerprint}>
                      fp: {r.fingerprint}
                    </div>
                  </div>
                );
              })}
              {(!summary || summary.repeatFingerprints.length === 0) && (
                <div className="text-xs text-muted-foreground">No repeats in range</div>
              )}
            </div>
          </div>
        </div>

        <div className="border border-border rounded-xl bg-card p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold">Recent Events</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="h-6 px-2 text-[10px]"
                onClick={clearLocalhostEvents}
              >
                🧹 Clear Localhost
              </Button>
              <Button
                variant="outline"
                className="h-6 px-2 text-[10px] text-red-500 hover:text-red-600"
                onClick={clearAllEvents}
              >
                🗑️ Clear All
              </Button>
              <span className="text-[10px] text-muted-foreground">last 200</span>
            </div>
          </div>

          <div className="overflow-auto">
            <table className="w-full text-xs">
              <thead className="text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-2">Time</th>
                  <th className="text-left py-2 pr-2">Type</th>
                  <th className="text-left py-2 pr-2">IP</th>
                  <th className="text-left py-2 pr-2">CC</th>
                  <th className="text-left py-2 pr-2">Path</th>
                  <th className="text-left py-2 pr-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => {
                  const eventThreat = isThreat(ev.ip || '', '');
                  return (
                    <tr key={ev.id} className={`border-b border-border hover:bg-muted/40 ${eventThreat ? 'threat-row threat-flash' : ''}`}>
                      <td className="py-2 pr-2 whitespace-nowrap text-muted-foreground">{new Date(ev.created_at).toLocaleString()}</td>
                      <td className="py-2 pr-2 text-foreground">
                        <span className="flex items-center gap-2">
                          {ev.event_type}
                          {eventThreat && <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-600 text-white rounded">THREAT</span>}
                        </span>
                      </td>
                      <td className={`py-2 pr-2 truncate max-w-[160px] ${eventThreat ? 'text-red-500 font-semibold' : 'text-foreground'}`} title={ev.ip || ""}>
                        <div className="flex items-center gap-2">
                          <span className="truncate" title={ev.ip || ''}>{ev.ip || ''}</span>
                          {ev.ip && (
                            <Button
                              variant="outline"
                              className="h-6 px-2 text-[10px]"
                              onClick={() => blockIpNow(ev.ip!, `security_event:${ev.event_type}`)}
                            >
                              Block
                            </Button>
                          )}
                        </div>
                      </td>
                      <td className="py-2 pr-2 text-foreground">{ev.country_code || ""}</td>
                      <td className="py-2 pr-2 text-foreground truncate max-w-[360px]" title={ev.path || ""}>{ev.path || ""}</td>
                      <td className="py-2 pr-2 text-foreground">{ev.status_code ?? ""}</td>
                    </tr>
                  );
                })}
                {events.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-4 text-muted-foreground">No events yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Manual IP Block - at bottom */}
        <div className="border border-border rounded-xl bg-card p-3 max-w-md">
          <h2 className="text-sm font-bold mb-2">Manual IP Block</h2>
          <div className="space-y-2">
            <Input value={blockIp} onChange={(e) => setBlockIp(e.target.value)} placeholder="IP address" />
            <Input value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="Reason (optional)" />
            <Button className="w-full" disabled={!blockIp || loading} onClick={() => blockIpNow(blockIp, blockReason)}>
              Block IP
            </Button>
            <div className="text-[10px] text-muted-foreground">Blocks are enforced globally (API + pages).</div>
          </div>
        </div>
      </div>
    </div>
  );
}
