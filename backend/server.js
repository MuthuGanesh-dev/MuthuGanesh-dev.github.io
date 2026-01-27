import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { simpleGit } from 'simple-git';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Configure CORS - allow both production and localhost
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'https://muthuganesh-dev.github.io'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || !process.env.FRONTEND_URL) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Configure multer for video uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP4, MOV, AVI, and WEBM videos are allowed.'));
    }
  }
});

// Repository configuration
const REPO_PATH = path.join(__dirname, process.env.REPO_PATH || 'repo-clone');
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO_URL = process.env.GITHUB_REPO_URL;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const GITHUB_EMAIL = process.env.GITHUB_EMAIL;

// Initialize Git repository
let git = null;

// Helper function to clean up Git lock files
async function cleanupGitLocks() {
  const lockFiles = [
    path.join(REPO_PATH, '.git', 'index.lock'),
    path.join(REPO_PATH, '.git', 'HEAD.lock'),
    path.join(REPO_PATH, '.git', 'refs', 'heads', 'main.lock')
  ];
  
  for (const lockFile of lockFiles) {
    try {
      await fs.access(lockFile);
      console.log(`🧹 Removing stale lock file: ${lockFile}`);
      await fs.unlink(lockFile);
    } catch (error) {
      // Lock file doesn't exist, which is fine
    }
  }
}

async function initializeRepo() {
  console.log('🔧 Initializing repository...');
  
  try {
    // Check if repo exists
    const repoExists = await fs.access(REPO_PATH).then(() => true).catch(() => false);
    
    if (!repoExists) {
      console.log('📥 Cloning repository for the first time...');
      await fs.mkdir(REPO_PATH, { recursive: true });
      
      // Clone with token authentication
      const repoUrlWithToken = GITHUB_REPO_URL.replace(
        'https://',
        `https://${GITHUB_TOKEN}@`
      );
      
      await simpleGit().clone(repoUrlWithToken, REPO_PATH);
      console.log('✅ Repository cloned successfully');
    }
    
    // Clean up any stale lock files
    await cleanupGitLocks();
    
    git = simpleGit(REPO_PATH);
    
    // Configure git user
    await git.addConfig('user.name', GITHUB_USERNAME);
    await git.addConfig('user.email', GITHUB_EMAIL);
    
    // Ensure LFS is installed
    await git.raw(['lfs', 'install']);
    
    // Pull latest changes
    await git.pull('origin', 'main');
    
    console.log('✅ Repository initialized and updated');
  } catch (error) {
    console.error('❌ Error initializing repository:', error);
    throw error;
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

// Upload video endpoint
app.post('/api/upload-video', upload.single('video'), async (req, res) => {
  console.log('📹 Video upload request received');
  
  try {
    // Ensure repo is initialized
    if (!git) {
      await initializeRepo();
    }
    
    // Clean up any stale lock files before Git operations
    await cleanupGitLocks();
    
    // Pull latest changes first
    console.log('🔄 Pulling latest changes...');
    await git.pull('origin', 'main');
    
    let videoUrl = '';
    let youtubeUrl = req.body.youtubeUrl || '';
    
    // Handle video file upload
    if (req.file) {
      // Generate unique filename
      const timestamp = Date.now();
      const originalName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${timestamp}_${originalName}`;
      
      // Save video to public/videos directory
      const videosDir = path.join(REPO_PATH, 'my-app', 'public', 'videos');
      await fs.mkdir(videosDir, { recursive: true });
      
      const videoPath = path.join(videosDir, filename);
      await fs.writeFile(videoPath, req.file.buffer);
      
      console.log(`💾 Video saved: ${filename}`);
      
      // Add to git (LFS will handle it automatically)
      const relativeVideoPath = path.join('my-app', 'public', 'videos', filename);
      await git.add(relativeVideoPath);
      
      videoUrl = `/videos/${filename}`;
    }
    
    // Update projects.json
    const projectsJsonPath = path.join(REPO_PATH, 'my-app', 'public', 'projects.json');
    let projectsData = { projects: [] };
    
    try {
      const jsonContent = await fs.readFile(projectsJsonPath, 'utf-8');
      projectsData = JSON.parse(jsonContent);
    } catch (error) {
      console.log('📝 Creating new projects.json');
    }
    
    // Add new project entry
    const newProject = {
      id: Date.now(),
      title: req.body.title || 'New Project',
      description: req.body.description || '',
      videoUrl: videoUrl,
      youtubeUrl: youtubeUrl,
      thumbnail: req.body.thumbnail || '',
      tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : [],
      createdAt: new Date().toISOString()
    };
    
    projectsData.projects.push(newProject);
    
    // Save updated projects.json
    await fs.writeFile(
      projectsJsonPath,
      JSON.stringify(projectsData, null, 2),
      'utf-8'
    );
    
    await git.add('my-app/public/projects.json');
    
    // Commit changes
    const commitMessage = `Add project: ${newProject.title}`;
    await git.commit(commitMessage);
    
    console.log('📝 Changes committed');
    
    // Push to GitHub
    console.log('⬆️  Pushing to GitHub...');
    await git.push('origin', 'main');
    
    console.log('✅ Upload complete!');
    
    const response = {
      success: true,
      message: youtubeUrl ? 'Project with YouTube video saved successfully' : 'Video uploaded successfully',
      project: newProject
    };
    
    // Only include filename for file uploads
    if (req.file) {
      response.filename = filename;
    }
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      error: 'Failed to upload video',
      details: error.message
    });
  }
});

// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    if (!git) {
      await initializeRepo();
    }
    
    // Clean up any stale lock files
    await cleanupGitLocks();
    
    // Pull latest changes
    await git.pull('origin', 'main');
    
    const projectsJsonPath = path.join(REPO_PATH, 'my-app', 'public', 'projects.json');
    const jsonContent = await fs.readFile(projectsJsonPath, 'utf-8');
    const projectsData = JSON.parse(jsonContent);
    
    res.json(projectsData);
  } catch (error) {
    console.error('❌ Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Delete project
app.delete('/api/projects/:id', async (req, res) => {
  try {
    if (!git) {
      await initializeRepo();
    }
    
    // Clean up any stale lock files
    await cleanupGitLocks();
    
    await git.pull('origin', 'main');
    
    const projectId = parseInt(req.params.id);
    const projectsJsonPath = path.join(REPO_PATH, 'my-app', 'public', 'projects.json');
    
    const jsonContent = await fs.readFile(projectsJsonPath, 'utf-8');
    const projectsData = JSON.parse(jsonContent);
    
    const projectIndex = projectsData.projects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const project = projectsData.projects[projectIndex];
    
    // Delete video file if exists
    if (project.videoUrl) {
      const videoFilename = project.videoUrl.replace('/videos/', '');
      const videoPath = path.join(REPO_PATH, 'my-app', 'public', 'videos', videoFilename);
      
      try {
        await fs.unlink(videoPath);
        await git.rm(['my-app/public/videos/' + videoFilename]);
      } catch (error) {
        console.log('Video file not found or already deleted');
      }
    }
    
    // Remove project from array
    projectsData.projects.splice(projectIndex, 1);
    
    // Save updated projects.json
    await fs.writeFile(
      projectsJsonPath,
      JSON.stringify(projectsData, null, 2),
      'utf-8'
    );
    
    await git.add('my-app/public/projects.json');
    await git.commit(`Delete project: ${project.title}`);
    await git.push('origin', 'main');
    
    res.json({ success: true, message: 'Project deleted successfully' });
    
  } catch (error) {
    console.error('❌ Delete error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Initialize repository on startup
initializeRepo().catch(console.error);

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📁 Repository path: ${REPO_PATH}`);
  console.log(`🌐 Accepting requests from: ${process.env.FRONTEND_URL || '*'}`);
});
