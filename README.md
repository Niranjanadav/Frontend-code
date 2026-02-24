# Japa Counter - Frontend

A modern, responsive web application for tracking your Japa counter practice. Built with HTML5, CSS3, JavaScript, and Bootstrap 5.

## 📋 Features

- **User Authentication**: Secure login and registration system
- **Japa Counter**: Easy-to-use bead counter with real-time updates
- **Daily Progress Tracking**: Monitor today's beads and rounds
- **Lifetime Statistics**: Track your long-term achievements
- **History View**: View your Japa practice history with date filtering
- **User Profile**: View and manage your account information
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Token Management**: Automatic JWT token handling with refresh capability

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Backend server running on `http://localhost:8080`

### Installation

1. **Extract the frontend files** to your desired location
2. **Open in a web server** (required for CORS and proper functionality)

#### Option 1: Using Python (Simple HTTP Server)
```bash
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser

#### Option 2: Using Node.js (http-server)
```bash
npx http-server
```
Then open `http://localhost:8080` in your browser

#### Option 3: Using VS Code Live Server Extension
- Install "Live Server" extension in VS Code
- Right-click on `index.html` and select "Open with Live Server"

### File Structure
```
Frontend/
├── index.html           # Login page
├── register.html        # Registration page
├── dashboard.html       # Main counter dashboard
├── profile.html         # User profile page
├── history.html         # History view page
├── config.js            # API configuration (base URL)
├── api.js               # API service layer
├── app.js               # Main application logic
└── styles.css           # Custom styles and Bootstrap customization
```

## 🔧 Configuration

### Changing the API Base URL

The API base URL is configured in `config.js`. To change it for different environments:

**config.js**
```javascript
const API_CONFIG = {
    baseURL: 'http://localhost:8080',  // Change this for different servers
    apiVersion: '/api'
};
```

Examples:
- **Local Development**: `http://localhost:8080`
- **Production**: `https://api.example.com`
- **Staging**: `https://staging-api.example.com`

## 📱 Pages Overview

### 1. Login Page (index.html)
- User authentication
- Link to registration page
- Error handling for invalid credentials

### 2. Registration Page (register.html)
- New user account creation
- Username, email, and password validation
- Password confirmation check
- Redirect to login after successful registration

### 3. Dashboard (dashboard.html)
- **Today's Progress**: Shows beads and rounds for today
- **Bead Counter**: Main button to increment bead count
- **Lifetime Progress**: Shows total beads and rounds achieved
- **Progress Bars**: Visual representation of progress towards goals

### 4. Profile Page (profile.html)
- View user information (ID, username, email)
- User account management

### 5. History Page (history.html)
- View Japa practice history with date filtering
- Customizable date range selection
- Table view of historical data
- Default view shows last 7 days

## 🔐 Authentication & Security

- **JWT Tokens**: Secure token-based authentication
- **Token Storage**: Tokens stored in browser's localStorage
- **Automatic Refresh**: Tokens automatically refreshed when expired
- **Logout**: Clear tokens and redirect to login page
- **Protected Routes**: Pages require authentication to access

## 📊 API Integration

The frontend integrates with the following API endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/user/register` - User registration
- `POST /api/auth/refresh` - Refresh access token

### User
- `GET /api/user/getById/{id}` - Get user profile

### Japa Counter
- `POST /api/japa/increment/{id}` - Increment bead count
- `GET /api/japa/today/{id}` - Get today's progress
- `GET /api/japa/lifetime/{id}` - Get lifetime progress
- `GET /api/japa/histroy/{id}?start=date&end=date` - Get history with date range

## 🎨 Styling

### Color Scheme
- **Primary Color**: #8B5A8F (Purple)
- **Accent Color**: #F39C12 (Gold)
- **Success Color**: #27AE60 (Green)
- **Danger Color**: #E74C3C (Red)

### Responsive Breakpoints
- **Desktop**: 1200px and above
- **Tablet**: 768px - 1199px
- **Mobile**: Below 768px

## 🛠️ Development

### Key Functions in app.js

**Login/Register**
- `handleLogin()`: Process user login
- `handleRegister()`: Process user registration

**Dashboard**
- `loadDashboardData()`: Fetch daily and lifetime progress
- `incrementBeads()`: Add beads to the counter

**Profile**
- `loadUserProfile()`: Fetch user information

**History**
- `loadHistory()`: Fetch practice history with date range filtering

**Utilities**
- `showAlert()`: Display temporary notifications
- `handleLogout()`: Clear session and redirect to login

## 🐛 Troubleshooting

### CORS Errors
Ensure your backend is running and CORS is properly configured. The frontend expects the backend on `http://localhost:8080`.

### Token Expired Errors
The app automatically refreshes tokens. If you still get unauthorized errors:
1. Login again
2. Check if refresh token is valid
3. Verify backend is running

### Cannot Access Protected Pages
Make sure you're logged in. Authentication is verified on page load.

### Data Not Loading
- Verify backend is running
- Check API endpoints are correct
- Look for errors in browser console (F12)
- Ensure date format in history page is YYYY-MM-DD

## 🔄 Token Refresh Flow

1. User logs in → JWT and Refresh tokens stored
2. Request made with JWT token
3. If token expired → Auto refresh using refresh token
4. New tokens stored in localStorage
5. Request retried with new token
6. If refresh fails → User redirected to login

## 📝 Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Support

For issues or questions:
1. Check browser console for errors (F12)
2. Verify backend is running
3. Ensure API base URL is correct in config.js
4. Check localStorage for tokens (F12 → Application → localStorage)

## 📄 License

This project is provided as-is for use with the Japa Counter backend application.
