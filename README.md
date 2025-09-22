# Two-Factor Authentication System with Flask & Bale Messenger Bot

A secure two-factor authentication (2FA) system implementing login with username/password and verification code sent via Bale messenger.

## 🚀 Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Create database and sample users
python create_user.py

# Run the application
python app.py
```

Visit `http://localhost:5000` to access the system.

## ✨ Features

- **Two-Factor Authentication**: Password + SMS-like code via Bale messenger
- **Secure Password Storage**: Uses Werkzeug password hashing
- **Rate Limiting**: Prevents brute force attacks
- **Responsive UI**: Bootstrap-based Persian RTL interface
- **Session Management**: Secure session handling with expiration

## 🛠 Tech Stack

- **Backend**: Python, Flask, SQLAlchemy, SQLite
- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
- **Security**: Werkzeug (password hashing), Flask-Limiter
- **Messaging**: Bale Bot API for verification codes

## 📋 Project Structure

```
project/
├── app.py              # Main Flask application
├── create_user.py      # Database initialization
├── config.py          # Bale bot configuration
├── requirements.txt   # Python dependencies
├── static/           # CSS/JS files
└── templates/        # HTML templates
```

## 🔐 Security Implementation

- Password hashing with salt
- Rate limiting on authentication endpoints
- Session-based user management
- Input validation and sanitization
- Secure code generation and expiration

## 📝 Usage Flow

1. User enters username/password
2. System sends 6-digit code to user's Bale messenger
3. User enters code within 2-minute timeframe
4. Successful verification grants system access

This project demonstrates modern 2FA implementation for educational purposes, showcasing security best practices in web authentication systems.

---

*Developed for educational purposes to demonstrate two-factor authentication security practices.*
