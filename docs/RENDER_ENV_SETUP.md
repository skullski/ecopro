# Render Environment Setup Guide

## Required Environment Variables

Go to your Render dashboard at https://dashboard.render.com and configure these environment variables for your `ecopro` service:

### 1. DATABASE_URL
```
postgresql://<USER>:<PASSWORD>@<HOST>:5432/<DB_NAME>?sslmode=require
```
**Source**: Your PostgreSQL database connection string (External Database URL)

### 2. JWT_SECRET
```
your-super-secret-jwt-key-change-this-in-production-12345
```
**Important**: Generate a secure random string for production. You can use:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. ALLOWED_ORIGINS
```
https://ecopro-1lbl.onrender.com
```
**Purpose**: Allows CORS requests from your production URL

## Steps to Configure

1. Go to https://dashboard.render.com
2. Select your `ecopro` web service
3. Click on "Environment" in the left sidebar
4. Click "Add Environment Variable"
5. Add each variable above:
   - Key: `DATABASE_URL`
   - Value: (paste the PostgreSQL connection string)
   - Click "Save Changes"
6. Repeat for `JWT_SECRET` and `ALLOWED_ORIGINS`
7. Render will automatically redeploy your service

## Verify Deployment

After deployment completes:

1. Visit: https://ecopro-1lbl.onrender.com/api/ping
   - Should return: `{"message":"ping pong"}`

2. Test Database Connection:
   - Check deployment logs for: `✅ Database tables initialized`

3. Test Login:
   - Visit: https://ecopro-1lbl.onrender.com
   - Log in with your admin account

## Troubleshooting

### Database Connection Issues
- Ensure DATABASE_URL is the **External Database URL** from Render
- Check that SSL is enabled in the connection string
- Verify the database is in the same region or has external access enabled

### CORS Issues
- Make sure ALLOWED_ORIGINS includes your exact Render URL
- No trailing slash in the URL
- Check browser console for specific CORS errors

### Build Failures
- Check Render logs for errors
- Ensure all dependencies are in package.json
- Verify pnpm version matches packageManager field

## Current Configuration

- **Production URL**: https://ecopro-1lbl.onrender.com
- **Database**: PostgreSQL on Render (Oregon region)
- **API Health Check**: /api/ping
