# User Signup and Progress Tracking System

## Overview

Your platform now supports **open signup** where anyone can create an account and track their progress. Each user has their own account authenticated with **email (Gmail or any email) + password**.

## Features Implemented

### 1. User Signup (/signup)
- **Full Name**: Required field (min 2 characters)
- **Email**: Any email address (Gmail, Outlook, etc.)
- **Password**: Minimum 6 characters with validation
- **Automatic Login**: Users are logged in immediately after signup
- **Multi-language Support**: Arabic, English, and French

### 2. User Dashboard (/app)
Each user gets a personalized dashboard showing:

#### Account Information Card
- User's full name
- Email address
- Account type badge (Customer/Vendor/Admin)

#### Progress Statistics
- **Total Orders**: Track all purchases (currently 0, ready for data)
- **Active Products**: If user becomes a vendor (currently 0)
- **Total Revenue**: Lifetime earnings (currently 0)

#### Quick Actions
- Browse Store
- Access Vendor Dashboard (if vendor role)
- Access Admin Panel (if admin role)
- Settings (ready for implementation)
- Logout

### 3. Authentication Flow
```
1. User visits homepage (/)
2. Clicks "Sign Up" button
3. Fills in name, email, password
4. Submits form → Account created in PostgreSQL
5. Automatically logged in → JWT token stored
6. Redirected to dashboard (/app)
7. User can now browse store, make orders, track progress
```

### 4. Role-Based Access
- **Customer** (default): Can browse, order products, track purchases
- **Vendor**: Can create and manage their own products
- **Admin**: Full access to admin panel

## Database Integration

All user data is stored in **PostgreSQL** on Render:

### Users Table Structure
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,  -- bcrypt hashed
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Security Features
- ✅ **Password Hashing**: bcrypt with salt rounds
- ✅ **JWT Authentication**: 7-day token expiration
- ✅ **Rate Limiting**: 5 signup/login attempts per 15 minutes
- ✅ **Input Validation**: Email format, password length, required fields
- ✅ **CORS Protection**: Whitelist of allowed origins
- ✅ **Security Headers**: Helmet middleware

## User Journey

### First Time User
1. Visit https://ecopro-1lbl.onrender.com
2. Click "Sign Up" (or "إنشاء حساب" in Arabic)
3. Enter details:
   - Name: "Ahmed Hassan"
   - Email: "ahmed@gmail.com"
   - Password: "secure123"
4. Account created → Logged in automatically
5. Redirected to dashboard at /app
6. See welcome message: "Welcome, Ahmed Hassan!"
7. View account stats (all 0 initially)
8. Start browsing store or exploring features

### Returning User
1. Visit https://ecopro-1lbl.onrender.com/login
2. Enter email and password
3. Click "Log in" (or "تسجيل الدخول")
4. Redirected to dashboard
5. See updated progress (orders, revenue, etc.)

## Progress Tracking (Future Integration)

The dashboard is ready to display real user progress:

### Orders Tracking
When users make purchases:
- Total orders count increases
- Order history displays recent purchases
- Revenue statistics update

### Vendor Progress
If user becomes a vendor:
- Active products count
- Sales performance
- Customer reviews
- Revenue breakdown

### Customer Progress
- Purchase history
- Favorite products
- Loyalty points (future)
- Referral rewards (future)

## API Endpoints Used

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Log in existing user
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/change-password` - Update password

### Protected Routes
All routes requiring authentication check for JWT token in:
```
Authorization: Bearer <token>
```

## Testing

### Test the System Locally
```bash
# Start dev servers
pnpm dev

# Open browser
http://localhost:5173

# Create test account
Email: test@example.com
Password: test123

# Check database
pnpm exec tsx db-query.ts
```

### Test on Production
1. Visit: https://ecopro-1lbl.onrender.com
2. Sign up with real email
3. Verify account creation
4. Check dashboard displays correctly
5. Test logout and login again

## Default Admin Account

For testing purposes, there's a default admin:
- **Email**: admin@ecopro.com
- **Password**: admin123
- **Role**: admin

This account has full access to:
- Admin panel (/admin)
- All vendor features
- All customer features

## Customization Options

### Add Email Verification
```typescript
// In server/routes/auth.ts
- Send verification email on signup
- Add email_verified column to users table
- Require verification before full access
```

### Add Social Login (Google OAuth)
```typescript
// Install passport.js
- Configure Google OAuth strategy
- Add "Sign in with Google" button
- Link Google account to user profile
```

### Add Profile Pictures
```typescript
// Add avatar_url column
- Upload to cloud storage (Cloudinary, S3)
- Display in dashboard and navbar
```

### Add Two-Factor Authentication
```typescript
// Install speakeasy
- Generate 2FA secret
- Verify TOTP codes
- Require on login for extra security
```

## Multi-Language Support

All signup and dashboard text is translated:

### Arabic (ar)
- البريد الإلكتروني → Email
- كلمة المرور → Password
- الاسم → Name

### English (en)
- Sign Up
- Dashboard
- Account Information

### French (fr)
- S'inscrire
- Tableau de bord
- Informations du compte

## Next Steps

1. **Configure Render Environment Variables** (see RENDER_ENV_SETUP.md)
   - DATABASE_URL
   - JWT_SECRET
   - ALLOWED_ORIGINS

2. **Test Signup Flow** on production

3. **Monitor Database** for new user signups

4. **Add Features**:
   - Order system (users can buy products)
   - Vendor registration (users can become sellers)
   - Product reviews and ratings
   - User profile settings
   - Email notifications

## Support

If users have issues:
- Check Render deployment logs
- Verify DATABASE_URL is set correctly
- Ensure JWT_SECRET is configured
- Check CORS allowed origins includes production URL
