# PostgreSQL Database Setup Guide

## 📋 Steps to Connect to Render Database

### 1. Get Your Database URL from Render

1. Go to your Render Dashboard: https://dashboard.render.com
2. Click on your PostgreSQL database
3. Find the **"Internal Database URL"** section
4. Copy the full connection string (it looks like this):
   ```
   postgresql://username:password@dpg-xxxxx-xxx.oregon-postgres.render.com/database_name
   ```

### 2. Add Database URL to `.env` File

Open `/home/skull/Desktop/ecopro/.env` and replace the `DATABASE_URL` with your actual connection string:

```properties
DATABASE_URL=postgresql://your_actual_username:your_actual_password@dpg-xxxxx.render.com:5432/your_database_name
```

### 3. Restart Your Development Server

```bash
# Stop current server (Ctrl+C)
# Then restart:
pnpm dev
```

### 4. Verify Database Connection

The server will automatically:
- ✅ Create the `users` table
- ✅ Create default admin user (admin@ecopro.com / <ADMIN_PASSWORD>)
- ✅ Show success messages in console

## 🎯 What Changed?

### Before (JSON File Storage)
- Users stored in `data/users.json`
- Lost when deploying to different servers
- No concurrent access support

### After (PostgreSQL)
- Users stored in Render PostgreSQL database
- Persistent across deployments
- Supports concurrent users
- Production-ready
- Automatic backups (Render feature)

## 🔒 Environment Variables Needed

Make sure these are set in your `.env` file:

```properties
DATABASE_URL=postgresql://...       # Your Render database URL
JWT_SECRET=your-secret-key         # For token signing
NODE_ENV=development               # Or production
PORT=8080                          # API server port
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8080
```

## 🚀 Deploy to Production (Render)

When deploying to Render:

1. **Web Service Environment Variables:**
   - Add `DATABASE_URL` (copy from your Render database)
   - Add `JWT_SECRET` (generate a strong secret)
   - Add `NODE_ENV=production`
   - Add `ALLOWED_ORIGINS=https://your-frontend-url.com`

2. **Database will automatically:**
   - Create tables on first connection
   - Create default admin user
   - Handle migrations

## 🧪 Test Database Connection

Run the auth tests:
```bash
chmod +x test-auth.sh
./test-auth.sh
```

This will:
- Create a test user in the database
- Verify login works
- Check token authentication
- Test admin account

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Troubleshooting

### Connection Error
- ✅ Check DATABASE_URL is correct
- ✅ Verify database is running on Render
- ✅ Check firewall/network settings

### SSL Error
- The code automatically handles SSL for production
- Development uses non-SSL by default

### Permission Error
- Make sure database user has CREATE TABLE permissions
- Render databases usually have full permissions by default

## 📝 Next Steps

1. **Copy your Internal Database URL from Render**
2. **Paste it into `.env` file**
3. **Restart server with `pnpm dev`**
4. **Test signup/login at http://localhost:5173**

All user data will now be stored in your Render PostgreSQL database! 🎉
