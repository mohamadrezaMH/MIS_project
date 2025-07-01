from flask import Flask, render_template, request, session, jsonify, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from datetime import datetime, timedelta
from config import BALE_BOT_TOKEN
import secrets
import time
import requests
import os
import traceback
from sqlalchemy import text
from crypto_utils import decrypt_value

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY') or secrets.token_hex(32)
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=5)
app.config['SESSION_REFRESH_EACH_REQUEST'] = True

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(app.instance_path, "database.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = True

# Create instance directory if not exists
if not os.path.exists(app.instance_path):
    os.makedirs(app.instance_path)

db = SQLAlchemy(app)

# Database models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    bale_chat_id = db.Column(db.String(120))

# Initialize database tables
with app.app_context():
    db.create_all()

# Authentication decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Check if user is authenticated
        if 'authenticated' not in session or not session['authenticated']:
            return redirect(url_for('index'))
        
        # Check session expiration based on login time (5 minutes from login)
        if 'login_time' in session:
            login_time = session['login_time']
            elapsed = datetime.now().timestamp() - login_time
            if elapsed > 300:  # 5 minutes in seconds
                session.clear()
                return redirect(url_for('index'))
        
        return f(*args, **kwargs)
    return decorated_function

# Helper function to send messages via Bale messenger
def send_bale_message(user_id, message, bot_token):
    """Send message to user through Bale messenger bot"""
    url = f"https://tapi.bale.ai/bot{bot_token}/sendMessage"
    payload = {"chat_id": user_id, "text": message}
    
    try:
        response = requests.post(url, json=payload)
        return response.json()
    except Exception as e:
        print(f"Error sending message: {e}")
        return None

# ----------------------------
# Application Routes
# ----------------------------

@app.route('/')
def index():
    """Render login page or redirect to dashboard if user is already logged in"""
    # Check if user is authenticated and session is still valid
    if 'authenticated' in session and session['authenticated']:
        # Check session expiration based on login time
        if 'login_time' in session:
            current_time = datetime.now().timestamp()
            login_time = session['login_time']
            elapsed = current_time - login_time
            
            # If session is still valid, redirect to dashboard
            if elapsed <= 300:  # 5 minutes in seconds
                return redirect(url_for('dashboard'))
            else:
                # Clear expired session
                session.clear()
    
    return render_template('index.html')

@app.route('/api/login', methods=['POST'])
def api_login():
    """Handle first-step authentication (username/password)"""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username).first()
    
    if user and check_password_hash(user.password, password):
        # Generate verification code
        verification_code = secrets.randbelow(900000) + 100000
        session['verification_code'] = str(verification_code)
        session['code_expiry'] = (datetime.now() + timedelta(minutes=2)).timestamp()
        session['user_id'] = user.id
        
        # Send code via Bale
        message = f"کد تأیید شما: {verification_code}\nاین کد تا ۲ دقیقه معتبر است."
        send_bale_message(user.bale_chat_id, message, BALE_BOT_TOKEN)
        print(verification_code)
        
        return jsonify({'success': True, 'message': 'کد تأیید ارسال شد'})
    
    return jsonify({'success': False, 'message': 'نام کاربری یا رمز عبور اشتباه است'}), 401

@app.route('/api/verify', methods=['POST'])
def api_verify():
    """Handle second-step authentication (verification code)"""
    data = request.get_json()
    user_code = data.get('code')
    
    # Check code expiration
    if time.time() > session.get('code_expiry', 0):
        return jsonify({'success': False, 'message': 'زمان وارد کردن کد به پایان رسید'}), 400
    
    # Verify code
    if user_code == session.get('verification_code'):
        session['authenticated'] = True
        session['login_time'] = datetime.now().timestamp()  # Add activity timestamp
        return jsonify({
            'success': True, 
            'redirect': '/dashboard',
            'login_time': session['login_time']
        })
    
    return jsonify({'success': False, 'message': 'کد وارد شده اشتباه است'}), 400

@app.route('/api/resend', methods=['POST'])
def api_resend():
    """Resend verification code"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'message': 'لطفاً ابتدا وارد شوید'}), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'کاربر یافت نشد'}), 404
    
    # Generate new code
    new_code = secrets.randbelow(900000) + 100000
    session['verification_code'] = str(new_code)
    session['code_expiry'] = (datetime.now() + timedelta(minutes=2)).timestamp()
    
    # Send new code
    message = f"کد جدید شما: {new_code}\nاین کد تا ۲ دقیقه معتبر است."
    send_bale_message(user.bale_chat_id, message, BALE_BOT_TOKEN)
    
    return jsonify({'success': True, 'message': 'کد جدید ارسال شد'})

@app.route('/logout', methods=['POST'])
def logout():
    """Clear user session"""
    session.clear()
    return jsonify({'success': True})

@app.route('/dashboard')
@login_required
def dashboard():
    """Render dashboard with hospital data"""
    try:
        # Calculate remaining session time
        current_time = datetime.now().timestamp()
        login_time = session.get('login_time', current_time)
        elapsed = current_time - login_time
        remaining_seconds = max(0, 300 - int(elapsed))  # 5 minutes - elapsed time
        
        # Pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = 50
        offset = (page - 1) * per_page
        
        # Get total count of hospitals
        count_query = text("SELECT COUNT(*) FROM hospitals")
        total_count = db.session.scalar(count_query)
        
        # Get paginated hospital data
        query = text("SELECT * FROM hospitals LIMIT :limit OFFSET :offset")
        result = db.session.execute(query, {'limit': per_page, 'offset': offset})
        
        # Process results
        hospitals = []
        columns = result.keys()
        
        for i, row in enumerate(result):
            hospital_dict = dict(zip(columns, row))
            # Decrypt all fields except Facility_Name
            for key in hospital_dict:
                if key != 'Facility_Name' and hospital_dict[key] is not None:
                    try:
                        hospital_dict[key] = decrypt_value(hospital_dict[key])
                    except Exception:
                        pass
            hospital_dict['global_index'] = offset + 1 + i
            hospitals.append(hospital_dict)
        
        # Calculate total pages
        total_pages = (total_count + per_page - 1) // per_page
        
        return render_template(
            'dashboard.html',
            hospitals=hospitals,
            current_page=page,
            per_page=per_page,
            total_count=total_count,
            total_pages=total_pages,
            remaining_seconds=remaining_seconds  # Pass remaining seconds to template
        )
    except Exception as e:
        traceback.print_exc()
        return f"خطا در لود داشبورد: {str(e)}", 500

@app.route('/api/search')
@login_required
def api_search():
    """Search hospitals by name"""
    try:
        # Get search parameters
        search_term = request.args.get('q', '').strip()
        page = request.args.get('page', 1, type=int)
        per_page = 50
        offset = (page - 1) * per_page
        
        # Build queries based on search term
        if not search_term:
            query = text("SELECT * FROM hospitals")
            count_query = text("SELECT COUNT(*) FROM hospitals")
        else:
            query = text("SELECT * FROM hospitals WHERE Facility_Name LIKE :search")
            count_query = text("SELECT COUNT(*) FROM hospitals WHERE Facility_Name LIKE :search")
        
        # Execute count query
        params = {'search': f'%{search_term}%'} if search_term else {}
        total_count = db.session.scalar(count_query, params)
        
        # Execute data query with pagination
        query_str = str(query) + f" LIMIT {per_page} OFFSET {offset}"
        result = db.session.execute(text(query_str), params)
        
        # Process results
        hospitals = []
        columns = result.keys()
        
        for i, row in enumerate(result):
            hospital_dict = dict(zip(columns, row))
            # Decrypt all fields except Facility_Name
            for key in hospital_dict:
                if key != 'Facility_Name' and hospital_dict[key] is not None:
                    try:
                        hospital_dict[key] = decrypt_value(hospital_dict[key])
                    except Exception:
                        pass
            hospital_dict['global_index'] = offset + 1 + i
            hospitals.append(hospital_dict)
        
        # Calculate total pages
        total_pages = (total_count + per_page - 1) // per_page
        
        return jsonify({
            'success': True,
            'hospitals': hospitals,
            'total_count': total_count,
            'total_pages': total_pages,
            'current_page': page
        })
    except Exception as e:
        return jsonify({'success': False, 'message': 'خطا در انجام جستجو'}), 500


# Application entry point
if __name__ == '__main__':
    app.run(debug=True)