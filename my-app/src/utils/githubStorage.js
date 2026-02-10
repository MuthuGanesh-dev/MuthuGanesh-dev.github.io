// GitHub storage for projects.json file

const GITHUB_OWNER = "MuthuGanesh-dev";
const GITHUB_REPO = "MuthuGanesh-dev.github.io";
const GITHUB_BRANCH = "main";
const PROJECTS_FILE_PATH = "my-app/public/projects.json";

/**
 * Save projects to GitHub repository
 * @param {Array} projects - Array of project objects
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function saveProjectsToGitHub(projects) {
  const token = import.meta.env.VITE_GITHUB_TOKEN;

  if (!token) {
    return {
      success: false,
      message: "GitHub token missing. Please add VITE_GITHUB_TOKEN to .env file",
    };
  }

  try {
    // First, get the current file to get its SHA
    const getUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${PROJECTS_FILE_PATH}`;
    
    const getResponse = await fetch(getUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    let sha = null;
    if (getResponse.ok) {
      const fileData = await getResponse.json();
      sha = fileData.sha;
    }

    // Convert projects to JSON and base64
    const content = JSON.stringify(projects, null, 2);
    const base64Content = btoa(unescape(encodeURIComponent(content)));

    // Update or create the file
    const updateUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${PROJECTS_FILE_PATH}`;
    
    const updateResponse = await fetch(updateUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Update projects: ${new Date().toISOString()}`,
        content: base64Content,
        branch: GITHUB_BRANCH,
        ...(sha && { sha }),
      }),
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      throw new Error(errorData.message || "Failed to save projects");
    }

    return {
      success: true,
      message: "Projects saved successfully to GitHub",
    };
  } catch (error) {
    console.error("GitHub save error:", error);
    return {
      success: false,
      message: `Save failed: ${error.message}`,
    };
  }
}

/**
 * Load projects from GitHub repository
 * @returns {Promise<Array>}
 */
export async function loadProjectsFromGitHub() {
  try {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${PROJECTS_FILE_PATH}`;
    
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to load projects from GitHub");
    }

    const fileData = await response.json();
    const content = atob(fileData.content);
    const projects = JSON.parse(content);

    return projects;
  } catch (error) {
    console.error("GitHub load error:", error);
    return [];
  }
}
