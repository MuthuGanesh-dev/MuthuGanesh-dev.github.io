// Backend API storage - handles video uploads with Git LFS

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

/**
 * Upload video and project data to backend
 * @param {Object} projectData - Project metadata
 * @param {File} videoFile - Video file to upload
 * @param {string} password - Admin password for authentication
 * @returns {Promise<{success: boolean, message: string, project?: Object}>}
 */
export async function uploadProjectWithVideo(projectData, videoFile, password) {
  // Validate admin password (you should set this in .env as VITE_ADMIN_PASSWORD)
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
  
  if (password !== adminPassword) {
    return {
      success: false,
      message: 'Invalid admin password'
    };
  }

  if (!videoFile) {
    return {
      success: false,
      message: 'No video file provided'
    };
  }

  try {
    // Create form data
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('title', projectData.title || 'New Project');
    formData.append('description', projectData.description || '');
    formData.append('thumbnail', projectData.thumbnail || '');
    formData.append('tags', projectData.tags ? projectData.tags.join(',') : '');

    // Upload to backend
    const response = await fetch(`${BACKEND_URL}/api/upload-video`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || error.error || 'Upload failed');
    }

    const result = await response.json();

    return {
      success: true,
      message: 'Video uploaded successfully! Changes will be live in 2-3 minutes.',
      project: result.project
    };

  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      message: `Error: ${error.message}`
    };
  }
}

/**
 * Load projects from backend
 * @returns {Promise<Array>} Array of projects
 */
export async function loadProjectsFromBackend() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/projects`);

    if (!response.ok) {
      throw new Error('Failed to load projects');
    }

    const data = await response.json();
    return data.projects || [];
  } catch (error) {
    console.error('Error loading projects from backend:', error);
    // Fallback to direct fetch from GitHub Pages
    return loadProjectsFromGitHub();
  }
}

/**
 * Delete project from backend
 * @param {number} projectId - Project ID to delete
 * @param {string} password - Admin password for authentication
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function deleteProjectFromBackend(projectId, password) {
  // Validate admin password
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
  
  if (password !== adminPassword) {
    return {
      success: false,
      message: 'Invalid admin password'
    };
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/projects/${projectId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Delete failed');
    }

    const result = await response.json();

    return {
      success: true,
      message: 'Project deleted successfully!'
    };

  } catch (error) {
    console.error('Delete error:', error);
    return {
      success: false,
      message: `Error: ${error.message}`
    };
  }
}

/**
 * Fallback: Load projects directly from GitHub Pages
 * @returns {Promise<Array>} Array of projects
 */
async function loadProjectsFromGitHub() {
  try {
    const response = await fetch('/projects.json');
    
    if (!response.ok) {
      throw new Error('Failed to load projects');
    }

    const data = await response.json();
    return data.projects || [];
  } catch (error) {
    console.error('Error loading projects:', error);
    return [];
  }
}

/**
 * Check backend health
 * @returns {Promise<boolean>} True if backend is reachable
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    return response.ok;
  } catch (error) {
    console.log('Backend not reachable:', error.message);
    return false;
  }
}
