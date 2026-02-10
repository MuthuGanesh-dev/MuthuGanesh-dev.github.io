// Backend API storage - handles video uploads with Git LFS

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

/**
 * Upload video and project data to backend
 * @param {Object} projectData - Project metadata
 * @param {File} videoFile - Video file to upload
 * @param {File} pdfFile - PDF file to upload (optional)
 * @param {string} password - Admin password for authentication
 * @param {Function} onProgress - Optional callback for upload progress (0-100)
 * @returns {Promise<{success: boolean, message: string, project?: Object}>}
 */
export async function uploadProjectWithVideo(projectData, videoFile, pdfFile, password, onProgress) {
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
    if (pdfFile) {
      formData.append('pdf', pdfFile);
    }
    formData.append('title', projectData.title || 'New Project');
    formData.append('description', projectData.description || '');
    formData.append('thumbnail', projectData.thumbnail || '');
    formData.append('tags', projectData.tags ? projectData.tags.join(',') : '');
    formData.append('link', projectData.link || '');
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
 * Update/Edit existing project in backend
 * @param {number} projectId - Project ID to update
 * @param {Object} projectData - Updated project metadata
 * @param {File} videoFile - New video file to upload (optional)
 * @param {File} pdfFile - New PDF file to upload (optional)
 * @param {string} password - Admin password for authentication
 * @param {Function} onProgress - Optional callback for upload progress (0-100)
 * @returns {Promise<{success: boolean, message: string, project?: Object}>}
 */
export async function updateProjectInBackend(projectId, projectData, videoFile, pdfFile, password, onProgress) {
  // Validate admin password
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
  
  if (password !== adminPassword) {
    return {
      success: false,
      message: 'Invalid admin password'
    };
  }

  try {
    console.log(`📡 Backend URL: ${BACKEND_URL}`);
    console.log(`🔄 Updating project ID: ${projectId}`);

    // Create form data
    const formData = new FormData();
    if (videoFile) {
      formData.append('video', videoFile);
      console.log('📹 Video file attached:', videoFile.name);
    }
    if (pdfFile) {
      formData.append('pdf', pdfFile);
      console.log('📄 PDF file attached:', pdfFile.name);
    }
    formData.append('title', projectData.title || '');
    formData.append('description', projectData.description || '');
    formData.append('thumbnail', projectData.thumbnail || '');
    formData.append('tags', projectData.tags ? projectData.tags.join(',') : '');
    formData.append('link', projectData.link || '');
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
              message: 'Project updated successfully!',
              project: result.project
            });
          } catch (error) {
            reject(new Error('Failed to parse response'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.details || error.error || 'Update failed'));
          } catch {
            reject(new Error(`Update failed with status ${xhr.status}`));
          }
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during update. Make sure your backend is running at ' + BACKEND_URL));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Update aborted'));
      });

      // Send request
      xhr.open('PUT', `${BACKEND_URL}/api/projects/${projectId}`);
      xhr.send(formData);
    });

  } catch (error) {
    console.error('Update error:', error);
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
