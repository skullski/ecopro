type RequiredEnvVar = {
  name: string;
  description: string;
};

export function validateProductionEnv(): void {
  if (process.env.NODE_ENV !== 'production') return;

  const required: RequiredEnvVar[] = [
    {
      name: 'DATABASE_URL',
      description: 'PostgreSQL connection string (Render External Database URL)',
    },
    {
      name: 'JWT_SECRET',
      description: 'JWT signing secret for session cookies/refresh tokens',
    },
    {
      name: 'ALLOWED_ORIGINS',
      description: 'Comma-separated allowlist for credentialed CORS requests',
    },
    {
      name: 'ENCRYPTION_KEY',
      description: 'App-level encryption key (2FA secrets, sensitive fields)',
    },
    {
      name: 'UPLOAD_SIGNING_KEY',
      description: 'HMAC key used to sign expiring upload URLs',
    },
  ];

  const missing = required.filter((v) => !(process.env[v.name] && process.env[v.name]!.trim()));
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').trim();
  const originInvalid = allowedOrigins === '*' || allowedOrigins.includes('://*');

  if (missing.length === 0 && !originInvalid) return;

  const lines: string[] = [];
  lines.push('❌ Production configuration error');
  lines.push('The server refuses to start because required environment variables are missing or unsafe.');
  lines.push('');

  if (missing.length > 0) {
    lines.push('Missing:');
    for (const v of missing) {
      lines.push(`- ${v.name}: ${v.description}`);
    }
    lines.push('');
  }

  if (originInvalid) {
    lines.push('Invalid:');
    lines.push('- ALLOWED_ORIGINS must not be a wildcard when using credentialed cookies');
    lines.push('');
  }

  throw new Error(lines.join('\n'));
}
