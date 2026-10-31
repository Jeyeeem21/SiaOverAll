// API Service for Student Account System
const API_BASE_URL = 'http://localhost:3002/api';

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
        throw new Error((data && data.error) || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
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

  logout() {
    this.removeAuthToken();
  }

  // Student profile methods
  async getProfile() {
    return this.makeRequest('/student/profile');
  }

  async getDocuments() {
    return this.makeRequest('/student/documents');
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
      const response = await fetch(`${this.baseURL}/student/upload-document`, config);
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
    return this.makeRequest('/student/orders');
  }

  async getStats() {
    return this.makeRequest('/student/stats');
  }

  async getNotifications() {
    return this.makeRequest('/student/notifications');
  }

  async markNotificationRead(notificationId) {
    return this.makeRequest(`/student/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  // Profile management methods
  async updateProfile(profileData) {
    return this.makeRequest('/student/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(passwordData) {
    return this.makeRequest('/student/change-password', {
      method: 'PUT', 
      body: JSON.stringify(passwordData),
    });
  }

  async getLoginActivity() {
    return this.makeRequest('/student/login-activity');
  }

  // Student verification documents
  async getStudentDocuments() {
    return this.makeRequest('/student/documents');
  }

  async uploadAvatar(file) {
    const token = this.getAuthToken();
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const response = await fetch(`${this.baseURL}/student/avatar`, {
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
    correctedForm.append('document', formData.get('file'));

    try {
      const response = await fetch(`${this.baseURL}/student/upload-document`, {
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
    const apiOrderData = {
      items: [{
        product_id: orderData.product_id,
        quantity: orderData.quantity,
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
    return this.makeRequest('/student/orders');
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