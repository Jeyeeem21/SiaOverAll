// API Service for Staff Sticker Module
// Connects to Student Account Module backend

// The staff sticker workflow is served by the Student Account API. Docker
// provides VITE_API_URL; this fallback keeps standalone Vite development on
// the same API instead of accidentally targeting the print service.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8004/api';

class StickerAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage (from main system login)
  getAuthToken() {
    return localStorage.getItem('token');
  }

  // Make authenticated request
  async makeRequest(endpoint, options = {}) {
    const token = this.getAuthToken();
    
    const config = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      const text = await response.text();
      let data = null;
      
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          if (!response.ok) {
            throw new Error(`Server error (${response.status}): ${text}`);
          }
          return text;
        }
      }

      if (!response.ok) {
        const errorMessage = data?.message || `Request failed with status ${response.status}`;
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Get all sticker requests (staff view)
  async getAllRequests(status = 'all') {
    const endpoint = status !== 'all' 
      ? `/staff/sticker-requests?status=${status}` 
      : '/staff/sticker-requests';
    return this.makeRequest(endpoint);
  }

  // Get single request with details
  async getRequest(requestId) {
    return this.makeRequest(`/staff/sticker-requests/${requestId}`);
  }

  // View document
  async viewDocument(requestId, documentType) {
    const token = this.getAuthToken();
    const response = await fetch(
      `${this.baseURL}/staff/sticker-requests/${requestId}/documents/${documentType}`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Unable to view document');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    
    // Clean up after 1 minute
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  // Approve request
  async approveRequest(requestId, remarks = '') {
    return this.makeRequest(`/staff/sticker-requests/${requestId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ remarks }),
    });
  }

  // Decline request
  async declineRequest(requestId, reason) {
    return this.makeRequest(`/staff/sticker-requests/${requestId}/decline`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Generate sticker
  async generateSticker(requestId, stickerData) {
    return this.makeRequest(`/staff/sticker-requests/${requestId}/generate`, {
      method: 'POST',
      body: JSON.stringify(stickerData),
    });
  }

  // Mark a generated sticker as completed only after staff confirms printing.
  async markPrinted(requestId) {
    return this.makeRequest(`/staff/sticker-requests/${requestId}/mark-printed`, {
      method: 'POST',
    });
  }

  // Get all generated stickers
  async getAllStickers() {
    return this.makeRequest('/staff/stickers');
  }

  // Check if authenticated
  isAuthenticated() {
    return !!this.getAuthToken();
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return await response.json();
    } catch (error) {
      return { status: 'ERROR', message: 'API unavailable' };
    }
  }
}

export default new StickerAPI();
