// API Configuration
// Change this base URL easily when deploying to different servers
const API_CONFIG = {
    baseURL: 'http://localhost:8080',
    apiVersion: '/api'
};

// Construct full API base URL
const API_BASE_URL = API_CONFIG.baseURL + API_CONFIG.apiVersion;

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_CONFIG, API_BASE_URL };
}
