import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
};

type ActorDetails = {
  fingerprint: string | null;
  ip: string | null;
  topPaths: Array<{ path: string; count: number }>;
  eventTypes: Array<{ event_type: string; count: number }>;
  events: Array<SecurityEvent & { metadata?: any; request_id?: string | null; region?: string | null; city?: string | null; user_id?: string | null; user_type?: string | null; role?: string | null }>;
};

const TOKEN_KEY = "kernelToken";
const USER_KEY = "kernelUser";

export default function Kernel() {
  const [token, setToken] = React.useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [username, setUsername] = React.useState(() => {
    try {
      const u = localStorage.getItem(USER_KEY);
      return u ? JSON.parse(u)?.username || "" : "";
    } catch {
      return "";
    }
  });
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

  const myUaClass = React.useMemo(() => {
    const ua = (me?.user_agent || '').trim();
    if (!ua) return 'unknown_ua';
    if (/Android/i.test(ua)) return 'android';
    if (/Linux/i.test(ua)) return 'linux';
    return 'other';
  }, [me?.user_agent]);

  const emergencyActors = React.useMemo(() => {
    return linuxActors.filter((a) => !a.is_trusted && ((a.trap_hits || 0) > 0 || (a.admin_forbidden || 0) > 0));
  }, [linuxActors]);

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

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setPassword("");
    } catch (e: any) {
      setError(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setSummary(null);
    setEvents([]);
  }

  async function loadAll(currentToken: string) {
    setLoading(true);
    setError("");
    try {
      const [statusRes, meRes, summaryRes, eventsRes, trafficSummaryRes, trafficRes, blocksRes, linuxRes] = await Promise.all([
        fetch(`/api/kernel/status`, {
          headers: { Authorization: `Bearer ${currentToken}` },
        }),
        fetch(`/api/kernel/security/me`, {
          headers: { Authorization: `Bearer ${currentToken}` },
        }),
        fetch(`/api/kernel/security/summary?days=${days}`, {
          headers: { Authorization: `Bearer ${currentToken}` },
        }),
        fetch(`/api/kernel/security/events?limit=200`, {
          headers: { Authorization: `Bearer ${currentToken}` },
        }),
        fetch(`/api/kernel/traffic/summary?minutes=${trafficMinutes}`, {
          headers: { Authorization: `Bearer ${currentToken}` },
        }),
        fetch(`/api/kernel/traffic/recent?limit=200`, {
          headers: { Authorization: `Bearer ${currentToken}` },
        }),
        fetch(`/api/kernel/blocks`, {
          headers: { Authorization: `Bearer ${currentToken}` },
        }),
        fetch(`/api/kernel/security/linux/watchlist?days=${linuxDays}&limit=60`, {
          headers: { Authorization: `Bearer ${currentToken}` },
        }),
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
    } catch (e: any) {
      setError(e?.message || "Failed to load kernel data");
    } finally {
      setLoading(false);
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fingerprint: me.fingerprint, ip: me.ip, label: 'my_device' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to trust device');
      await loadAll(token);
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
      const res = await fetch(`/api/kernel/security/actor/events?${qs}&limit=200`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ip, reason: reason || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to block IP');
      setBlockIp('');
      setBlockReason('');
      await loadAll(token);
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
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to unblock IP');
      await loadAll(token);
    } catch (e: any) {
      setError(e?.message || 'Failed to unblock IP');
    }
  }

  React.useEffect(() => {
    if (token) {
      void loadAll(token);
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
      <div className="max-w-6xl mx-auto">
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
            <Button variant="outline" onClick={() => token && loadAll(token)} disabled={loading}>
              Refresh
            </Button>
            <Button variant="destructive" onClick={logout}>
              Logout
            </Button>
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

          <div className="border border-border rounded-xl bg-card p-3">
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
                  {traffic.map((r, idx) => (
                    <tr key={idx} className="border-b border-border hover:bg-muted/40">
                      <td className="py-2 pr-2 whitespace-nowrap text-muted-foreground">{new Date(r.ts).toLocaleString()}</td>
                      <td className="py-2 pr-2 text-foreground">{r.method}</td>
                      <td className="py-2 pr-2 text-foreground truncate max-w-[360px]" title={r.path}>{r.path}</td>
                      <td className="py-2 pr-2 text-foreground">{r.status}</td>
                      <td className="py-2 pr-2 text-foreground truncate max-w-[200px]" title={r.ip || ''}>
                        <div className="flex items-center gap-2">
                          <span className="truncate" title={r.ip || ''}>{r.ip || ''}</span>
                          {me?.fingerprint && r.fingerprint && me.fingerprint === r.fingerprint && (
                            <span className="text-[10px] px-2 py-1 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-100">Mine</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 pr-2">
                        <Button
                          variant="outline"
                          className="h-7 px-2 text-[10px]"
                          disabled={!r.ip || (!!me?.ip && r.ip === me.ip)}
                          onClick={() => r.ip && blockIpNow(r.ip, `traffic:${r.path}`)}
                        >
                          Block
                        </Button>
                      </td>
                    </tr>
                  ))}
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
                  <th className="text-left py-2 pr-2">UA</th>
                  <th className="text-left py-2 pr-2">Events</th>
                  <th className="text-left py-2 pr-2">Suspicious</th>
                  <th className="text-left py-2 pr-2">Trap</th>
                  <th className="text-left py-2 pr-2">Admin 403</th>
                  <th className="text-left py-2 pr-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {linuxActors.map((a) => {
                  const isOpen = openActorKey === a.actor_key;
                  const emergency = a.emergency;
                  const uaMissing = (a.ua_class || 'linux') === 'unknown_ua';
                  const trusted = !!a.is_trusted;
                  const rowClass = emergency
                    ? 'bg-red-500/10'
                    : uaMissing
                      ? 'bg-fuchsia-500/10'
                      : a.suspicious_events > 0
                      ? 'bg-amber-500/10'
                      : '';
                  return (
                    <React.Fragment key={a.actor_key}>
                      <tr className={`border-b border-border hover:bg-muted/40 ${rowClass}`}>
                        <td className="py-2 pr-2 whitespace-nowrap text-muted-foreground">{new Date(a.last_seen).toLocaleString()}</td>
                        <td className="py-2 pr-2 text-foreground truncate max-w-[180px]" title={a.ip || ''}>{a.ip || ''}</td>
                        <td className="py-2 pr-2 text-foreground">{a.country_code || ''}</td>
                        <td className="py-2 pr-2">
                          <span className={`text-[10px] px-2 py-1 rounded border ${
                            uaMissing
                              ? 'border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-100'
                              : 'border-border bg-muted/40 text-foreground'
                          }`}>
                            {uaMissing ? 'UA missing' : 'Linux'}
                          </span>
                        </td>
                        <td className="py-2 pr-2 text-foreground">{a.total_events}</td>
                        <td className="py-2 pr-2 text-foreground">{a.suspicious_events}</td>
                        <td className="py-2 pr-2 text-foreground">{a.trap_hits}</td>
                        <td className="py-2 pr-2 text-foreground">{a.admin_forbidden}</td>
                        <td className="py-2 pr-2">
                          <div className="flex items-center gap-2">
                            {a.ip && (
                              <Button
                                variant={trusted ? 'outline' : (emergency ? 'destructive' : 'outline')}
                                className="h-7 px-2 text-[10px]"
                                disabled={trusted || (!!me?.ip && a.ip === me.ip)}
                                onClick={() => blockIpNow(a.ip!, emergency ? 'EMERGENCY:linux_actor' : 'linux_actor')}
                              >
                                Block
                              </Button>
                            )}
                            {trusted && (
                              <span className="text-[10px] px-2 py-1 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-100">
                                Trusted
                              </span>
                            )}
                            <Button
                              variant="outline"
                              className="h-7 px-2 text-[10px]"
                              onClick={() => {
                                const next = isOpen ? null : a.actor_key;
                                setOpenActorKey(next);
                                if (!isOpen) void loadActor(a.actor_key, a.fingerprint, a.ip);
                              }}
                            >
                              {isOpen ? 'Hide' : 'Details'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="border-b border-border">
                          <td colSpan={9} className="py-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="border border-border rounded-lg p-3 bg-muted/30">
                                <div className="text-xs font-semibold mb-2">Actor</div>
                                <div className="text-[10px] text-muted-foreground break-words">UA: {a.user_agent || '(missing)'}</div>
                                {a.fingerprint && <div className="text-[10px] text-muted-foreground break-words">fp: {a.fingerprint}</div>}
                                {a.user_id && <div className="text-[10px] text-muted-foreground">user_id: {a.user_id}</div>}
                                <div className="text-[10px] text-muted-foreground">first: {new Date(a.first_seen).toLocaleString()}</div>
                                <div className="text-[10px] text-muted-foreground">last: {new Date(a.last_seen).toLocaleString()}</div>
                                {emergency && (
                                  <div className="mt-2 text-xs text-red-200 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                                    EMERGENCY: Linux actor triggered traps/forbidden access.
                                  </div>
                                )}
                              </div>

                              <div className="border border-border rounded-lg p-3 bg-muted/30">
                                <div className="text-xs font-semibold mb-2">What is he doing?</div>
                                <div className="text-[10px] text-muted-foreground mb-2">Top paths</div>
                                <div className="space-y-1">
                                  {(actorDetails[a.actor_key]?.topPaths || []).slice(0, 10).map((p) => (
                                    <div key={p.path} className="flex items-center justify-between text-[10px]">
                                      <span className="text-foreground truncate max-w-[320px]" title={p.path}>{p.path}</span>
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

                              <div className="border border-border rounded-lg p-3 bg-muted/30">
                                <div className="text-xs font-semibold mb-2">Recent activity</div>
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
              {(summary?.topIps || []).slice(0, 10).map((r) => (
                <div key={r.ip} className="flex items-center justify-between text-xs">
                  <span className="text-foreground truncate max-w-[220px]" title={r.ip}>{r.ip}</span>
                  <span className="text-foreground font-semibold">{r.count}</span>
                </div>
              ))}
              {(!summary || summary.topIps.length === 0) && (
                <div className="text-xs text-muted-foreground">No events in range</div>
              )}
            </div>
          </div>

          <div className="border border-border rounded-xl bg-card p-3">
            <h2 className="text-sm font-bold mb-2">Repeat Fingerprints</h2>
            <div className="space-y-2">
              {(summary?.repeatFingerprints || []).slice(0, 6).map((r) => (
                <div key={r.fingerprint} className="text-xs border border-border rounded-lg p-2 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">{r.ip || "unknown"}</span>
                    <span className="text-foreground font-semibold">{r.count}</span>
                  </div>
                  <div className="mt-1 text-[10px] text-muted-foreground truncate" title={r.fingerprint}>
                    fp: {r.fingerprint}
                  </div>
                </div>
              ))}
              {(!summary || summary.repeatFingerprints.length === 0) && (
                <div className="text-xs text-muted-foreground">No repeats in range</div>
              )}
            </div>
          </div>
        </div>

        <div className="border border-border rounded-xl bg-card p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold">Recent Events</h2>
            <span className="text-[10px] text-muted-foreground">last 200</span>
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
                {events.map((ev) => (
                  <tr key={ev.id} className="border-b border-border hover:bg-muted/40">
                    <td className="py-2 pr-2 whitespace-nowrap text-muted-foreground">{new Date(ev.created_at).toLocaleString()}</td>
                    <td className="py-2 pr-2 text-foreground">{ev.event_type}</td>
                    <td className="py-2 pr-2 text-foreground truncate max-w-[160px]" title={ev.ip || ""}>
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
                ))}
                {events.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-4 text-muted-foreground">No events yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
