// Print Service API
// Connects to Student Print Module backend (port 8002)
const PRINT_API_BASE_URL = import.meta.env.VITE_PRINT_API_URL;

class PrintService {
  constructor() {
    this.baseURL = PRINT_API_BASE_URL;
  }

  // Get auth token from main student account
  getAuthToken() {
    return localStorage.getItem('token');
  }

  // Make authenticated request to print service
  async makeRequest(endpoint, options = {}) {
    const token = this.getAuthToken();
    const config = {
      headers: {
        ...options.headers,
      },
      ...options,
    };

    // Add token if available
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      // Parse JSON response
      let data = null;
      const text = await response.text();
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          if (!response.ok) {
            throw new Error(`Server error (${response.status}): ${text || 'No response body'}`);
          }
          return text;
        }
      }

      if (!response.ok) {
        const error = new Error(
          (data && (data.message || data.error)) ||
          `Request failed with status ${response.status}`
        );
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Print API Error:', error);
      throw error;
    }
  }

  // Get pricing configuration
  async getPricing() {
    return this.makeRequest('/print-orders/pricing');
  }

  // Calculate print cost
  async calculateCost(options) {
    return this.makeRequest('/print-orders/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });
  }

  // Get all print orders for current student
  async getOrders() {
    return this.makeRequest('/print-orders');
  }

  // Get single print order details
  async getOrder(id) {
    return this.makeRequest(`/print-orders/${id}`);
  }

  // Create new print order
  async createOrder(formData) {
    // formData should be a FormData object with files
    return this.makeRequest('/print-orders', {
      method: 'POST',
      body: formData, // No Content-Type header - let browser set it for FormData
    });
  }

  // Cancel print order
  async cancelOrder(id, reason) {
    return this.makeRequest(`/print-orders/${id}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });
  }

  // Download file from order
  async downloadFile(orderId, fileId) {
    const token = this.getAuthToken();
    try {
      const response = await fetch(`${this.baseURL}/print-orders/${orderId}/files/${fileId}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      // Return blob for download
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Download Error:', error);
      throw error;
    }
  }

  // Check if service is available
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return await response.json();
    } catch (error) {
      console.error('Print service unavailable:', error);
      return { status: 'ERROR', message: 'Print service unavailable' };
    }
  }
}

export default new PrintService();
