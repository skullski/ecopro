import crypto from 'crypto';

export type PwnedPasswordResult =
  | { ok: true; pwned: false }
  | { ok: true; pwned: true; count: number }
  | { ok: false; error: string };

// Uses the Pwned Passwords k-anonymity API (no API key required).
// https://haveibeenpwned.com/API/v3#PwnedPasswords
export async function checkPwnedPassword(password: string): Promise<PwnedPasswordResult> {
  try {
    if (typeof password !== 'string' || password.length === 0) {
      return { ok: false, error: 'Password is required' };
    }

    const sha1 = crypto.createHash('sha1').update(password, 'utf8').digest('hex').toUpperCase();
    const prefix = sha1.slice(0, 5);
    const suffix = sha1.slice(5);

    const resp = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'EcoPro-Security-Check',
        'Add-Padding': 'true',
      },
    });

    if (!resp.ok) {
      return { ok: false, error: `Pwned Passwords API error (${resp.status})` };
    }

    const text = await resp.text();
    // Each line: "HASH_SUFFIX:COUNT"
    const lines = text.split('\n');
    for (const line of lines) {
      const [hashSuffix, countStr] = line.trim().split(':');
      if (!hashSuffix || !countStr) continue;
      if (hashSuffix.toUpperCase() === suffix) {
        const count = Number.parseInt(countStr, 10);
        return { ok: true, pwned: true, count: Number.isFinite(count) ? count : 1 };
      }
    }

    return { ok: true, pwned: false };
  } catch (e) {
    return { ok: false, error: (e as any)?.message || 'Pwned password check failed' };
  }
}
