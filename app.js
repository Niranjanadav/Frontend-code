// Main Application Logic

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function () {
    const currentPage = window.location.pathname.split('/').pop().split('?')[0] || 'index.html';
    
    // Pages that don't require authentication
    const publicPages = ['index.html', 'login.html', 'register.html', ''];
    
    // If trying to access protected page without authentication
    if (!publicPages.includes(currentPage) && !apiService.isAuthenticated()) {
        window.location.href = 'index.html';
    }
    
    // If on login/register page and already authenticated
    if ((currentPage === 'login.html' || currentPage === 'register.html') && apiService.isAuthenticated()) {
        window.location.href = 'dashboard.html';
    }
    
    // Initialize page-specific functionality
    initializePage(currentPage);
});

function initializePage(page) {
    if (page === 'login.html') {
        setupLoginPage();
    } else if (page === 'register.html') {
        setupRegisterPage();
    } else if (page === 'dashboard.html') {
        setupDashboard();
    } else if (page === 'counter.html') {
        setupCounterPage();
    } else if (page === 'profile.html') {
        setupProfilePage();
    } else if (page === 'history.html') {
        setupHistoryPage();
    }
}

// LOGIN PAGE
function setupLoginPage() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');

    try {
        errorDiv.innerHTML = '';
        const response = await apiService.login(username, password);
        
        // Store tokens and user info
        apiService.setTokens(response.jwtToken, response.refreshToken);
        apiService.setUserInfo(response.id, response.username);
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    } catch (error) {
        errorDiv.innerHTML = `<div class="alert alert-danger" role="alert">${error.message}</div>`;
        console.error('Login error:', error);
    }
}

// REGISTER PAGE
function setupRegisterPage() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const errorDiv = document.getElementById('registerError');

    // Validate passwords match
    if (password !== confirmPassword) {
        errorDiv.innerHTML = '<div class="alert alert-danger" role="alert">Passwords do not match</div>';
        return;
    }

    try {
        errorDiv.innerHTML = '';
        await apiService.register(username, email, password);
        
        // Show success message and redirect to login
        const successDiv = document.getElementById('registerSuccess');
        successDiv.innerHTML = '<div class="alert alert-success" role="alert">Registration successful! Redirecting to login...</div>';
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    } catch (error) {
        errorDiv.innerHTML = `<div class="alert alert-danger" role="alert">${error.message}</div>`;
        console.error('Register error:', error);
    }
}

// DASHBOARD PAGE
function setupDashboard() {
    const userInfo = apiService.getUserInfo();
    if (!userInfo.userId) {
        window.location.href = 'index.html';
        return;
    }

    // Update user info in header
    const usernameDisplay = document.getElementById('usernameDisplay');
    if (usernameDisplay) {
        usernameDisplay.textContent = userInfo.username;
    }

    // Load progress data
    loadDashboardData(userInfo.userId);

    // Setup logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// COUNTER PAGE
let incrementDebounceTimer = null;
let decrementDebounceTimer = null;
let pendingIncrement = 0;
let pendingDecrement = 0;
let displayedBeadCount = 0; // Current count from server
let currentUserId = null;

function setupCounterPage() {
    const userInfo = apiService.getUserInfo();
    if (!userInfo.userId) {
        window.location.href = 'index.html';
        return;
    }

    currentUserId = userInfo.userId;

    // Update user info in header
    const usernameDisplay = document.getElementById('usernameDisplay');
    if (usernameDisplay) {
        usernameDisplay.textContent = userInfo.username;
    }

    // Load initial counter display
    loadCounterDisplay(userInfo.userId);

    // Setup increment button with debouncing
    const incrementBtn = document.getElementById('incrementBtn');
    if (incrementBtn) {
        incrementBtn.addEventListener('click', () => handleIncrementWithDebounce(userInfo.userId, 1));
    }

    // Setup decrement button with debouncing
    const decrementBtn = document.getElementById('decrementBtn');
    if (decrementBtn) {
        decrementBtn.addEventListener('click', () => handleDecrementWithDebounce(userInfo.userId, 1));
    }

    // Setup logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Setup reset button
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => resetTodayCount(userInfo.userId));
    }

    // Sync remaining pending increments/decrements on page unload
    window.addEventListener('beforeunload', () => {
        if (pendingIncrement > 0) {
            syncPendingBeads(userInfo.userId);
        }
        if (pendingDecrement > 0) {
            syncPendingDecrements(userInfo.userId);
        }
    });
}

async function loadDashboardData(userId) {
    try {
        const today = await apiService.getTodayProgress(userId);
        const lifetime = await apiService.getLifetimeProgress(userId);

        // Update today's progress - with null checks
        const todayBeadsEl = document.getElementById('todayBeads');
        const todayRoundsEl = document.getElementById('todayRounds');
        const totalBeadsEl = document.getElementById('totalBeads');
        const totalRoundsEl = document.getElementById('totalRounds');
        
        if (todayBeadsEl) todayBeadsEl.textContent = today.todayBeads || 0;
        if (todayRoundsEl) todayRoundsEl.textContent = today.todayRounds || 0;
        if (totalBeadsEl) totalBeadsEl.textContent = lifetime.totalBeads || 0;
        if (totalRoundsEl) totalRoundsEl.textContent = lifetime.totalRounds || 0;

        // Calculate progress percentage (108 beads per round)
        const beadsPerRound = 108;
        const todayProgress = Math.min((today.todayBeads / beadsPerRound) * 100, 100);
        const lifetimeProgress = Math.min((lifetime.totalBeads / (beadsPerRound * 10)) * 100, 100);

        // Update progress bar - with null checks
        const todayProgressBar = document.getElementById('todayProgressBar');
        
        if (todayProgressBar) {
            todayProgressBar.style.width = todayProgress + '%';
            todayProgressBar.textContent = Math.floor(todayProgress) + '%';
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showAlert('Error loading progress data', 'danger');
    }
}

// Handle increment with debouncing (5 second delay)
function handleIncrementWithDebounce(userId, count) {
    pendingIncrement += count;
    
    // Update UI immediately for instant feedback
    updateBeadCountUI();
    
    // Clear existing increment timer
    clearTimeout(incrementDebounceTimer);
    
    // Set new timer - wait 5 seconds after last increment click
    incrementDebounceTimer = setTimeout(() => {
        if (pendingIncrement > 0) {
            syncPendingBeads(userId);
        }
    }, 5000);
}

// Update local UI display
function updateBeadCountUI() {
    const counterDisplay = document.getElementById('counterDisplay');
    if (counterDisplay) {
        counterDisplay.classList.add('pulse');
        // Display current count + pending increments - pending decrements
        const newCount = displayedBeadCount + pendingIncrement - pendingDecrement;
        counterDisplay.textContent = Math.max(0, newCount);
        setTimeout(() => counterDisplay.classList.remove('pulse'), 300);
    }
}

// Handle decrement with debouncing (5 second delay)
function handleDecrementWithDebounce(userId, count) {
    pendingDecrement += count;
    
    // Update UI immediately for instant feedback
    updateBeadCountUI();
    
    // Clear existing decrement timer
    clearTimeout(decrementDebounceTimer);
    
    // Set new timer - wait 5 seconds after last decrement click
    decrementDebounceTimer = setTimeout(() => {
        if (pendingDecrement > 0) {
            syncPendingDecrements(userId);
        }
    }, 5000);
}

// Sync pending decrements with backend
async function syncPendingDecrements(userId) {
    if (pendingDecrement === 0) return;
    
    const beadsToSync = pendingDecrement;
    pendingDecrement = 0;
    
    try {
        const response = await apiService.decrementBeads(userId, beadsToSync);
        
        // Update displayed count from server response
        displayedBeadCount = response.todayBeads;
        
        // Update counter display with pending operations included
        updateBeadCountUI();

        // Update display - with null checks
        const todayBeadsEl = document.getElementById('todayBeads');
        const todayRoundsEl = document.getElementById('todayRounds');
        const totalBeadsEl = document.getElementById('totalBeads');
        const totalRoundsEl = document.getElementById('totalRounds');
        
        if (todayBeadsEl) todayBeadsEl.textContent = response.todayBeads;
        if (todayRoundsEl) todayRoundsEl.textContent = response.todayRounds;
        if (totalBeadsEl) totalBeadsEl.textContent = response.lifeTimeBeads;
        if (totalRoundsEl) totalRoundsEl.textContent = response.lifeTimeRounds;

        // Update progress bar
        const beadsPerRound = 108;
        const todayProgress = Math.min((response.todayBeads / beadsPerRound) * 100, 100);

        const todayProgressBar = document.getElementById('todayProgressBar');
        
        if (todayProgressBar) {
            todayProgressBar.style.width = todayProgress + '%';
            todayProgressBar.textContent = Math.floor(todayProgress) + '%';
        }

        // Show success feedback
        if (beadsToSync > 1) {
            showAlert(`Removed ${beadsToSync} beads!`, 'info');
        }
    } catch (error) {
        console.error('Error syncing decrements:', error);
        showAlert('Error updating count', 'danger');
        // Restore pending count on error
        pendingDecrement = beadsToSync;
    }
}

// Sync pending increments with backend
async function syncPendingBeads(userId) {
    if (pendingIncrement === 0) return;
    
    const beadsToSync = pendingIncrement;
    pendingIncrement = 0;
    
    try {
        const response = await apiService.incrementBeads(userId, beadsToSync);
        
        // Update displayed count from server response
        displayedBeadCount = response.todayBeads;
        
        // Update counter display with pending operations included
        updateBeadCountUI();

        // Update display - with null checks
        const todayBeadsEl = document.getElementById('todayBeads');
        const todayRoundsEl = document.getElementById('todayRounds');
        const totalBeadsEl = document.getElementById('totalBeads');
        const totalRoundsEl = document.getElementById('totalRounds');
        
        if (todayBeadsEl) todayBeadsEl.textContent = response.todayBeads;
        if (todayRoundsEl) todayRoundsEl.textContent = response.todayRounds;
        if (totalBeadsEl) totalBeadsEl.textContent = response.lifeTimeBeads;
        if (totalRoundsEl) totalRoundsEl.textContent = response.lifeTimeRounds;

        // Update progress bar
        const beadsPerRound = 108;
        const todayProgress = Math.min((response.todayBeads / beadsPerRound) * 100, 100);

        const todayProgressBar = document.getElementById('todayProgressBar');
        
        if (todayProgressBar) {
            todayProgressBar.style.width = todayProgress + '%';
            todayProgressBar.textContent = Math.floor(todayProgress) + '%';
        }

        // Show success feedback
        if (beadsToSync === 108) {
            showAlert('🎉 Congratulations! You completed a round (108 beads)!', 'success');
        } else if (beadsToSync > 1) {
            showAlert(`Great! +${beadsToSync} beads added!`, 'success');
        }
    } catch (error) {
        console.error('Error syncing beads:', error);
        showAlert('Error updating count', 'danger');
        // Restore pending count on error
        pendingIncrement = beadsToSync;
    }
}

async function incrementBeads(userId, count) {
    try {
        const response = await apiService.incrementBeads(userId, count);
        
        // Animate counter update
        const counterDisplay = document.getElementById('counterDisplay');
        if (counterDisplay) {
            counterDisplay.classList.add('pulse');
            counterDisplay.textContent = response.todayBeads;
            setTimeout(() => counterDisplay.classList.remove('pulse'), 300);
        }

        // Update display - with null checks
        const todayBeadsEl = document.getElementById('todayBeads');
        const todayRoundsEl = document.getElementById('todayRounds');
        const totalBeadsEl = document.getElementById('totalBeads');
        const totalRoundsEl = document.getElementById('totalRounds');
        
        if (todayBeadsEl) todayBeadsEl.textContent = response.todayBeads;
        if (todayRoundsEl) todayRoundsEl.textContent = response.todayRounds;
        if (totalBeadsEl) totalBeadsEl.textContent = response.lifeTimeBeads;
        if (totalRoundsEl) totalRoundsEl.textContent = response.lifeTimeRounds;

        // Update progress bar
        const beadsPerRound = 108;
        const todayProgress = Math.min((response.todayBeads / beadsPerRound) * 100, 100);

        const todayProgressBar = document.getElementById('todayProgressBar');
        
        if (todayProgressBar) {
            todayProgressBar.style.width = todayProgress + '%';
            todayProgressBar.textContent = Math.floor(todayProgress) + '%';
        }

        // Show success feedback
        if (count === 108) {
            showAlert('🎉 Congratulations! You completed a round (108 beads)!', 'success');
        } else if (count > 1) {
            showAlert(`Great! +${count} beads added!`, 'success');
        }
    } catch (error) {
        console.error('Error incrementing beads:', error);
        showAlert('Error updating count', 'danger');
    }
}

async function resetTodayCount(userId) {
    try {
        // Clear any pending increments/decrements and their timers
        clearTimeout(incrementDebounceTimer);
        clearTimeout(decrementDebounceTimer);
        pendingIncrement = 0;
        pendingDecrement = 0;

        const response = await apiService.resetBeads(userId);
        
        // Update displayed count from server response
        displayedBeadCount = response.todayBeads;
        
        // Update counter display
        const counterDisplay = document.getElementById('counterDisplay');
        if (counterDisplay) {
            counterDisplay.classList.add('pulse');
            counterDisplay.textContent = displayedBeadCount;
            setTimeout(() => counterDisplay.classList.remove('pulse'), 300);
        }

        // Update display - with null checks
        const todayBeadsEl = document.getElementById('todayBeads');
        const todayRoundsEl = document.getElementById('todayRounds');
        const totalBeadsEl = document.getElementById('totalBeads');
        const totalRoundsEl = document.getElementById('totalRounds');
        
        if (todayBeadsEl) todayBeadsEl.textContent = response.todayBeads;
        if (todayRoundsEl) todayRoundsEl.textContent = response.todayRounds;
        if (totalBeadsEl) totalBeadsEl.textContent = response.lifeTimeBeads;
        if (totalRoundsEl) totalRoundsEl.textContent = response.lifeTimeRounds;

        // Update progress bar
        const todayProgressBar = document.getElementById('todayProgressBar');
        
        if (todayProgressBar) {
            todayProgressBar.style.width = '0%';
            todayProgressBar.textContent = '0%';
        }

        showAlert('Today\'s count has been reset!', 'warning');
    } catch (error) {
        console.error('Error resetting count:', error);
        showAlert('Error resetting count', 'danger');
    }
}

async function loadCounterDisplay(userId) {
    try {
        const today = await apiService.getTodayProgress(userId);

        // Store current count from server and reset pending
        displayedBeadCount = today.todayBeads || 0;
        pendingIncrement = 0;
        pendingDecrement = 0;

        // Update counter display only
        const counterDisplay = document.getElementById('counterDisplay');
        if (counterDisplay) {
            counterDisplay.textContent = displayedBeadCount;
        }
    } catch (error) {
        console.error('Error loading counter display:', error);
        showAlert('Error loading counter data', 'danger');
    }
}



// PROFILE PAGE
function setupProfilePage() {
    const userInfo = apiService.getUserInfo();
    if (!userInfo.userId) {
        window.location.href = 'index.html';
        return;
    }

    // Update user info in header
    const usernameDisplay = document.getElementById('usernameDisplay');
    if (usernameDisplay) {
        usernameDisplay.textContent = userInfo.username;
    }

    loadUserProfile(userInfo.userId);

    // Setup logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

async function loadUserProfile(userId) {
    try {
        const user = await apiService.getUserById(userId);
        
        document.getElementById('profileUsername').textContent = user.username;
        document.getElementById('profileEmail').textContent = user.email;
    } catch (error) {
        console.error('Error loading profile:', error);
        showAlert('Error loading profile data', 'danger');
    }
}

// HISTORY PAGE
function setupHistoryPage() {
    const userInfo = apiService.getUserInfo();
    if (!userInfo.userId) {
        window.location.href = 'index.html';
        return;
    }

    // Update user info in header
    const usernameDisplay = document.getElementById('usernameDisplay');
    if (usernameDisplay) {
        usernameDisplay.textContent = userInfo.username;
    }

    // Setup date filters
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const filterBtn = document.getElementById('filterBtn');

    // Set default dates (last 7 days)
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    if (startDateInput) {
        startDateInput.value = sevenDaysAgo.toISOString().split('T')[0];
    }
    if (endDateInput) {
        endDateInput.value = today.toISOString().split('T')[0];
    }

    // Load initial history
    loadHistory(userInfo.userId);

    if (filterBtn) {
        filterBtn.addEventListener('click', () => {
            const startDate = startDateInput.value;
            const endDate = endDateInput.value;
            loadHistory(userInfo.userId, startDate, endDate);
        });
    }

    // Setup logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

async function loadHistory(userId, startDate = null, endDate = null) {
    try {
        const today = new Date();
        const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        const start = startDate || sevenDaysAgo.toISOString().split('T')[0];
        const end = endDate || today.toISOString().split('T')[0];

        const history = await apiService.getHistory(userId, start, end);
        
        const historyTable = document.getElementById('historyTable');
        if (!historyTable) return;

        if (history.length === 0) {
            historyTable.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No data found for the selected date range</td></tr>';
            return;
        }

        historyTable.innerHTML = history.map(record => `
            <tr>
                <td>${record.japaDate}</td>
                <td>${record.currentBeads}</td>
                <td>${record.currentRounds}</td>
                <td>${record.totalBeadCounts}</td>
                <td>
                    <small class="text-muted">
                        Created: ${new Date(record.createdAt).toLocaleString()}
                    </small>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading history:', error);
        showAlert('Error loading history data', 'danger');
    }
}

// LOGOUT
function handleLogout() {
    apiService.clearTokens();
    window.location.href = 'index.html';
}

// UTILITY FUNCTIONS
function showAlert(message, type = 'info') {
    const alertsContainer = document.getElementById('alertsContainer');
    if (!alertsContainer) return;

    const alertId = 'alert-' + Date.now();
    const alertHTML = `
        <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    alertsContainer.innerHTML += alertHTML;

    // Auto-remove after 5 seconds
    setTimeout(() => {
        const alertElement = document.getElementById(alertId);
        if (alertElement) {
            alertElement.remove();
        }
    }, 5000);
}

// Format date to YYYY-MM-DD
function formatDate(date) {
    return date.toISOString().split('T')[0];
}
