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

  // SHIFTS SSO Launch Token
  async getShiftsLaunchToken(role = 'MANAGER', targetRoute = null) {
    return this.request('/industry/shifts/launch-token', {
      method: 'POST',
      body: JSON.stringify({ role, targetRoute })
    });
  }

  // SHIFTS Team Invitations & Onboarding
  async createInvitations(employees) {
    return this.request('/shifts/invitations', {
      method: 'POST',
      body: JSON.stringify({ employees })
    });
  }

  async getInvitations() {
    return this.request('/shifts/invitations', { method: 'GET' });
  }

  async verifyInvitation(token) {
    return this.request(`/shifts/invitations/verify?token=${encodeURIComponent(token)}`, {
      method: 'GET'
    });
  }

  async acceptInvitation(payload) {
    const res = await this.request('/shifts/invitations/accept', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (res.token) {
      this.setToken(res.token, true);
    }
    return res;
  }

  async completeOnboarding(config) {
    return this.request('/shifts/onboarding/complete', {
      method: 'POST',
      body: JSON.stringify(config)
    });
  }
}

window.api = new ApiClient();

