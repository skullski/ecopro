# 🚀 Quick Start: Deploy to GitHub & Vercel

## Method 1: Automated Script (Easiest)

Run the setup script in your terminal:

```bash
./setup-and-deploy.sh
```

The script will:
1. Ask for your name and email (for Git commits)
2. Create initial commit
3. Ask for your GitHub repository URL
4. Push code to GitHub
5. Give you Vercel deployment instructions

## Method 2: Manual Steps

### Step 1: Configure Git

```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### Step 2: Create Initial Commit

```bash
git commit -m "Initial commit: Multi-vendor marketplace"
```

### Step 3: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `ecopro` (or your choice)
3. Click "Create repository"
4. Copy the repository URL

### Step 4: Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 5: Deploy on Vercel

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New" → "Project"
4. Import your repository
5. Click "Deploy"

**Done!** Your app will be live in ~2 minutes! 🎉

## 📱 After Deployment

Your app will be at: `https://your-app.vercel.app`

**Share this URL with all 3 users!** Everyone using the same Vercel URL will see the same data.

### Important Pages:

- **Main Store**: `/marketplace` - Where customers browse
- **Vendor Signup**: `/vendor/signup` - Register as seller
- **Vendor Dashboard**: `/vendor/:id/dashboard` - Manage products
- **Admin Preview**: `/admin/preview` - View your store

## 🔄 To Update Later

```bash
# Make changes to your code
git add .
git commit -m "Your update description"
git push

# Vercel auto-deploys on every push!
```

## ⚠️ Important Notes

1. **Data Storage**: Currently uses in-memory storage (resets on restart)
2. **Production**: Consider adding a database (Supabase, MongoDB, etc.)
3. **Shared Access**: All users must use the SAME Vercel URL to see shared data

## 🆘 Need Help?

Check these files:
- `DEPLOYMENT.md` - Detailed deployment guide
- `README.md` - Full project documentation
- Vercel Docs: https://vercel.com/docs

---

**Ready to deploy?** Run: `./setup-and-deploy.sh`
