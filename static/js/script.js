const passwordInput = document.getElementById('password');
const lockIcon = document.querySelector('.lock-icon');
const eyeIcon = document.getElementById('password-toggle');

// Function to update icon visibility states
function updateIcons() {
  const hasValue = passwordInput.value.length > 0;
  const isFocused = document.activeElement === passwordInput;

  // Lock icon: show only when input is empty AND not focused
  lockIcon.style.display = (isFocused) ? 'none' : 'block';
  
  // Eye icon: show only when input is focused AND contains text
  eyeIcon.style.display = (isFocused && hasValue) ? 'block' : 'none';
}

// Event listeners for input interactions
passwordInput.addEventListener('focus', updateIcons);  // Update on focus
passwordInput.addEventListener('blur', updateIcons);   // Update on blur
passwordInput.addEventListener('input', updateIcons);  // Update on typing

// Handle eye icon click to toggle password visibility
eyeIcon.addEventListener('mousedown', function(e) {
  e.preventDefault();  // Prevent input blur when clicking icon
  
  const icon = this.querySelector('i');
  
  // Toggle password visibility
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    icon.classList.replace('fa-eye', 'fa-eye-slash');  // Show closed eye
  } else {
    passwordInput.type = 'password';
    icon.classList.replace('fa-eye-slash', 'fa-eye');  // Show open eye
  }
  
  // Maintain input focus after toggle
  passwordInput.focus();
});

// Initialize icon states on page load
updateIcons();



// Timer variables
let timerInterval;
let timeLeft = 120; // 2 minutes

// Function to start timer
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

// Function to update timer display
function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Success message display function
function showSuccess(message) {
    Swal.fire({
        icon: 'success',
        title: 'موفقیت',
        text: message,
        confirmButtonText: 'باشه'
    });
}

// Error message display function
function showError(message) {
    Swal.fire({
        icon: 'error',
        title: 'خطا',
        text: message,
        confirmButtonText: 'باشه'
    });
}

// Function to show verification step
function showVerification() {
    document.getElementById('login-container').classList.add('d-none');
    document.getElementById('verify-container').classList.remove('d-none');
    startTimer();
}

// Function to show final success
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


// Function to show failure
function showFailure(message) {
    document.getElementById('failure-reason').textContent = message;
    document.getElementById('verify-container').classList.add('d-none');
    document.getElementById('failure-container').classList.remove('d-none');
    clearInterval(timerInterval);
}

// Function to reset forms
function resetForms() {
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('verification-code').value = '';
    clearInterval(timerInterval);
    
    // Reset password icon
    const passwordInput = document.getElementById('password');
    const icon = document.querySelector('#password-toggle i');
    passwordInput.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
    
    // Return to login page
    document.getElementById('success-container').classList.add('d-none');
    document.getElementById('failure-container').classList.add('d-none');
    document.getElementById('login-container').classList.remove('d-none');
}

// Login form submission
document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showVerification();
        } else {
            showError(data.message);
        }
    } catch (error) {
        showError('خطا در ارتباط با سرور');
        console.error('Login error:', error);
    }
});

// Verification code submission
document.getElementById('verify-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const code = document.getElementById('verification-code').value;
    
    try {
        const response = await fetch('/api/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showFinalSuccess();
        } else {
            showError(data.message);
        }
    } catch (error) {
        showError('خطا در ارتباط با سرور');
        console.error('Verification error:', error);
    }
});

// Resend code
document.getElementById('resend-code').addEventListener('click', async function() {
    try {
        const response = await fetch('/api/resend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
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
        console.error('Resend error:', error);
    }
});
// Return to login page
document.getElementById('back-to-login').addEventListener('click', resetForms);
document.getElementById('try-again').addEventListener('click', resetForms);