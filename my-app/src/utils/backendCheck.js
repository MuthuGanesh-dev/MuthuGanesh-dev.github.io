/**
 * Backend connectivity checker
 * Helps diagnose issues with backend connection
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

/**
 * Check if backend is accessible
 * @returns {Promise<{connected: boolean, url: string, message: string}>}
 */
export async function checkBackendConnection() {
  console.log('🔍 Checking backend connection...');
  console.log('Backend URL:', BACKEND_URL);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend is connected:', data);
      return {
        connected: true,
        url: BACKEND_URL,
        message: 'Backend is running and accessible',
        data
      };
    } else {
      console.warn('⚠️ Backend returned error:', response.status);
      return {
        connected: false,
        url: BACKEND_URL,
        message: `Backend returned status ${response.status}`
      };
    }
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    
    let message = 'Cannot connect to backend';
    if (error.name === 'AbortError') {
      message = 'Backend connection timeout (5s)';
    } else if (error.message.includes('Failed to fetch')) {
      message = 'Backend is not reachable. Is it running?';
    }

    return {
      connected: false,
      url: BACKEND_URL,
      message: message + '. Check: ' + BACKEND_URL,
      error: error.message
    };
  }
}

/**
 * Test backend edit endpoint
 * @returns {Promise<{available: boolean, message: string}>}
 */
export async function testEditEndpoint() {
  console.log('🧪 Testing edit endpoint...');
  
  try {
    // Try OPTIONS request to check if PUT is allowed
    const response = await fetch(`${BACKEND_URL}/api/projects/test`, {
      method: 'OPTIONS',
    });

    console.log('Edit endpoint test result:', response.status);
    
    return {
      available: response.status < 500,
      message: response.status < 500 ? 'Edit endpoint is available' : 'Edit endpoint error'
    };
  } catch (error) {
    console.error('Edit endpoint test failed:', error);
    return {
      available: false,
      message: 'Cannot reach edit endpoint: ' + error.message
    };
  }
}
