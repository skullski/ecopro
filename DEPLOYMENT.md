# 🚀 Deployment Checklist

## Before Deploying

- [ ] All code changes committed
- [ ] Tested locally with `pnpm dev`
- [ ] Build works with `pnpm build`
- [ ] No TypeScript errors (`pnpm typecheck`)

## Step-by-Step Deployment

### 1️⃣ Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: Multi-vendor marketplace"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

**OR use the automated script:**
```bash
chmod +x deploy.sh
./deploy.sh
```

### 2️⃣ Deploy on Vercel

1. **Go to**: [vercel.com](https://vercel.com)
2. **Sign in** with GitHub
3. **Click**: "Add New" → "Project"
4. **Import** your repository from GitHub
5. **Settings** (auto-detected):
   - Framework Preset: Other
   - Build Command: `pnpm build`
   - Output Directory: `dist`
   - Install Command: `pnpm install`
6. **Click**: "Deploy"
7. **Wait**: ~2 minutes ⏱️
8. **Done**: Your app is live! 🎉

### 3️⃣ Important URLs

After deployment, your app will have these URLs:

All 3 users should use the **same Vercel URL** so they share data!

Example:
- User 1: Opens `https://your-app.vercel.app/marketplace`
- User 2: Opens `https://your-app.vercel.app/marketplace`
- User 3: Opens `https://your-app.vercel.app/marketplace`
## ⚠️ Known Limitations

- Data not persisted between deployments

**For Production:**
Consider adding a database:
- [ ] Supabase (free tier)
- [ ] MongoDB Atlas (free tier)
- [ ] PostgreSQL on Vercel
- [ ] Firebase

## 🔄 Future Updates

To deploy updates:

```bash
git add .
git commit -m "Your update description"
git push

# Vercel will auto-deploy on push!
```

## 🆘 Troubleshooting

### Build fails on Vercel
- Check Vercel build logs
- Run `pnpm build` locally to test
- Ensure all dependencies are in `package.json`

### API routes not working
- Check `vercel.json` is in root
- Verify routes in `server/index.ts`
- Check Vercel Functions logs

### Data not persisting
- Expected with current in-memory setup
- Add database for persistence

## ✅ Post-Deployment Checklist

- [ ] Test vendor registration
- [ ] Test product creation
- [ ] Test product visibility in marketplace
- [ ] Test from different devices/networks
- [ ] Share URL with team
- [ ] Monitor Vercel dashboard for errors

## 📞 Need Help?

- Vercel Docs: https://vercel.com/docs
- GitHub Issues: Create issue in your repo
- Vercel Discord: https://vercel.com/discord
