// API Configuration
// This file centralizes the API base URL for the entire admin application
// URLs are loaded from environment variables (.env.development or .env.production)

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://zenyourlife.be/api';

// Server base URL (without /api) for serving static files like images
export const SERVER_BASE_URL = import.meta.env.VITE_SERVER_URL || 'https://zenyourlife.be';

// Helper function to get full image URL from backend paths
// Includes cache-busting to prevent browsers from showing stale cached images
export const getImageUrl = (imagePath: string | undefined, cacheBust?: string | number): string | null => {
  if (!imagePath) return null;

  let url: string;

  // Replace localhost URLs with production server
  if (imagePath.includes('localhost:5000')) {
    url = imagePath.replace('http://localhost:5000', SERVER_BASE_URL);
  } else if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    // If already a full URL (not localhost), use as-is
    url = imagePath;
  } else if (imagePath.startsWith('/')) {
    // If relative path, prepend server base URL
    url = `${SERVER_BASE_URL}${imagePath}`;
  } else {
    // For paths without leading slash
    url = `${SERVER_BASE_URL}/${imagePath}`;
  }

  // Add cache-busting query param for uploaded images
  if (url.includes('/uploads/')) {
    const v = cacheBust || Date.now();
    url += `?v=${v}`;
  }

  return url;
};
