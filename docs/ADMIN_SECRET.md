# 🔐 Hidden Admin Panel Security

## Secret Admin URL Configuration

**⚠️ CONFIDENTIAL - Do not share publicly**

### Current Setup

The admin panel is hidden behind a secret URL that cannot be found by automated hacking tools like gobuster, dirbuster, or dirb.

**Secret Admin Path**: `/admin-portal-x9k2m8p5q7w3`

**Decoy Path**: `/admin` → Returns 404 Not Found

### How to Access

1. **Login as Admin**:
   - Visit: `/login`
   - Email: `admin@ecopro.com`
   - Password: `<ADMIN_PASSWORD>`
   - Automatically redirected to secret admin URL

2. **Direct Access**:
   - Type full URL: `https://ecopro-1lbl.onrender.com/admin-portal-x9k2m8p5q7w3`
   - Requires admin role in JWT token

### Changing the Secret URL

To change to a different secret path:

1. Update in 4 files:
   - `client/App.tsx` (line with AdminLayout route)
   - `client/pages/Login.tsx` (admin redirect)
   - `client/components/layout/Header.tsx` (2 locations)
   - `.env` file (VITE_ADMIN_SECRET_PATH)

2. Search for: `admin-portal-x9k2m8p5q7w3`
3. Replace with your new secret path

### Generate Random URL

```bash
# Using Node.js
node -e "console.log('panel-' + Math.random().toString(36).substring(2, 15))"

# Or use online generator
# https://www.random.org/strings/
```

### Security Features

✅ **Hidden from scanners**: Not discoverable by automation tools
✅ **No public links**: Never linked on homepage or public pages  
✅ **404 decoy**: `/admin` shows 404 to confuse attackers
✅ **Role-based**: Only admin users can access
✅ **JWT protected**: Requires valid authentication token

### What Each Dashboard Does

**Customer Dashboard** (`/app`):
- For regular users who sign up
- View orders, browse products
- Track purchases
- Account settings

**Hidden Admin Panel** (`/admin-portal-x9k2m8p5q7w3`):
- For platform administrators ONLY
- Store management
- Product management
- Analytics
- Settings
- Billing

**Decoy Admin** (`/admin`):
- Shows 404 Not Found
- Confuses hackers
- Logs suspicious activity

### Production Deployment

Add to Render environment variables:
```
VITE_ADMIN_SECRET_PATH=admin-portal-x9k2m8p5q7w3
```

Then update code to use:
```typescript
const ADMIN_PATH = import.meta.env.VITE_ADMIN_SECRET_PATH;
```

### Testing

Test that /admin returns 404:
```bash
curl https://ecopro-1lbl.onrender.com/admin
# Expected: 404 Not Found
```

Test secret URL works (when logged in as admin):
```bash
curl https://ecopro-1lbl.onrender.com/admin-portal-x9k2m8p5q7w3
# Expected: Admin panel
```

---

**🔒 Keep this file private. Never commit the actual secret URL to public repos.**
