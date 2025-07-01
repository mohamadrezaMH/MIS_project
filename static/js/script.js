// Password field elements
const passwordInput = document.getElementById('password');
const lockIcon = document.querySelector('.lock-icon');
const eyeIcon = document.getElementById('password-toggle');

/**
 * Update visibility of password field icons
 */
function updateIcons() {
    const hasValue = passwordInput.value.length > 0;
    const isFocused = document.activeElement === passwordInput;
    
    // Show lock icon only when input is empty and not focused
    lockIcon.style.display = isFocused ? 'none' : 'block';
    
    // Show eye icon only when input is focused and has value
    eyeIcon.style.display = (isFocused && hasValue) ? 'block' : 'none';
}

// Initialize icon states
updateIcons();

// Add event listeners for password field interactions
passwordInput.addEventListener('focus', updateIcons);
passwordInput.addEventListener('blur', updateIcons);
passwordInput.addEventListener('input', updateIcons);

// Toggle password visibility
eyeIcon.addEventListener('mousedown', function(e) {
    e.preventDefault();
    const icon = this.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
    
    passwordInput.focus();
});

// Timer variables
let timerInterval;
let timeLeft = 120; // 2 minutes

/**
 * Start countdown timer
 */
function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 120;
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            showFailure('زمان وارد کردن کد به پایان رسید!');
        }
    }, 1000);
}

/**
 * Update timer display
 */
function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Show success message
 * @param {string} message - Message to display
 */
function showSuccess(message) {
    Swal.fire({
        icon: 'success',
        title: 'موفقیت',
        text: message,
        confirmButtonText: 'باشه'
    });
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showError(message) {
    Swal.fire({
        icon: 'error',
        title: 'خطا',
        text: message,
        confirmButtonText: 'باشه'
    });
}

/**
 * Show verification step UI
 */
function showVerification() {
    document.getElementById('login-container').classList.add('d-none');
    document.getElementById('verify-container').classList.remove('d-none');
    startTimer();
}

/**
 * Handle successful login
 */
function showFinalSuccess() {
    Swal.fire({
        icon: 'success',
        title: 'ورود موفقیت‌آمیز!',
        text: 'در حال انتقال به صفحه داشبورد...',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
    }).then(() => {
        window.location.href = '/dashboard';
    });
}

/**
 * Show failure message
 * @param {string} message - Failure reason
 */
function showFailure(message) {
    document.getElementById('failure-reason').textContent = message;
    document.getElementById('verify-container').classList.add('d-none');
    document.getElementById('failure-container').classList.remove('d-none');
    clearInterval(timerInterval);
}

/**
 * Reset forms and clear session
 */
async function resetForms() {
    // Clear input fields
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('verification-code').value = '';
    
    // Reset password field
    const passwordInput = document.getElementById('password');
    const icon = document.querySelector('#password-toggle i');
    passwordInput.type = 'password';
    icon.classList.replace('fa-eye-slash', 'fa-eye');
    
    // Reset UI states
    document.getElementById('failure-container').classList.add('d-none');
    document.getElementById('login-container').classList.remove('d-none');
    clearInterval(timerInterval);
    
    // Clear server session
    try {
        await fetch('/logout', { method: 'POST' });
    } catch (error) {
        console.error('Logout error:', error);
    }
}

/**
 * Logout user
 */
async function logout() {
    try {
        await fetch('/logout', { method: 'POST' });
        resetForms();
        window.location.href = '/';
    } catch (error) {
        showError('خطا در خروج از سیستم');
    }
}

// ----------------------------
// Event Listeners
// ----------------------------

// Login form submission
document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        data.success ? showVerification() : showError(data.message);
    } catch (error) {
        showError('خطا در ارتباط با سرور');
    }
});

// Verification code submission
document.getElementById('verify-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const code = document.getElementById('verification-code').value;
    
    try {
        const response = await fetch('/api/verify', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ code })
        });
        
        const data = await response.json();
        data.success ? showFinalSuccess() : showError(data.message);
    } catch (error) {
        showError('خطا در ارتباط با سرور');
    }
});

// Resend verification code
document.getElementById('resend-code').addEventListener('click', async function() {
    try {
        const response = await fetch('/api/resend', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        });
        
        const data = await response.json();
        
        if (data.success) {
            startTimer();
            Swal.fire({
                icon: 'success',
                title: 'کد جدید ارسال شد',
                text: 'کد تأیید جدید به پیام‌رسان بله شما ارسال شد',
                confirmButtonText: 'باشه'
            });
        } else {
            showError(data.message);
        }
    } catch (error) {
        showError('خطا در ارتباط با سرور');
    }
});

// Back to login buttons
// document.getElementById('back-to-login')?.addEventListener('click', resetForms);
// document.getElementById('try-again')?.addEventListener('click', resetForms);