from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db import models, schemas
from app.core import security, sms_service
from datetime import timedelta
from app.core.config import settings

router = APIRouter(prefix="/api/auth", tags=["authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Dependency to get current user (must be defined before routes that use it)
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> models.User:
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = security.decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    
    return user

@router.post("/login", response_model=schemas.TokenResponse)
async def login(
    login_data: schemas.LoginRequest,
    db: Session = Depends(get_db)
):
    """Login with phone and password"""
    try:
        user = db.query(models.User).filter(models.User.phone == login_data.phone).first()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection error: {str(e)}. Please ensure MySQL is running."
        )
    
    if not user or not security.verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect phone or password"
        )
    
    # Generate OTP for first login or device change
    requires_otp = False
    if not user.device_hash:
        requires_otp = True
        sms_service.send_otp(login_data.phone)
        user_response = schemas.UserResponse(
            id=user.id,
            name=user.name,
            phone=user.phone,
            role=user.role,
            site_id=user.site_id,
            language=user.language,
            device_hash=user.device_hash,
            created_at=user.created_at
        )
        return {
            "access_token": "",
            "token_type": "bearer",
            "user": user_response,
            "requires_otp": True
        }
    
    # Create access token
    access_token = security.create_access_token(
        data={"sub": str(user.id), "role": user.role.value},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    user_response = schemas.UserResponse(
        id=user.id,
        name=user.name,
        phone=user.phone,
        role=user.role,
        site_id=user.site_id,
        language=user.language,
        device_hash=user.device_hash,
        created_at=user.created_at
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_response,
        "requires_otp": False
    }

@router.post("/verify-otp", response_model=schemas.TokenResponse)
async def verify_otp(
    otp_data: schemas.OTPVerifyRequest,
    device_hash: str = None,
    db: Session = Depends(get_db)
):
    """Verify OTP and complete login"""
    user = db.query(models.User).filter(models.User.phone == otp_data.phone).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Verify OTP
    if not sms_service.verify_otp(otp_data.phone, otp_data.otp):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired OTP"
        )
    
    # Update device hash if provided
    if device_hash:
        user.device_hash = sms_service.hash_device_id(device_hash)
        db.commit()
        db.refresh(user)
    
    # Create access token
    access_token = security.create_access_token(
        data={"sub": str(user.id), "role": user.role.value},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    user_response = schemas.UserResponse(
        id=user.id,
        name=user.name,
        phone=user.phone,
        role=user.role,
        site_id=user.site_id,
        language=user.language,
        device_hash=user.device_hash,
        created_at=user.created_at
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_response,
        "requires_otp": False
    }

@router.post("/refresh")
async def refresh_token(
    current_user: models.User = Depends(get_current_user)
):
    """Refresh access token"""
    access_token = security.create_access_token(
        data={"sub": str(current_user.id), "role": current_user.role.value},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

