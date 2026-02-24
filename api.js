// API Service Layer
// Handles all API calls with token management

class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.token = localStorage.getItem('jwtToken');
        this.refreshToken = localStorage.getItem('refreshToken');
    }

    // Set tokens (called after login)
    setTokens(jwtToken, refreshToken) {
        this.token = jwtToken;
        this.refreshToken = refreshToken;
        localStorage.setItem('jwtToken', jwtToken);
        localStorage.setItem('refreshToken', refreshToken);
    }

    // Clear tokens (called on logout)
    clearTokens() {
        this.token = null;
        this.refreshToken = null;
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
    }

    // Get headers with authorization
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    // Handle API errors and token refresh
    async handleResponse(response) {
        if (response.status === 401) {
            // Token expired, try to refresh
            if (this.refreshToken) {
                const refreshed = await this.refreshAccessToken();
                if (!refreshed) {
                    this.clearTokens();
                    window.location.href = 'index.html';
                }
            } else {
                this.clearTokens();
                window.location.href = 'index.html';
            }
            throw new Error('Unauthorized - please login again');
        }
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `HTTP error! status: ${response.status}`);
        }
        
        return response.json();
    }

    // Refresh access token
    async refreshAccessToken() {
        try {
            const response = await fetch(`${this.baseURL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: this.refreshToken })
            });

            if (response.ok) {
                const data = await response.json();
                this.setTokens(data.jwtToken, data.refreshToken);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
        }
    }

    // AUTH ENDPOINTS

    // Login
    async login(username, password) {
        const response = await fetch(`${this.baseURL}/auth/login`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ username, password })
        });
        return this.handleResponse(response);
    }

    // Register
    async register(username, email, password) {
        const response = await fetch(`${this.baseURL}/user/register`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ username, email, password })
        });
        return this.handleResponse(response);
    }

    // USER ENDPOINTS

    // Get user by ID
    async getUserById(userId) {
        const response = await fetch(`${this.baseURL}/user/getById/${userId}`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    // JAPA ENDPOINTS

    // Increment beads
    async incrementBeads(userId, beadCount) {
        const response = await fetch(`${this.baseURL}/japa/increment/${userId}`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ beadCount })
        });
        return this.handleResponse(response);
    }

    // Decrement beads
    async decrementBeads(userId, beadCount) {
        const response = await fetch(`${this.baseURL}/japa/decrement/${userId}`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ beadCount })
        });
        return this.handleResponse(response);
    }

    // Reset today's beads
    async resetBeads(userId) {
        const response = await fetch(`${this.baseURL}/japa/reset/${userId}`, {
            method: 'POST',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    // Get today's progress
    async getTodayProgress(userId) {
        const response = await fetch(`${this.baseURL}/japa/today/${userId}`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    // Get lifetime progress
    async getLifetimeProgress(userId) {
        const response = await fetch(`${this.baseURL}/japa/lifetime/${userId}`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }

    // Get history with date range
    async getHistory(userId, startDate, endDate) {
        const response = await fetch(
            `${this.baseURL}/japa/histroy/${userId}?start=${startDate}&end=${endDate}`,
            {
                method: 'GET',
                headers: this.getHeaders()
            }
        );
        return this.handleResponse(response);
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.token;
    }

    // Get stored user info
    getUserInfo() {
        return {
            userId: localStorage.getItem('userId'),
            username: localStorage.getItem('username')
        };
    }

    // Store user info after login
    setUserInfo(userId, username) {
        localStorage.setItem('userId', userId);
        localStorage.setItem('username', username);
    }
}

// Create global instance
const apiService = new ApiService();
