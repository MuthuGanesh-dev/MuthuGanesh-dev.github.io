// Git LFS video storage - uploads videos to public/videos folder via GitHub API

const GITHUB_OWNER = "MuthuGanesh-dev";
const GITHUB_REPO = "MuthuGanesh-dev.github.io";
const GITHUB_BRANCH = "main";
const VIDEOS_FOLDER = "my-app/public/videos";

/**
 * Upload video file to GitHub repository (will be tracked by LFS)
 * @param {File} videoFile - The video file to upload
 * @param {string} projectTitle - Project title for filename generation
 * @returns {Promise<{success: boolean, videoUrl?: string, message: string}>}
 */
export async function uploadVideoToLFS(videoFile, projectTitle) {
  const token = import.meta.env.VITE_GITHUB_TOKEN;

  if (!token) {
    return {
      success: false,
      message:
        "GitHub token missing. Please add VITE_GITHUB_TOKEN to .env file",
    };
  }

  try {
    // Generate filename from project title
    const sanitizedTitle = projectTitle
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 50);
    const timestamp = Date.now();
    const extension = videoFile.name.split(".").pop();
    const filename = `${sanitizedTitle}-${timestamp}.${extension}`;
    const filePath = `${VIDEOS_FOLDER}/${filename}`;

    // Read file as base64
    const base64Content = await fileToBase64(videoFile);

    // Upload to GitHub
    const uploadUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;

    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Add video: ${filename}`,
        content: base64Content,
        branch: GITHUB_BRANCH,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to upload video");
    }

    await response.json(); // Consume response

    // Generate public URL for the video
    const videoUrl = `/videos/${filename}`;

    return {
      success: true,
      videoUrl: videoUrl,
      message: `Video uploaded successfully: ${filename}`,
    };
  } catch (error) {
    console.error("LFS video upload error:", error);
    return {
      success: false,
      message: `Upload failed: ${error.message}`,
    };
  }
}

/**
 * Convert File to base64 string
 * @param {File} file - File to convert
 * @returns {Promise<string>}
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Remove the data URL prefix (e.g., "data:video/mp4;base64,")
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Delete video file from GitHub repository
 * @param {string} videoUrl - The video URL (e.g., "/videos/project-123.mp4")
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function deleteVideoFromLFS(videoUrl) {
  const token = import.meta.env.VITE_GITHUB_TOKEN;

  if (!token || !videoUrl || !videoUrl.startsWith("/videos/")) {
    return { success: false, message: "Invalid video URL" };
  }

  try {
    const filename = videoUrl.replace("/videos/", "");
    const filePath = `${VIDEOS_FOLDER}/${filename}`;
    const fileUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;

    // Get file SHA
    const getResponse = await fetch(fileUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!getResponse.ok) {
      return { success: false, message: "Video file not found" };
    }

    const fileData = await getResponse.json();

    // Delete file
    const deleteResponse = await fetch(fileUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Delete video: ${filename}`,
        sha: fileData.sha,
        branch: GITHUB_BRANCH,
      }),
    });

    if (!deleteResponse.ok) {
      throw new Error("Failed to delete video");
    }

    return {
      success: true,
      message: "Video deleted successfully",
    };
  } catch (error) {
    console.error("Video deletion error:", error);
    return {
      success: false,
      message: `Deletion failed: ${error.message}`,
    };
  }
}
