from app import app, db, User
from werkzeug.security import generate_password_hash

def create_users():
    users = [
        {
            'username': 'alireza',
            'password': 'mokhtari',
            'bale_chat_id': '801131447'
        },
        {
            'username': 'mohamadreza',
            'password': 'mohamadi',
            'bale_chat_id': '801131449' 
        },
        {
            'username': 'user3',
            'password': 'user3',
            'bale_chat_id': '801131440'
        }
    ]
    
    with app.app_context():
        for user_data in users:
            if not User.query.filter_by(username=user_data['username']).first():
                new_user = User(
                    username=user_data['username'],
                    password=generate_password_hash(user_data['password']),
                    bale_chat_id=user_data['bale_chat_id']
                )
                db.session.add(new_user)
                print(f"user {user_data['username']} created")
        
        db.session.commit()
        print("all user created")

if __name__ == '__main__':
    create_users()