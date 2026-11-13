/**
 * Insigrow Industry Portal - API Client
 * Enterprise HTTP handler with session token persistence & trial management
 */

const API_BASE = '/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('insigrow_auth_token') || null;
  }

  setToken(token, remember = true) {
    this.token = token;
    if (token) {
      if (remember) {
        localStorage.setItem('insigrow_auth_token', token);
      } else {
        sessionStorage.setItem('insigrow_auth_token', token);
      }
    } else {
      localStorage.removeItem('insigrow_auth_token');
      sessionStorage.removeItem('insigrow_auth_token');
    }
  }

  getToken() {
    return this.token || localStorage.getItem('insigrow_auth_token') || sessionStorage.getItem('insigrow_auth_token');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include' // sends cookies as well
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401 && !endpoint.includes('/login') && !endpoint.includes('/register')) {
          // Token expired or invalid
          this.setToken(null);
          window.dispatchEvent(new CustomEvent('auth:expired'));
        }
        const error = new Error(data.message || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err);
      throw err;
    }
  }

  // Authentication Endpoints
  async register(payload) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async login(payload) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (res.token) {
      this.setToken(res.token, payload.rememberMe !== false);
    }
    return res;
  }

  async me() {
    return this.request('/auth/me', { method: 'GET' });
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (_) {}
    this.setToken(null);
  }

  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  // Trial Endpoints
  async getTrials() {
    return this.request('/trials', { method: 'GET' });
  }

  async activateTrial(industry) {
    return this.request('/trials/activate', {
      method: 'POST',
      body: JSON.stringify({ industry })
    });
  }

  // Industry Endpoints
  async getIndustryData(industry) {
    return this.request(`/industry/${industry}`, { method: 'GET' });
  }
}

window.api = new ApiClient();

