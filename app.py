from flask import Flask, render_template, request, session, jsonify
from flask_sqlalchemy import SQLAlchemy
import secrets
import time
import requests
from datetime import datetime, timedelta
import os
from werkzeug.security import generate_password_hash, check_password_hash
from config import BALE_BOT_TOKEN

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY') or secrets.token_hex(32)

# تنظیمات دیتابیس
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    bale_chat_id = db.Column(db.String(120))

def initialize_database():
    with app.app_context():
        db.create_all()
        print("database created")

initialize_database()

# ---------- API Endpoints ----------

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username).first()
        
    
    if user and check_password_hash(user.password, password):
            
            
        verification_code = secrets.randbelow(900000) + 100000
        session['verification_code'] = str(verification_code)
        session['code_expiry'] = (datetime.now() + timedelta(minutes=2)).timestamp()
        session['user_id'] = user.id
        
        # ارسال کد به بله
        message = f"کد تأیید شما: {verification_code}\nاین کد تا ۲ دقیقه معتبر است."
        send_bale_message(user.bale_chat_id, message, BALE_BOT_TOKEN)
        
        return jsonify({
            'success': True,
            'message': 'کد تأیید ارسال شد'
        })
    else:
        return jsonify({
            'success': False,
            'message': 'نام کاربری یا رمز عبور اشتباه است'
        }), 401

@app.route('/api/verify', methods=['POST'])
def api_verify():
    data = request.get_json()
    user_code = data.get('code')
    
    # بررسی انقضای کد
    if time.time() > session.get('code_expiry', 0):
        return jsonify({
            'success': False,
            'message': 'زمان وارد کردن کد به پایان رسید'
        }), 400
    
    if user_code == session.get('verification_code'):
        return jsonify({
            'success': True,
            'message': 'ورود موفقیت‌آمیز بود'
        })
    else:
        return jsonify({
            'success': False,
            'message': 'کد وارد شده اشتباه است'
        }), 400

@app.route('/api/resend', methods=['POST'])
def api_resend():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({
            'success': False,
            'message': 'لطفاً ابتدا وارد شوید'
        }), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({
            'success': False,
            'message': 'کاربر یافت نشد'
        }), 404
    
    new_code = secrets.randbelow(900000) + 100000
    session['verification_code'] = str(new_code)
    session['code_expiry'] = (datetime.now() + timedelta(minutes=2)).timestamp()
    
    # ارسال کد جدید
    message = f"کد جدید شما: {new_code}\nاین کد تا ۲ دقیقه معتبر است."
    send_bale_message(user.bale_chat_id, message, BALE_BOT_TOKEN)
    
    return jsonify({
        'success': True,
        'message': 'کد جدید ارسال شد'
    })

def send_bale_message(user_id, message, bot_token):
    """ارسال پیام به کاربر از طریق ربات بله"""
    url = f"https://tapi.bale.ai/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": user_id,
        "text": message
    }
    try:
        response = requests.post(url, json=payload)
        print(f"پاسخ بله: {response.status_code} - {response.text}")
        return response.json()
    except Exception as e:
        print(f"خطا در ارسال پیام: {e}")
        return None
    

if __name__ == '__main__':
    app.run(debug=True)
