// Mock API service for testing without backend
class MockApiService {
  constructor() {
    this.baseURL = 'http://localhost:8000';
    this.delay = 1000; // Simulate network delay
  }

  async mockDelay() {
    return new Promise(resolve => setTimeout(resolve, this.delay));
  }

  async login(credentials) {
    await this.mockDelay();
    
    // Mock successful login
    if (credentials.email && credentials.password) {
      return {
        data: {
          user: {
            id: 1,
            email: credentials.email,
            name: 'Test User',
            role: 'student'
          },
          token: 'mock_token_' + Date.now(),
          message: 'Login successful'
        }
      };
    } else {
      throw new Error('Invalid credentials');
    }
  }

  async register(userData) {
    await this.mockDelay();
    
    return {
      data: {
        user: {
          id: 2,
          email: userData.email,
          name: userData.name,
          role: 'student'
        },
        token: 'mock_token_' + Date.now(),
        message: 'Registration successful'
      }
    };
  }

  async logout() {
    await this.mockDelay();
    return { data: { message: 'Logged out successfully' } };
  }

  async getCurrentUser() {
    await this.mockDelay();
    
    return {
      data: {
        user: {
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
          role: 'student'
        }
      }
    };
  }
}

export default new MockApiService();