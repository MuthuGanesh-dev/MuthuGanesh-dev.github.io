/**
 * Asset Helper - Resolves correct URLs for videos and PDFs
 * In development: Uses production GitHub Pages URL
 * In production: Uses relative paths
 */

// Production URL where assets are stored
const PRODUCTION_BASE_URL = 'https://muthuganesh-dev.github.io';

// Detect if we're in development mode
const isDevelopment = import.meta.env.DEV;

/**
 * Get the full URL for a video file
 * @param {string} videoPath - Path like "/videos/filename.mp4"
 * @returns {string} Full URL to the video
 */
export function getVideoUrl(videoPath) {
  if (!videoPath) return '';
  
  // If it's already a full URL (YouTube), return as is
  if (videoPath.startsWith('http://') || videoPath.startsWith('https://')) {
    return videoPath;
  }
  
  // In development, use production URL
  if (isDevelopment) {
    return `${PRODUCTION_BASE_URL}${videoPath}`;
  }
  
  // In production, use relative path
  return videoPath;
}

/**
 * Get the full URL for a PDF file
 * @param {string} pdfPath - Path like "/docs/filename.pdf"
 * @returns {string} Full URL to the PDF
 */
export function getPdfUrl(pdfPath) {
  if (!pdfPath) return '';
  
  // If it's already a full URL, return as is
  if (pdfPath.startsWith('http://') || pdfPath.startsWith('https://')) {
    return pdfPath;
  }
  
  // In development, use production URL
  if (isDevelopment) {
    return `${PRODUCTION_BASE_URL}${pdfPath}`;
  }
  
  // In production, use relative path
  return pdfPath;
}

/**
 * Get environment info
 * @returns {object} Environment information
 */
export function getEnvironmentInfo() {
  return {
    isDevelopment,
    baseUrl: isDevelopment ? PRODUCTION_BASE_URL : window.location.origin,
    mode: import.meta.env.MODE,
  };
}
