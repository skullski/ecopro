import * as React from 'react';

export default function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M9 3v10a4 4 0 1 0 4-4V3a7 7 0 1 1-7 7V3h3z" fill="currentColor" />
      <path d="M17 3v6a4 4 0 1 0 4-4h-4z" fill="currentColor" opacity="0.9" />
    </svg>
  );
}
