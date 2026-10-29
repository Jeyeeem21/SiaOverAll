// API Service for Print Order Module
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

class PrintOrderAPI {
  // Get all pricing configurations
  async getPricing() {
    try {
      const response = await fetch(`${API_BASE_URL}/print-orders/pricing`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching pricing:', error);
      throw error;
    }
  }

  // Calculate order cost
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

  // Create new print order
  async createOrder(formData) {
    try {
      const response = await fetch(`${API_BASE_URL}/print-orders`, {
        method: 'POST',
        body: formData, // FormData with files
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Get all orders (with filters)
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
