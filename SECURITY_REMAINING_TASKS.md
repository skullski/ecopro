# Security Hardening - Remaining Tasks & Roadmap

**Phase Completed**: ✅ Foundation Hardened  
**Phase In Progress**: 🟡 Token & Cookie Security  
**Phase Pending**: ⏳ Advanced Hardening

---

## ✅ COMPLETED (Phase 1: Foundation)

### Authentication & Hashing
- [x] **Upgrade password hashing from bcrypt to argon2id**
  - Commit: 7e9ef21
  - timeCost=2, memoryCost=65536 (64MB)
  - GPU-resistant, memory-hard algorithm
  - Status: ✅ IMPLEMENTED & VERIFIED

- [x] **Reduce JWT token expiry from 7 days to 15 minutes**
  - Commit: 7e9ef21
  - CRITICAL security improvement
  - Limits token theft exposure window
  - Status: ✅ IMPLEMENTED & VERIFIED

- [x] **Add refresh token support**
  - Commit: 7e9ef21
  - 7-day refresh tokens for long sessions
  - Separate storage from access tokens
  - Status: ✅ IMPLEMENTED & VERIFIED

### Existing Security (Already Active)
- [x] Rate limiting on auth endpoints (5/15min)
- [x] Helmet security headers (CSP, HSTS, X-Frame)
- [x] CORS strict whitelisting
- [x] Database query scoping (WHERE client_id)
- [x] Staff table isolation
- [x] Activity logging (staff_activity_log)

---

## 🟡 IN PROGRESS (Phase 2: Token Security)

### HttpOnly Cookies
**Priority**: 🔴 CRITICAL  
**Impact**: Prevents XSS attacks from stealing tokens  
**Effort**: ~2 hours

**Tasks**:
- [ ] **Backend: Set HttpOnly cookies on login**
  ```typescript
  // In POST /api/auth/login
  res.cookie('accessToken', token, {
    httpOnly: true,      // ✅ JavaScript can't access
    secure: true,        // ✅ HTTPS only
    sameSite: 'strict',  // ✅ CSRF protection
    maxAge: 15 * 60 * 1000
  });
  
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  ```
  
- [ ] **Frontend: Read from cookies instead of localStorage**
  ```typescript
  // OLD (INSECURE - localStorage)
  const token = localStorage.getItem('authToken');
  
  // NEW (SECURE - HttpOnly cookie)
  // Browser automatically sends cookies with requests
  // Frontend never touches the token!
  
  // Verify with credentialed fetch:
  fetch('http://localhost:5000/api/client/orders', {
    credentials: 'include'  // Send cookies with request
  });
  ```

- [ ] **Remove localStorage token storage**
  - Delete from `/client/pages/Login.tsx`
  - Delete from `/client/pages/StaffLogin.tsx`
  - Delete from `/client/lib/api.ts`

- [ ] **Remove localStorage getAuthToken() calls**
  - Search for `getAuthToken()` across codebase
  - Replace with automatic cookie sending (credentials: 'include')

- [ ] **Test cookie-based authentication**
  - Login → verify cookie set
  - Make requests → verify token sent
  - Logout → verify cookies cleared
  - Refresh token → verify new access token issued

**Status**: ⏳ NOT STARTED

---

### Token Refresh Endpoint
**Priority**: 🟠 HIGH  
**Impact**: Allow sessions to stay alive without re-login  
**Effort**: ~1 hour

**Tasks**:
- [ ] **Create POST /api/auth/refresh endpoint**
  ```typescript
  export const handleRefreshToken: RequestHandler = async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ error: 'No refresh token' });
      }

      // Verify refresh token is valid
      const payload = jwt.verify(refreshToken, JWT_SECRET) as { staff_id: string };

      // Get staff from DB
      const staff = await db.query(
        'SELECT * FROM staff WHERE id = $1',
        [payload.staff_id]
      );

      // Verify stored refresh token hash matches
      const isValid = await argon2.verify(staff.rows[0].refresh_token_hash, refreshToken);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      // Generate NEW access token (15 min)
      const newAccessToken = jwt.sign(
        { id: staff.rows[0].id, staff_id: staff.rows[0].id, email: staff.rows[0].email },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      // Send new access token
      res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000
      });

      return res.json({ message: 'Token refreshed' });
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
  ```

- [ ] **Register endpoint in server/index.ts**
  ```typescript
  app.post('/api/auth/refresh', handleRefreshToken);
  ```

- [ ] **Test refresh flow**
  - Get access token
  - Wait 15+ minutes
  - Call /api/auth/refresh
  - Verify new token issued

**Status**: ⏳ NOT STARTED

---

## ⏳ PENDING (Phase 3: Advanced Hardening)

### Session Management
**Priority**: 🟠 MEDIUM  
**Impact**: Track and manage staff sessions  
**Effort**: ~3 hours

**Tasks**:
- [ ] Create `sessions` table
  ```sql
  CREATE TABLE sessions (
    id BIGSERIAL PRIMARY KEY,
    staff_id BIGINT REFERENCES staff(id),
    token_jti VARCHAR(255) UNIQUE,  -- JWT ID for tracking
    user_agent VARCHAR(500),         -- Device info
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    revoked_at TIMESTAMP
  );
  ```

- [ ] Implement session tracking in login
- [ ] Add "logout from all devices" feature
- [ ] Track active session count per staff member

**Status**: ⏳ NOT STARTED

---

### Input Validation with Zod
**Priority**: 🟡 MEDIUM  
**Impact**: Prevent invalid/malicious data  
**Effort**: ~2 hours

**Tasks**:
- [ ] Create validation schemas for all auth routes
  ```typescript
  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(128)
  });

  const registerSchema = z.object({
    email: z.string().email(),
    password: z.string()
      .min(12, 'Password must be at least 12 characters')
      .regex(/[A-Z]/, 'Must contain uppercase')
      .regex(/[0-9]/, 'Must contain number')
      .regex(/[!@#$%^&*]/, 'Must contain special character'),
    full_name: z.string().min(2).max(100)
  });
  ```

- [ ] Apply schemas to all endpoints
- [ ] Test with invalid inputs
- [ ] Test with malicious inputs (SQL injection attempts, XSS, etc)

**Status**: ⏳ NOT STARTED

---

### Sensitive Field Encryption
**Priority**: 🟠 HIGH  
**Impact**: Encrypt data at rest  
**Effort**: ~4 hours

**Tasks**:
- [ ] Create encryption utility
  ```typescript
  import crypto from 'crypto';

  const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY || '');

  export function encryptField(plaintext: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  export function decryptField(ciphertext: string): string {
    const [iv, authTag, encrypted] = ciphertext.split(':');
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      ENCRYPTION_KEY,
      Buffer.from(iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
  ```

- [ ] Encrypt phone numbers in store_orders
- [ ] Encrypt email addresses in staff table
- [ ] Encrypt customer payment info (when phase 2 added)
- [ ] Create migration to encrypt existing data
- [ ] Add ENCRYPTION_KEY to .env file

**Status**: ⏳ NOT STARTED

---

### Password Policy Enforcement
**Priority**: 🟡 MEDIUM  
**Impact**: Stronger passwords  
**Effort**: ~1.5 hours

**Tasks**:
- [ ] Implement password requirements
  - Minimum 12 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character (!@#$%^&*)

- [ ] Add password strength meter to frontend
- [ ] Reject common passwords (Top 1000 list)
- [ ] Implement password history (prevent reuse of last 3)

**Status**: ⏳ NOT STARTED

---

### Two-Factor Authentication (2FA)
**Priority**: 🟢 LOW (Optional)  
**Impact**: Additional login security  
**Effort**: ~6 hours

**Tasks**:
- [ ] Add 2FA fields to staff table
  ```sql
  ALTER TABLE staff ADD COLUMN
    two_factor_secret VARCHAR(255),
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_backup_codes TEXT[]
  ;
  ```

- [ ] Implement TOTP (Time-based One-Time Password) using `speakeasy` library
- [ ] Generate QR code for authenticator apps
- [ ] Backup codes for account recovery
- [ ] Require 2FA on admin accounts (mandatory)
- [ ] Make 2FA optional for regular staff

**Status**: ⏳ NOT STARTED

---

### Account Lockout Protection
**Priority**: 🟡 MEDIUM  
**Impact**: Prevent brute force attacks  
**Effort**: ~1 hour

**Tasks**:
- [ ] Add lockout fields to staff table
  ```sql
  ALTER TABLE staff ADD COLUMN
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP
  ;
  ```

- [ ] Track failed login attempts
- [ ] Lock account after 5 failed attempts
- [ ] Auto-unlock after 30 minutes
- [ ] Send email notification on lockout
- [ ] Allow manual unlock by admin

**Status**: ⏳ NOT STARTED

---

### API Key Management (For Integrations)
**Priority**: 🟢 LOW  
**Impact**: Allow third-party integrations  
**Effort**: ~3 hours

**Tasks**:
- [ ] Create API keys table
  ```sql
  CREATE TABLE api_keys (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT REFERENCES clients(id),
    key_hash VARCHAR(255),  -- Hash of actual key
    name VARCHAR(255),       -- "Shipping API", "Analytics", etc
    scopes TEXT[],           -- Permissions: ['read_orders', 'write_products']
    created_at TIMESTAMP DEFAULT NOW(),
    last_used_at TIMESTAMP,
    revoked_at TIMESTAMP
  );
  ```

- [ ] Generate secure random API keys
- [ ] Implement API key rate limiting
- [ ] Create endpoint to manage API keys
- [ ] Document API authentication

**Status**: ⏳ NOT STARTED

---

### Penetration Testing
**Priority**: 🔴 CRITICAL (After all above)  
**Impact**: Find unknown vulnerabilities  
**Effort**: ~8 hours

**Tasks**:
- [ ] Hire security professional for penetration testing
- [ ] Test for common vulnerabilities:
  - SQL injection
  - XSS (Cross-Site Scripting)
  - CSRF (Cross-Site Request Forgery)
  - Privilege escalation
  - Session hijacking
  - Password reset attacks
  - Account enumeration
  
- [ ] Fix any vulnerabilities found
- [ ] Implement recommendations
- [ ] Get security report/certificate

**Status**: ⏳ NOT STARTED

---

### Security Monitoring & Alerting
**Priority**: 🟠 MEDIUM  
**Impact**: Detect attacks in real-time  
**Effort**: ~4 hours

**Tasks**:
- [ ] Set up error tracking (Sentry)
- [ ] Monitor failed login attempts
- [ ] Alert on suspicious activity:
  - Multiple failed logins from same IP
  - Unusual geographic access
  - Large data exports
  - Permission changes
  
- [ ] Create admin dashboard for security events
- [ ] Implement email alerts for critical events

**Status**: ⏳ NOT STARTED

---

## Priority Queue (Recommended Order)

1. **🔴 CRITICAL (Do First)**
   - HttpOnly Cookies (~2h)
   - Token Refresh Endpoint (~1h)
   - Input Validation with Zod (~2h)

2. **🟠 HIGH (Do Second)**
   - Sensitive Field Encryption (~4h)
   - Password Policy Enforcement (~1.5h)

3. **🟡 MEDIUM (Do Third)**
   - Account Lockout Protection (~1h)
   - Session Management (~3h)
   - Security Monitoring (~4h)

4. **🟢 LOW (Optional)**
   - Two-Factor Authentication (~6h)
   - API Key Management (~3h)
   - Bug bounty program

5. **🔴 FINAL**
   - Penetration Testing (~8h)

---

## Estimated Timeline

| Phase | Tasks | Time | Status |
|-------|-------|------|--------|
| Phase 1 (Foundation) | Argon2id, JWT, Refresh Tokens | 3h | ✅ COMPLETE |
| Phase 2 (Token Security) | HttpOnly, Refresh, Validation | 5h | 🟡 NEXT |
| Phase 3 (Advanced) | Encryption, 2FA, Sessions | 8h | ⏳ PENDING |
| Phase 4 (Hardening) | Monitoring, Penetration Tests | 12h | ⏳ PENDING |
| **Total Security Budget** | | **28h** | |

---

## Quick Start (Next 1 Hour)

To continue hardening security, run these in order:

```bash
# 1. Start HTTP-only cookies (backend)
# Edit server/routes/auth.ts login endpoints
# Add res.cookie() calls with httpOnly, secure, sameSite

# 2. Create refresh token endpoint
# Edit server/routes/auth.ts, add POST /api/auth/refresh

# 3. Test the flow
pnpm dev
# Navigate to login → should see cookies in DevTools
# Verify tokens don't appear in localStorage
```

---

## Questions to Ask Users Before Phase 2

1. Do you want 2FA (two-factor authentication)?
2. Should we encrypt customer phone numbers at rest?
3. Do you need API keys for third-party integrations?
4. Should we have automatic account lockout?
5. Do you want security event notifications?

---

**Last Updated**: 2025-12-21  
**Next Review**: After Phase 2 complete  
**Security Roadmap Owner**: Your team
