// Backend API storage - handles video uploads with Git LFS

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

/**
 * Upload video and project data to backend
 * @param {Object} projectData - Project metadata
 * @param {File} videoFile - Video file to upload
 * @param {string} password - Admin password for authentication
 * @param {Function} onProgress - Optional callback for upload progress (0-100)
 * @returns {Promise<{success: boolean, message: string, project?: Object}>}
 */
export async function uploadProjectWithVideo(projectData, videoFile, password, onProgress) {
  // Validate admin password (you should set this in .env as VITE_ADMIN_PASSWORD)
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
  
  if (password !== adminPassword) {
    return {
      success: false,
      message: 'Invalid admin password'
    };
  }

  // YouTube URL doesn't need a video file
  if (!videoFile && !projectData.youtubeUrl) {
    return {
      success: false,
      message: 'No video file or YouTube URL provided'
    };
  }

  try {
    // Create form data
    const formData = new FormData();
    if (videoFile) {
      formData.append('video', videoFile);
    }
    formData.append('title', projectData.title || 'New Project');
    formData.append('description', projectData.description || '');
    formData.append('thumbnail', projectData.thumbnail || '');
    formData.append('tags', projectData.tags ? projectData.tags.join(',') : '');
    if (projectData.youtubeUrl) {
      formData.append('youtubeUrl', projectData.youtubeUrl);
    }

    // Use XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          onProgress(percentComplete);
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            resolve({
              success: true,
              message: 'Video uploaded successfully! Changes will be live in 2-3 minutes.',
              project: result.project
            });
          } catch (error) {
            reject(new Error('Failed to parse response'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.details || error.error || 'Upload failed'));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'));
      });

      // Send request
      xhr.open('POST', `${BACKEND_URL}/api/upload-video`);
      xhr.send(formData);
    });

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
 * @returns {Promise<Array>}
 */
export async function loadProjectsFromBackend() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/projects`);
    
    if (!response.ok) {
      throw new Error('Failed to load projects from backend');
    }

    const data = await response.json();
    return data.projects || [];
  } catch (error) {
    console.error('Error loading projects from backend:', error);
    throw error;
  }
}

/**
 * Delete a project from backend
 * @param {number} projectId - Project ID to delete
 * @param {string} password - Admin password
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function deleteProjectFromBackend(projectId, password) {
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
  
  if (password !== adminPassword) {
    return {
      success: false,
      message: 'Invalid admin password'
    };
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/projects/${projectId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete project');
    }

    const result = await response.json();
    return {
      success: true,
      message: result.message || 'Project deleted successfully'
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
 * Check if backend is healthy and available
 * @returns {Promise<boolean>}
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
}
