import random
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Dict
from app.core.config import settings

# In-memory OTP storage (use Redis in production)
otp_storage: Dict[str, Dict] = {}

def generate_otp(length: int = None) -> str:
    """Generate a random OTP"""
    if length is None:
        length = settings.OTP_LENGTH
    return ''.join([str(random.randint(0, 9)) for _ in range(length)])

def send_otp(phone: str) -> str:
    """Generate and store OTP for phone number"""
    otp = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRY_MINUTES)
    
    otp_storage[phone] = {
        "otp": otp,
        "expires_at": expires_at,
        "attempts": 0
    }
    
    # In production, send SMS via API
    # For now, just print to console
    print(f"[SMS] OTP for {phone}: {otp} (expires in {settings.OTP_EXPIRY_MINUTES} minutes)")
    
    return otp

def verify_otp(phone: str, otp: str) -> bool:
    """Verify OTP for phone number"""
    if phone not in otp_storage:
        return False
    
    stored_data = otp_storage[phone]
    
    # Check expiry
    if datetime.utcnow() > stored_data["expires_at"]:
        del otp_storage[phone]
        return False
    
    # Check attempts
    if stored_data["attempts"] >= 3:
        del otp_storage[phone]
        return False
    
    # Verify OTP
    if stored_data["otp"] == otp:
        del otp_storage[phone]
        return True
    
    # Increment attempts
    stored_data["attempts"] += 1
    return False

def hash_device_id(device_id: str) -> str:
    """Hash device ID for storage"""
    return hashlib.sha256(device_id.encode()).hexdigest()

