// Animated ghost SVG React component for horror admin panel
export default function Ghost({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="40" rx="20" ry="18" fill="#fff" fillOpacity="0.13" />
      <ellipse cx="32" cy="38" rx="16" ry="14" fill="#fff" fillOpacity="0.18" />
      <path d="M16 40 Q20 32 32 32 Q44 32 48 40 Q48 56 32 56 Q16 56 16 40 Z" fill="#fff" fillOpacity="0.22" />
      <ellipse cx="26" cy="42" rx="2.5" ry="4" fill="#222" fillOpacity="0.7" />
      <ellipse cx="38" cy="42" rx="2.5" ry="4" fill="#222" fillOpacity="0.7" />
      <ellipse cx="32" cy="48" rx="3" ry="1.2" fill="#222" fillOpacity="0.3" />
    </svg>
  );
}
