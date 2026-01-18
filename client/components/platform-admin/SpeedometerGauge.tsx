import React from 'react';

type TrendDirection = 'higher-is-worse' | 'higher-is-better' | 'neutral';

type GaugeTone = 'emerald' | 'cyan' | 'amber' | 'red' | 'violet' | 'slate';

const TONE: Record<GaugeTone, { stroke: string; glow: string; text: string }> = {
  emerald: { stroke: '#34d399', glow: 'rgba(52, 211, 153, 0.35)', text: 'text-emerald-200' },
  cyan: { stroke: '#22d3ee', glow: 'rgba(34, 211, 238, 0.35)', text: 'text-cyan-200' },
  amber: { stroke: '#fbbf24', glow: 'rgba(251, 191, 36, 0.35)', text: 'text-amber-200' },
  red: { stroke: '#f87171', glow: 'rgba(248, 113, 113, 0.35)', text: 'text-red-200' },
  violet: { stroke: '#a78bfa', glow: 'rgba(167, 139, 250, 0.35)', text: 'text-violet-200' },
  slate: { stroke: '#94a3b8', glow: 'rgba(148, 163, 184, 0.25)', text: 'text-slate-200' },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function formatCompact(value: number) {
  // Compact human format for counts.
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return `${Math.round(value)}`;
}

export type SpeedometerGaugeProps = {
  title: string;
  value: number | null | undefined;
  min?: number;
  max?: number;
  unit?: string;
  subtitle?: string;
  decimals?: number;
  compactValue?: boolean;
  trend?: TrendDirection;
  goodThreshold?: number;
  warnThreshold?: number;
  tone?: GaugeTone;
};

export default function SpeedometerGauge({
  title,
  value,
  min = 0,
  max = 100,
  unit,
  subtitle,
  decimals = 0,
  compactValue = false,
  trend = 'higher-is-worse',
  goodThreshold,
  warnThreshold,
  tone = 'cyan',
}: SpeedometerGaugeProps) {
  const normalizedValue = isFiniteNumber(value) ? value : null;
  const safeMin = Number.isFinite(min) ? min : 0;
  const safeMax = Number.isFinite(max) && max > safeMin ? max : safeMin + 1;
  const ratio = normalizedValue == null ? 0 : clamp((normalizedValue - safeMin) / (safeMax - safeMin), 0, 1);

  const angleDeg = -90 + ratio * 180;
  const angleRad = (angleDeg * Math.PI) / 180;

  const size = 120;
  const cx = size / 2;
  const cy = size / 2 + 10;
  const r = 44;

  const needleLen = 38;
  const nx = cx + Math.cos(angleRad) * needleLen;
  const ny = cy + Math.sin(angleRad) * needleLen;

  const arcStart = { x: cx - r, y: cy };
  const arcEnd = { x: cx + r, y: cy };
  const arcPath = `M ${arcStart.x} ${arcStart.y} A ${r} ${r} 0 0 1 ${arcEnd.x} ${arcEnd.y}`;

  const circumference = Math.PI * r;
  const dash = circumference * ratio;
  const gap = circumference - dash;

  const chooseTone = (): GaugeTone => {
    if (normalizedValue == null) return 'slate';

    if (trend === 'neutral') return tone;

    const good = goodThreshold;
    const warn = warnThreshold;

    if (!isFiniteNumber(good) || !isFiniteNumber(warn)) {
      return tone;
    }

    if (trend === 'higher-is-worse') {
      if (normalizedValue <= good) return 'emerald';
      if (normalizedValue <= warn) return 'amber';
      return 'red';
    }

    // higher-is-better
    if (normalizedValue >= warn) return 'emerald';
    if (normalizedValue >= good) return 'amber';
    return 'red';
  };

  const resolvedTone = chooseTone();
  const palette = TONE[resolvedTone];

  const renderValue = () => {
    if (normalizedValue == null) return '—';
    if (compactValue) return formatCompact(normalizedValue);
    if (decimals === 0) return `${Math.round(normalizedValue)}`;
    return normalizedValue.toFixed(decimals);
  };

  return (
    <div className="bg-slate-900/40 rounded-xl border border-slate-700/40 p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-slate-300 font-medium text-sm truncate">{title}</div>
          {subtitle && <div className="text-slate-500 text-xs truncate mt-0.5">{subtitle}</div>}
        </div>
        <div className={`font-mono tabular-nums text-sm ${palette.text} shrink-0`}>
          {renderValue()}
          {unit ? <span className="text-slate-400"> {unit}</span> : null}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-center">
        <svg width={size} height={size * 0.7} viewBox={`0 0 ${size} ${size}`}
          className="block"
          aria-label={`${title} gauge`}
          role="img"
        >
          <defs>
            <filter id={`glow-${title.replace(/\W+/g, '-')}`} x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={palette.glow} />
            </filter>
          </defs>

          {/* Base arc */}
          <path d={arcPath} fill="none" stroke="#334155" strokeWidth="10" strokeLinecap="round" />

          {/* Active arc */}
          <path
            d={arcPath}
            fill="none"
            stroke={palette.stroke}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${gap}`}
            filter={`url(#glow-${title.replace(/\W+/g, '-')})`}
          />

          {/* Ticks */}
          {Array.from({ length: 6 }).map((_, i) => {
            const t = i / 5;
            const a = (-90 + t * 180) * (Math.PI / 180);
            const r1 = r + 8;
            const r2 = r + 14;
            const x1 = cx + Math.cos(a) * r1;
            const y1 = cy + Math.sin(a) * r1;
            const x2 = cx + Math.cos(a) * r2;
            const y2 = cy + Math.sin(a) * r2;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#475569" strokeWidth="2" strokeLinecap="round" />;
          })}

          {/* Needle */}
          <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
          <circle cx={cx} cy={cy} r="4.5" fill="#e2e8f0" />

          {/* Min/Max labels */}
          <text x={cx - r - 6} y={cy + 18} fill="#64748b" fontSize="10" textAnchor="start">
            {safeMin}
          </text>
          <text x={cx + r + 6} y={cy + 18} fill="#64748b" fontSize="10" textAnchor="end">
            {safeMax}
          </text>
        </svg>
      </div>
    </div>
  );
}
