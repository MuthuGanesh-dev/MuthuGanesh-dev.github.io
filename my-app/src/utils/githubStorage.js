// GitHub API storage - uses your repo as a database

const GITHUB_OWNER = "MuthuGanesh-dev";
const GITHUB_REPO = "MuthuGanesh-dev.github.io";
const GITHUB_FILE_PATH = "my-app/public/projects.json";
const GITHUB_BRANCH = "main";

/**
 * Save projects to GitHub repository via GitHub API
 * @param {Array} projects - Array of project objects
 * @param {string} password - Admin password for authentication
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function saveProjectsToGitHub(projects, password) {
  // You'll need a GitHub Personal Access Token (PAT)
  // Store it in .env as VITE_GITHUB_TOKEN
  const token = import.meta.env.VITE_GITHUB_TOKEN;

  if (!token) {
    console.error("GitHub token not configured");
    return {
      success: false,
      message:
        "GitHub token missing. Please add VITE_GITHUB_TOKEN to .env file",
    };
  }

  try {
    // 1. Get current file SHA (required for updating)
    const fileUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`;
    const fileResponse = await fetch(fileUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!fileResponse.ok) {
      throw new Error("Failed to fetch current file");
    }

    const fileData = await fileResponse.json();
    const currentSha = fileData.sha;

    // 2. Prepare new content
    const content = JSON.stringify({ projects }, null, 2);
    const encodedContent = btoa(unescape(encodeURIComponent(content)));

    // 3. Commit the change
    const updateResponse = await fetch(fileUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Update projects - ${new Date().toISOString()}`,
        content: encodedContent,
        sha: currentSha,
        branch: GITHUB_BRANCH,
      }),
    });

    if (!updateResponse.ok) {
      const error = await updateResponse.json();
      throw new Error(error.message || "Failed to update file");
    }

    return {
      success: true,
      message: "Projects saved to GitHub! Changes will be live in 2-3 minutes.",
    };
  } catch (error) {
    console.error("GitHub save error:", error);
    return {
      success: false,
      message: `Error: ${error.message}`,
    };
  }
}

/**
 * Load projects from GitHub repository
 * @returns {Promise<Array>} Array of projects
 */
export async function loadProjectsFromGitHub() {
  try {
    const response = await fetch(
      `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${GITHUB_FILE_PATH}`
    );

    if (!response.ok) {
      throw new Error("Failed to load projects");
    }

    const data = await response.json();
    return data.projects || [];
  } catch (error) {
    console.error("Error loading projects from GitHub:", error);
    return [];
  }
}
