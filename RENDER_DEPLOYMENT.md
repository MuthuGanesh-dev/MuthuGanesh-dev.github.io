# Render Backend Deployment Guide

## 🚀 Deploy Updated Backend to Render

Your backend on Render needs to be updated with the new PDF upload functionality. Follow these steps:

## Step 1: Push Your Code to GitHub

```bash
git add .
git commit -m "Add PDF upload support to backend"
git push origin main
```

## Step 2: Configure Environment Variables on Render

Go to your Render dashboard and set these environment variables:

### Required Environment Variables:

1. **GITHUB_TOKEN**
   - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Click "Generate new token (classic)"
   - Give it a name like "Portfolio Backend"
   - Select scopes: `repo` (all repo permissions)
   - Copy the token and add it to Render

2. **GITHUB_REPO_URL**
   ```
   https://github.com/MuthuGanesh-dev/MuthuGanesh-dev.github.io.git
   ```

3. **GITHUB_USERNAME**
   ```
   MuthuGanesh-dev
   ```

4. **GITHUB_EMAIL**
   ```
   smuthuganesh01@gmail.com
   ```

5. **PORT**
   ```
   3001
   ```

6. **FRONTEND_URL**
   ```
   https://muthuganesh-dev.github.io
   ```

7. **REPO_PATH**
   ```
   ./repo-clone
   ```

## Step 3: Enable Git LFS on Render

In your Render service settings:

1. Go to **Settings** → **Build & Deploy**
2. Add a **Build Command**:
   ```bash
   git lfs install && npm install
   ```

This ensures Git LFS is installed before your service starts.

## Step 4: Verify Deployment

After deployment, check your backend health:

Visit: `https://portfolio-backend-914r.onrender.com/health`

You should see:
```json
{
  "status": "ok",
  "message": "Backend server is running",
  "environment": "configured",
  "variables": {
    "GITHUB_TOKEN": true,
    "GITHUB_REPO_URL": true,
    "GITHUB_USERNAME": true,
    "GITHUB_EMAIL": true
  }
}
```

If any variable shows `false`, add it in Render's environment variables.

## Step 5: Test PDF Upload

1. Open your portfolio: https://muthuganesh-dev.github.io
2. Click "Add Project"
3. Enter password: `ganesh3012`
4. Fill in project details
5. Upload a video OR YouTube URL
6. Upload a PDF (optional)
7. Click "Add Project"

## Troubleshooting

### Error: "GITHUB_TOKEN environment variable is not set"
- Add the GitHub token in Render environment variables
- Restart the service

### Error: "Failed to upload project"
- Check Render logs for detailed error
- Ensure Git LFS is installed in build command
- Verify all environment variables are set

### 500 Internal Server Error
- Check Render logs: Dashboard → Your Service → Logs
- Look for the specific error message
- Most common issue: missing environment variables

## What's New

✅ **PDF File Support**
- PDFs stored in `public/docs/` folder
- Uses Git LFS for large files
- Max size: 50MB

✅ **Better Error Handling**
- Detailed error messages
- Environment validation on startup
- Health check endpoint shows configuration status

✅ **Project Links**
- Optional "Learn More" button
- Links to GitHub repos, demos, or documentation
