// API Service for Student Account System
const API_BASE_URL = import.meta.env.VITE_API_URL;

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get authentication token from localStorage
  getAuthToken() {
    return localStorage.getItem('token');
  }

  // Set authentication token
  setAuthToken(token) {
    localStorage.setItem('token', token);
  }

  // Remove authentication token
  removeAuthToken() {
    localStorage.removeItem('token');
  }

  // Make authenticated request
  async makeRequest(endpoint, options = {}) {
    const token = this.getAuthToken();
    const config = {
      headers: {
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

      // Safely parse JSON — some responses may have empty body
      let data = null;
      const contentType = response.headers.get('content-type');
      const text = await response.text();
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          // Response body is not JSON (e.g. empty 204, plain text error)
          if (!response.ok) {
            throw new Error(`Server error (${response.status}): ${text || 'No response body'}`);
          }
          return text;
        }
      }

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          this.removeAuthToken();
        }
        const validationMessage = data && typeof data === 'object'
          ? Object.values(data).find(Array.isArray)?.[0]
          : null;
        const error = new Error(
          validationMessage ||
          (data && (data.message || data.error)) ||
          `Request failed with status ${response.status}`
        );
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      // If error has response data with validation errors, extract them
      if (error.data && typeof error.data === 'object') {
        const validationErrors = Object.entries(error.data)
          .filter(([key, value]) => Array.isArray(value))
          .map(([key, messages]) => messages.join(', '))
          .join('; ');
        
        if (validationErrors) {
          error.message = validationErrors;
        }
      }
      throw error;
    }
  }

  // Authentication methods
  async login(email, password) {
    const response = await this.makeRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.token) {
      this.setAuthToken(response.token);
    }

    return response;
  }

  async register(userData) {
    const response = await this.makeRequest('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.token) {
      this.setAuthToken(response.token);
    }

    return response;
  }

  async checkEmail(email) {
    return this.makeRequest('/check-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async checkStudentNumber(studentNumber) {
    return this.makeRequest('/check-student-number', {
      method: 'POST',
      body: JSON.stringify({ student_number: studentNumber }),
    });
  }

  async exchangeSsoToken(token) {
    return this.makeRequest('/sso/exchange', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  logout() {
    this.removeAuthToken();
  }

  // Student profile methods
  async getProfile() {
    return this.makeRequest('/me');
  }

  async getDocuments() {
    return this.makeRequest('/verifications');
  }

  async uploadDocument(formData) {
    const token = this.getAuthToken();
    const config = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    };

    try {
      const response = await fetch(`${this.baseURL}/verifications`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      return data;
    } catch (error) {
      console.error('Upload Error:', error);
      throw error;
    }
  }

  async getOrders() {
    return this.makeRequest('/orders');
  }

  async getStats() {
    return this.makeRequest('/student/stats');
  }

  async getNotifications() {
    return this.makeRequest('/notifications');
  }

  async markNotificationRead(notificationId) {
    return this.makeRequest('/notifications/read', {
      method: 'POST',
      body: JSON.stringify({ notification_id: notificationId }),
    });
  }

  // Profile management methods
  async updateProfile(profileData) {
    return this.makeRequest('/me/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(passwordData) {
    return this.makeRequest('/me/change-password', {
      method: 'POST', 
      body: JSON.stringify(passwordData),
    });
  }

  async getLoginActivity() {
    return this.makeRequest('/student/login-activity');
  }

  // Student verification documents
  async getStudentDocuments() {
    return this.makeRequest('/verifications');
  }

  async getStickerRequests() {
    return this.makeRequest('/me/sticker-requests');
  }

  async createStickerRequest(formData) {
    const response = await fetch(`${this.baseURL}/me/sticker-requests`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.getAuthToken()}` },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || Object.values(data).flat().join(', ') || 'Sticker request failed');
    }

    return data;
  }

  async viewStickerRequestDocument(requestId, document) {
    const response = await fetch(`${this.baseURL}/me/sticker-requests/${requestId}/documents/${document}`, {
      headers: { Authorization: `Bearer ${this.getAuthToken()}` },
    });
    if (!response.ok) throw new Error('Unable to open this document.');
    const url = URL.createObjectURL(await response.blob());
    window.open(url, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  async uploadAvatar(file) {
    const token = this.getAuthToken();
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const response = await fetch(`${this.baseURL}/me/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      if (!response.ok) throw new Error(data.error || 'Avatar upload failed');
      return data;
    } catch (error) {
      console.error('Avatar upload error:', error);
      throw error;
    }
  }

  async uploadVerificationDocument(formData) {
    const token = this.getAuthToken();

    // Rebuild FormData with correct field name ('document' — what multer expects)
    const correctedForm = new FormData();
    correctedForm.append('document_type', formData.get('document_type'));
    correctedForm.append('file', formData.get('file'));

    try {
      const response = await fetch(`${this.baseURL}/verifications`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: correctedForm,
      });

      const text = await response.text();
      let data = null;
      try { data = JSON.parse(text); } catch { data = { error: text }; }

      if (!response.ok) {
        throw new Error(data?.error || 'Upload failed');
      }
      return data;
    } catch (error) {
      console.error('Upload Error:', error);
      throw error;
    }
  }

  // Products API methods
  async getProducts(params = {}) {
    const searchParams = new URLSearchParams(params).toString();
    const endpoint = searchParams ? `/products?${searchParams}` : '/products';
    return this.makeRequest(endpoint);
  }

  async getProductCategories() {
    return this.makeRequest('/products/categories');
  }

  async getProduct(id) {
    return this.makeRequest(`/products/${id}`);
  }

  // Orders API methods
  async createOrder(orderData) {
    // If orderData already has items array (bulk cart order), use it directly
    if (orderData.items && Array.isArray(orderData.items)) {
      return this.makeRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
    }
    
    // Otherwise, convert single product order to items array format
    const apiOrderData = {
      items: [{
        product_id: orderData.product_id,
        quantity: orderData.quantity,
        special_instructions: orderData.special_instructions || null,
      }],
      notes: orderData.notes || null,
      payment_method: orderData.payment_method || null,
    };

    return this.makeRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(apiOrderData),
    });
  }

  async getUserOrders() {
    return this.makeRequest('/orders');
  }

  async getOrderById(orderId) {
    return this.makeRequest(`/orders/${orderId}`);
  }

  async updateOrder(orderId, updateData) {
    return this.makeRequest(`/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async cancelOrder(orderId, reason) {
    return this.makeRequest(`/orders/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Legacy orders endpoint (for backward compatibility)
  async getOrders() {
    return this.makeRequest('/orders');
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'ERROR', message: 'API server unavailable' };
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getAuthToken();
  }
}

export default new ApiService();
