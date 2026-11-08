// API Service for Print Order Module
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Helper function to get auth headers
function getAuthHeaders() {
  const headers = {
    'Accept': 'application/json',
  };
  
  const authToken = localStorage.getItem('auth_token');
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return headers;
}

// Helper function to handle API responses
async function handleResponse(response) {
  if (response.status === 401) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    window.location.href = '/login';
    throw new Error('Session expired. Please login again.');
  }
  
  if (response.status === 204) {
    return null;
  }
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  
  return data;
}

class PrintOrderAPI {
  // Authentication
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  async logout() {
    try {
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const response = await fetch(`${API_BASE_URL}/user`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  // Get all pricing configurations (public)
  async getPricing() {
    try {
      const response = await fetch(`${API_BASE_URL}/print-orders/pricing`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching pricing:', error);
      throw error;
    }
  }

  // Calculate order cost (public)
  async calculateCost(orderOptions) {
    try {
      const response = await fetch(`${API_BASE_URL}/print-orders/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderOptions),
      });
      return await response.json();
    } catch (error) {
      console.error('Error calculating cost:', error);
      throw error;
    }
  }

  // Create new print order (public - no auth required)
  async createOrder(formData) {
    try {
      const response = await fetch(`${API_BASE_URL}/print-orders`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          // No Authorization header needed - student info is in form data
        },
        body: formData, // FormData with files
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create order');
      }
      
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Get all orders (with filters) (authenticated)
  async getOrders(filters = {}) {
    try {
      // Remove empty filter values
      const cleanFilters = {};
      Object.keys(filters).forEach(key => {
        if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
          cleanFilters[key] = filters[key];
        }
      });
      
      const queryParams = new URLSearchParams(cleanFilters).toString();
      const url = queryParams 
        ? `${API_BASE_URL}/print-orders?${queryParams}`
        : `${API_BASE_URL}/print-orders`;
      
      console.log('Fetching URL:', url);
      const response = await fetch(url);
      const data = await response.json();
      console.log('Raw API response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  // Get single order details
  async getOrder(orderId) {
    try {
      const response = await fetch(`${API_BASE_URL}/print-orders/${orderId}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  // Update order status (Staff)
  async updateStatus(orderId, status, notes = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/print-orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  }

  // Cancel order
  async cancelOrder(orderId, reason) {
    try {
      const response = await fetch(`${API_BASE_URL}/print-orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cancellation_reason: reason }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }

  // Record payment (Staff)
  async recordPayment(orderId, paymentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/print-orders/${orderId}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });
      return await response.json();
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  }

  // Mark ready for pickup (Staff)
  async markReady(orderId) {
    try {
      const response = await fetch(`${API_BASE_URL}/print-orders/${orderId}/ready`, {
        method: 'POST',
      });
      return await response.json();
    } catch (error) {
      console.error('Error marking ready:', error);
      throw error;
    }
  }

  // Mark completed (Staff)
  async markCompleted(orderId) {
    try {
      const response = await fetch(`${API_BASE_URL}/print-orders/${orderId}/complete`, {
        method: 'POST',
      });
      return await response.json();
    } catch (error) {
      console.error('Error marking completed:', error);
      throw error;
    }
  }

  // Get download URL for file
  getDownloadUrl(orderId, fileId) {
    return `${API_BASE_URL}/print-orders/${orderId}/files/${fileId}/download`;
  }
}

export default new PrintOrderAPI();
