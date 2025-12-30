export type PasswordPolicyResult = { ok: true } | { ok: false; reason: string };

// Strong password policy (server-side, enforced at registration & password change)
// - Min length: 12
// - Max length: 128
// - Must contain: upper, lower, digit, symbol
// - Must not contain the email local-part
export function checkPasswordPolicy(password: string, email?: string | null): PasswordPolicyResult {
  if (typeof password !== 'string') return { ok: false, reason: 'Password is required' };

  const trimmed = password;
  if (trimmed.length < 12) return { ok: false, reason: 'Password must be at least 12 characters' };
  if (trimmed.length > 128) return { ok: false, reason: 'Password must be at most 128 characters' };

  const hasLower = /[a-z]/.test(trimmed);
  const hasUpper = /[A-Z]/.test(trimmed);
  const hasDigit = /\d/.test(trimmed);
  const hasSymbol = /[^A-Za-z0-9]/.test(trimmed);

  if (!hasLower) return { ok: false, reason: 'Password must include a lowercase letter' };
  if (!hasUpper) return { ok: false, reason: 'Password must include an uppercase letter' };
  if (!hasDigit) return { ok: false, reason: 'Password must include a number' };
  if (!hasSymbol) return { ok: false, reason: 'Password must include a symbol' };

  if (email) {
    const local = email.split('@')[0]?.toLowerCase();
    if (local && local.length >= 3 && trimmed.toLowerCase().includes(local)) {
      return { ok: false, reason: 'Password must not contain parts of your email' };
    }
  }

  return { ok: true };
}
