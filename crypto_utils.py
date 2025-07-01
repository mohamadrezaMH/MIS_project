from cryptography.fernet import Fernet
from config import FERNET_KEY

fernet = Fernet(FERNET_KEY)

def encrypt_value(value):
    if value is None:
        return None
    if not isinstance(value, bytes):
        value = str(value).encode()
    return fernet.encrypt(value).decode()

def decrypt_value(value):
    if value is None:
        return None
    if not isinstance(value, bytes):
        value = value.encode()
    return fernet.decrypt(value).decode() 