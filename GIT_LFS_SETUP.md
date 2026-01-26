# 🎬 Git LFS Setup Guide for Video Files

## 🚨 Problem Summary

Your current setup:
- ❌ Videos encoded as base64 in `projects.json` (causes file size explosion)
- ❌ GitHub API upload has 100MB limit
- ❌ Repository becomes bloated and slow

## ✅ Solution: Git LFS (Large File Storage)

Git LFS stores large files outside the repository and replaces them with pointer files.

---

## 📋 Prerequisites

1. Git installed on your system
2. GitHub repository access
3. Videos in `my-app/public/videos/` folder

---

## 🔧 Step-by-Step Setup

### Step 1: Install Git LFS

**Windows:**
```bash
# Download and install from: https://git-lfs.github.com/
# Or using chocolatey:
choco install git-lfs
```

**Mac:**
```bash
brew install git-lfs
```

**Linux:**
```bash
sudo apt-get install git-lfs
```

### Step 2: Initialize Git LFS in Your Repository

```bash
# Navigate to your repository root
cd d:\All_React_app\Muthuganesh_portfolio

# Initialize Git LFS
git lfs install
```

### Step 3: Track Video Files with LFS

```bash
# Track all video files in the videos folder
git lfs track "my-app/public/videos/*.mp4"
git lfs track "my-app/public/videos/*.webm"
git lfs track "my-app/public/videos/*.mov"
git lfs track "my-app/public/videos/*.avi"

# This creates/updates .gitattributes file
git add .gitattributes
git commit -m "Configure Git LFS for video files"
```

### Step 4: Migrate Existing Videos to LFS

```bash
# If you already committed large videos, migrate them:
git lfs migrate import --include="my-app/public/videos/*.mp4" --everything

# Or for specific file types:
git lfs migrate import --include="*.mp4,*.webm,*.mov" --include-ref=refs/heads/main
```

### Step 5: Verify LFS Tracking

```bash
# Check what files are tracked by LFS
git lfs ls-files

# Check LFS status
git lfs status
```

### Step 6: Add and Commit Videos

```bash
# Add videos
git add my-app/public/videos/

# Commit
git commit -m "Add video files via LFS"

# Push to GitHub (this will upload to LFS storage)
git push origin main
```

---

## 📁 Updated Project Structure

```
projects.json → Stores only video URLs (NOT base64)
{
  "projects": [
    {
      "title": "My Project",
      "videoUrl": "/videos/my-project-1234567890.mp4"  ← Just the path!
    }
  ]
}

public/videos/
  ├── video1.mp4 (Git LFS pointer)
  ├── video2.mp4 (Git LFS pointer)
  └── video3.webm (Git LFS pointer)
```

---

## 🔄 How to Add New Videos

### Method 1: Manual Upload (Recommended for Large Files)

```bash
# 1. Copy video to videos folder
cp /path/to/new-video.mp4 my-app/public/videos/project-name-123.mp4

# 2. Add and commit (LFS handles it automatically)
git add my-app/public/videos/project-name-123.mp4
git commit -m "Add project video"
git push

# 3. Update projects.json with just the path
# videoUrl: "/videos/project-name-123.mp4"
```

### Method 2: Via Upload Form (For Users)

Your existing `lfsVideoStorage.js` needs updates - see UPDATED_VIDEO_WORKFLOW.md

---

## ⚠️ Important Notes

### GitHub LFS Limits

**Free Account:**
- Storage: 1 GB
- Bandwidth: 1 GB/month

**Pro Account ($4/month):**
- Storage: 50 GB
- Bandwidth: 50 GB/month

### Alternative: External Hosting

If you exceed LFS limits, consider:

1. **Cloudflare R2** (10GB free)
2. **AWS S3** (5GB free for 12 months)
3. **Cloudinary** (25GB free)
4. **Bunny CDN** (Storage + CDN)

---

## 🧹 Cleaning Up Existing Base64 Videos

### Step 1: Extract Videos from projects.json

```bash
# Run this cleanup script
npm run cleanup:videos
```

### Step 2: Update projects.json Structure

Remove base64 data, keep only paths:

```json
{
  "projects": [
    {
      "title": "Project 1",
      "description": "Description here",
      "tech": ["React", "Node"],
      "videoUrl": "/videos/project1.mp4"  ← Clean path only
    }
  ]
}
```

---

## ✅ Verification Checklist

- [ ] Git LFS installed: `git lfs version`
- [ ] LFS initialized: `git lfs install`
- [ ] Video files tracked: Check `.gitattributes`
- [ ] Videos in LFS: `git lfs ls-files`
- [ ] projects.json contains only paths (not base64)
- [ ] Videos load on website
- [ ] Repository size reduced

---

## 🐛 Troubleshooting

### Videos Not Uploading to LFS

```bash
# Check LFS configuration
cat .gitattributes

# Re-track files
git lfs track "my-app/public/videos/*.mp4"
git add .gitattributes
git commit -m "Fix LFS tracking"
```

### "This exceeds GitHub's file size limit"

```bash
# File is too large even for LFS (5GB limit per file)
# Solution: Compress the video

# Using ffmpeg:
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k output.mp4
```

### Reduce Video File Size

```bash
# Install ffmpeg (if not installed)
# Windows: choco install ffmpeg
# Mac: brew install ffmpeg

# Compress video to ~50% original size
ffmpeg -i large-video.mp4 -vcodec h264 -acodec aac compressed-video.mp4

# Compress with quality control (lower CRF = better quality)
ffmpeg -i input.mp4 -c:v libx264 -crf 28 -c:a aac output.mp4
```

---

## 📊 Monitoring LFS Usage

```bash
# Check your LFS storage
git lfs env

# View LFS bandwidth/storage on GitHub:
# https://github.com/YOUR_USERNAME/YOUR_REPO/settings/billing
```

---

## 🚀 Next Steps

1. ✅ Set up Git LFS (this guide)
2. 📝 Update upload workflow (see next guide)
3. 🧹 Clean up existing projects.json
4. 🎯 Test video uploads
5. 🌐 Deploy to GitHub Pages

Would you like me to create the updated video upload workflow guide?
