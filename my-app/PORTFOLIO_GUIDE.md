# Portfolio Project Management System

## 🚀 How to Run (For Cross-Device Access)

### Method 1: Run Both Servers Together (Recommended)

```bash
npm run dev:full
```

This starts:

- Frontend (Vite): http://localhost:5173
- Backend API: http://localhost:3001

### Method 2: Run Separately

Terminal 1:

```bash
npm run dev
```

Terminal 2:

```bash
npm run server
```

## 📁 How Projects Are Saved

Projects are saved to `public/projects.json` file. This file can be:

1. **Committed to Git** - Share across all devices via GitHub/GitLab
2. **Copied manually** - Transfer the file between computers
3. **Synced via cloud** - Use Dropbox/Google Drive for the project folder

## 🔄 Accessing Projects on Another Laptop

### Option 1: Using Git (Recommended)

```bash
# On your first laptop (after adding projects)
git add public/projects.json
git commit -m "Updated projects"
git push

# On your second laptop
git pull
npm run dev:full
```

### Option 2: Manual File Transfer

1. Copy `public/projects.json` from first laptop
2. Paste it in the same location on second laptop
3. Run `npm run dev:full`

### Option 3: Deploy to Production

Deploy your portfolio to:

- **Vercel/Netlify**: Automatic deployment from Git
- **Your own server**: Upload the built files
- Projects will be accessible from anywhere!

## 📝 Adding New Projects

1. Click "Add Project" button
2. Fill in:
   - **Title**: Project name
   - **Description**: What it does
   - **Technologies**: Comma-separated (e.g., "Arduino, C++, Sensors")
   - **Video URL**: `/videos/filename.mp4` (upload to `public/videos/` first)
   - **PDF URL**: `/docs/filename.pdf` (upload to `public/docs/` first)
3. Click "Add Project"
4. **Important**: Commit the updated `projects.json` to Git!

## 📂 File Structure

```
my-app/
├── public/
│   ├── projects.json       ← Your projects data
│   ├── videos/            ← Upload video files here
│   └── docs/              ← Upload PDF files here
├── server.js              ← API backend
└── src/
    └── pages/
        └── Portfolio.jsx  ← Main portfolio component
```

## 🌐 For Production Deployment

When deploying, you'll need a backend service. Options:

1. **Serverless Functions** (Vercel/Netlify)
2. **Backend Hosting** (Render, Railway, Heroku)
3. **Firebase/Supabase** (Real-time database)

For now, the JSON file method works great for development and can be committed to version control!
