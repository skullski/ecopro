# 🚀 Deploying to Render - Single Web Service

This guide shows you how to deploy your React + Node.js app together on Render using a **single Web Service**.

## 📋 How It Works

1. **Build Process**: 
   - Vite builds your React app → `dist/` folder
   - Backend builds separately → `dist/server/` folder

2. **Server Setup**:
   - Express serves the React build as static files
   - All `/api/*` routes go to backend
   - All other routes serve `index.html` (React SPA routing)

3. **Deployment**:
   - Push to GitHub
   - Render automatically builds and deploys
   - Single URL for both frontend and backend

## 🛠️ Setup Steps

### 1. Push Your Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/ecopro.git
git push -u origin main
```

### 2. Create Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `ecopro` (or your choice)
   - **Runtime**: `Node`
   - **Build Command**: `pnpm install && pnpm run render:build`
   - **Start Command**: `pnpm start`
   - **Plan**: Choose Free or Paid

### 3. Environment Variables

Add these in Render dashboard (Environment tab):

```
NODE_ENV=production
PORT=10000
PING_MESSAGE=Server is running!
```

### 4. Deploy!

Click **"Create Web Service"** and Render will:
- Install dependencies
- Build React app
- Build Node.js server
- Start the server
- Give you a URL like: `https://ecopro.onrender.com`

## 🔧 Configuration Files

### `server/index.ts` (Updated)

```typescript
import path from "path";

// ... other code ...

// Serve static files from React build
const clientBuildPath = path.join(__dirname, "../dist");
app.use(express.static(clientBuildPath));

// Handle React routing
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});
```

### `package.json` (Updated)

```json
"scripts": {
  "build": "npm run build:client && npm run build:server",
  "build:client": "vite build",
  "build:server": "vite build --config vite.config.server.ts",
  "start": "node dist/server/node-build.mjs",
  "render:build": "npm run build"
}
```

### `render.yaml` (Optional)

Use this for automatic deployment configuration:

```yaml
services:
  - type: web
    name: ecopro
    runtime: node
    buildCommand: pnpm install && pnpm run render:build
    startCommand: pnpm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
    healthCheckPath: /api/ping
```

## 🌍 API Endpoints

After deployment, your API will be available at:

- `https://your-app.onrender.com/api/ping`
- `https://your-app.onrender.com/api/vendors`
- `https://your-app.onrender.com/api/products`

## 🎨 Frontend Routes

All React routes work automatically:

- `https://your-app.onrender.com/` (Homepage)
- `https://your-app.onrender.com/store` (Marketplace)
- `https://your-app.onrender.com/admin` (Admin Dashboard)
- `https://your-app.onrender.com/vendor-dashboard` (Vendor Panel)

## ⚡ Free Tier Notes

- **Sleep Mode**: Free services sleep after 15 min of inactivity
- **First Request**: May take 30-60 seconds to wake up
- **Solution**: Upgrade to paid plan ($7/month) for always-on

## 🔍 Troubleshooting

### Build Fails

1. Check Node version in Render (should be 18+)
2. Ensure all dependencies are in `package.json`
3. Check build logs for errors

### 404 on React Routes

Make sure the catch-all route is **AFTER** all API routes:

```typescript
// ✅ Correct order
app.get("/api/products", ...);  // API routes first
app.get("*", ...);               // Catch-all LAST
```

### Environment Variables

If `.env` values aren't working, add them in Render dashboard manually.

## 🚀 Automatic Deployments

Render automatically deploys when you push to `main`:

```bash
git add .
git commit -m "Update dashboard design"
git push origin main
```

Render will detect changes and redeploy automatically!

## 📱 Custom Domain

1. Go to Render dashboard → Your service → Settings
2. Click "Add Custom Domain"
3. Add your domain (e.g., `ecopro.com`)
4. Update DNS records as shown

## 🔐 HTTPS

Render provides **free automatic HTTPS** for all domains!

## 💡 Pro Tips

1. **Test Locally First**: Run `pnpm build && pnpm start` locally
2. **Check Logs**: Use Render logs to debug issues
3. **Health Checks**: Use `/api/ping` endpoint
4. **Database**: Add Render PostgreSQL or MongoDB Atlas
5. **File Uploads**: Use Cloudinary or AWS S3 (Render filesystem is ephemeral)

## 🎯 Next Steps

- [ ] Connect a database (PostgreSQL/MongoDB)
- [ ] Set up Redis for caching
- [ ] Add error monitoring (Sentry)
- [ ] Configure CDN for static assets
- [ ] Set up automated backups

---

**Need Help?** Check [Render Documentation](https://render.com/docs) or [Discord](https://discord.gg/render)
