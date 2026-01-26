# Backend Deployment Guide

This guide will help you deploy the portfolio backend server to Railway or Render (free tier).

## 🎯 What the Backend Does

The backend server:
- Receives video uploads from your portfolio website
- Saves videos to `my-app/public/videos/` directory
- Commits and pushes to GitHub using Git LFS
- Updates `projects.json` automatically
- Triggers GitHub Pages rebuild (your site updates in 2-3 minutes)

## 📋 Prerequisites

1. **GitHub Personal Access Token (PAT)**
   - Go to https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select scopes:
     - ✅ `repo` (Full control of private repositories)
   - Copy the token (starts with `ghp_...`)
   - **Save it securely** - you won't see it again

2. **Git LFS Installed**
   - Already configured in your repo (✅ Done!)
   - Railway/Render will automatically handle LFS

## 🚂 Option 1: Deploy to Railway (Recommended)

### Step 1: Sign Up
1. Go to https://railway.app
2. Sign up with your GitHub account
3. Free tier: 500 hours/month, $5 credit

### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository: `MuthuGanesh-dev/MuthuGanesh-dev.github.io`

### Step 3: Configure Service
1. Click "Add a Service" → "GitHub Repo"
2. Select the `backend` folder as root directory
3. Railway will auto-detect Node.js

### Step 4: Add Environment Variables
In Railway dashboard, go to "Variables" tab and add:

```
GITHUB_TOKEN=ghp_YOUR_TOKEN_HERE
GITHUB_REPO_URL=https://github.com/MuthuGanesh-dev/MuthuGanesh-dev.github.io.git
GITHUB_USERNAME=MuthuGanesh-dev
GITHUB_EMAIL=your-email@example.com
PORT=3001
FRONTEND_URL=https://muthuganesh-dev.github.io
REPO_PATH=./repo-clone
```

**Important:** Replace:
- `ghp_YOUR_TOKEN_HERE` with your actual GitHub token
- `your-email@example.com` with your GitHub email

### Step 5: Deploy
1. Railway will automatically deploy
2. Wait 2-3 minutes for deployment
3. You'll get a URL like: `https://your-app.railway.app`

### Step 6: Update Frontend
1. Open `my-app/.env`
2. Update `VITE_BACKEND_URL`:
   ```
   VITE_BACKEND_URL=https://your-app.railway.app
   ```
3. Commit and push to GitHub:
   ```bash
   git add my-app/.env
   git commit -m "Update backend URL"
   git push
   ```

---

## 🎨 Option 2: Deploy to Render

### Step 1: Sign Up
1. Go to https://render.com
2. Sign up with your GitHub account
3. Free tier: 750 hours/month

### Step 2: Create Web Service
1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Select: `MuthuGanesh-dev/MuthuGanesh-dev.github.io`

### Step 3: Configure Service
```
Name: portfolio-backend
Root Directory: backend
Environment: Node
Build Command: npm install
Start Command: npm start
```

### Step 4: Add Environment Variables
In "Environment" section, add:

```
GITHUB_TOKEN=ghp_YOUR_TOKEN_HERE
GITHUB_REPO_URL=https://github.com/MuthuGanesh-dev/MuthuGanesh-dev.github.io.git
GITHUB_USERNAME=MuthuGanesh-dev
GITHUB_EMAIL=your-email@example.com
PORT=3001
FRONTEND_URL=https://muthuganesh-dev.github.io
REPO_PATH=./repo-clone
```

### Step 5: Deploy
1. Click "Create Web Service"
2. Wait 5-10 minutes for first deployment
3. You'll get a URL like: `https://portfolio-backend-xyz.onrender.com`

### Step 6: Update Frontend
Same as Railway - update `VITE_BACKEND_URL` in `my-app/.env`

---

## 🧪 Testing the Backend

### Test Locally First

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` with your values:**
   ```
   GITHUB_TOKEN=ghp_YOUR_TOKEN_HERE
   GITHUB_REPO_URL=https://github.com/MuthuGanesh-dev/MuthuGanesh-dev.github.io.git
   GITHUB_USERNAME=MuthuGanesh-dev
   GITHUB_EMAIL=your-email@example.com
   PORT=3001
   FRONTEND_URL=http://localhost:5173
   REPO_PATH=./repo-clone
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

5. **Test health endpoint:**
   Open browser: http://localhost:3001/health
   
   Should see:
   ```json
   {"status":"ok","message":"Backend server is running"}
   ```

### Test Upload

1. **Start frontend:**
   ```bash
   cd ../my-app
   npm run dev
   ```

2. **Open website:** http://localhost:5173

3. **Login with password:** `ganesh3012`

4. **Upload a test video**

5. **Check logs** in backend terminal

---

## 🔒 Security Notes

1. **Never commit `.env` files** with real tokens
   - `.env` is already in `.gitignore` ✅

2. **Rotate your GitHub token** if exposed

3. **Change admin password** in production:
   - Update `VITE_ADMIN_PASSWORD` in `my-app/.env`

4. **Enable CORS properly**:
   - Backend only accepts requests from your frontend URL

---

## 🐛 Troubleshooting

### Backend won't start
**Error:** `GITHUB_TOKEN is required`
- **Fix:** Add environment variables in Railway/Render dashboard

### Video upload fails
**Error:** `Failed to push to GitHub`
- **Fix:** Check GitHub token has `repo` scope
- **Fix:** Verify email and username are correct

### Git LFS not working
**Error:** `git: 'lfs' is not a git command`
- **Fix:** Railway/Render should auto-install Git LFS
- **Fix:** Add to `package.json` scripts:
  ```json
  "postinstall": "git lfs install"
  ```

### Cold starts (30 seconds delay)
- **Normal** for free tier
- Backend sleeps after 15 minutes of inactivity
- First request wakes it up (~30 seconds)

### CORS errors
**Error:** `Access to fetch blocked by CORS`
- **Fix:** Verify `FRONTEND_URL` matches your actual frontend URL
- **Fix:** Check both `http://` and `https://`

---

## 📊 Free Tier Limits

### Railway
- ✅ 500 hours/month
- ✅ $5 credit
- ✅ Auto-sleep after 15min inactivity
- ✅ Good for this use case

### Render
- ✅ 750 hours/month
- ✅ Auto-sleep after 15min inactivity
- ⚠️ Slower cold starts (~1 minute)
- ✅ Good for this use case

### GitHub LFS
- ✅ 1 GB storage (free)
- ✅ 1 GB bandwidth/month (free)
- ⚠️ Your 3 videos scenario: ~300MB used
- ✅ Plenty of space for portfolio

---

## 🎬 Complete Workflow

### Your Friend Uploads a Video:

1. **Friend visits:** https://muthuganesh-dev.github.io
2. **Clicks:** "Add New Project" button
3. **Enters password:** `ganesh3012`
4. **Fills in:**
   - Project title
   - Description
   - Tech stack (comma-separated)
5. **Uploads video file**
6. **Clicks:** "Add Project"

### What Happens Behind the Scenes:

1. **Frontend** sends video + data to backend
2. **Backend** wakes up (if sleeping, ~30 seconds)
3. **Backend** clones/pulls latest from GitHub
4. **Backend** saves video to `public/videos/`
5. **Backend** updates `projects.json`
6. **Backend** commits with Git LFS
7. **Backend** pushes to GitHub
8. **GitHub Pages** rebuilds site (2-3 minutes)
9. **Video is live!** 🎉

### You (Developer) Just:
- Maintain the code
- Monitor backend logs (optional)
- Update features as needed

---

## 💰 Cost Estimate

**For your use case (3 videos, then months gap):**

| Service | Cost |
|---------|------|
| Railway Backend | **FREE** (under 500h limit) |
| Render Backend | **FREE** (under 750h limit) |
| GitHub LFS | **FREE** (under 1GB storage) |
| GitHub Pages | **FREE** (always) |
| **Total** | **$0/month** 🎉 |

---

## 🚀 Next Steps

1. ✅ Choose Railway or Render
2. ✅ Deploy backend following steps above
3. ✅ Update `VITE_BACKEND_URL` in `my-app/.env`
4. ✅ Test with a sample video
5. ✅ Share website with your friend
6. ✅ Enjoy automated uploads!

---

## 📞 Support

If you encounter issues:
1. Check backend logs in Railway/Render dashboard
2. Test with http://localhost:3001/health
3. Verify environment variables are set correctly
4. Check GitHub token permissions

**Pro tip:** Keep backend logs open when testing uploads to see real-time progress.
