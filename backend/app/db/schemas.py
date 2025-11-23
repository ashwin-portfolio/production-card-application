from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    EMPLOYEE = "employee"

class CardStatus(str, Enum):
    ASSIGNED = "assigned"
    SUBMITTED = "submitted"
    COMPLETED = "completed"

class RebindStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

# User Schemas
class UserBase(BaseModel):
    name: str
    phone: str
    role: UserRole = UserRole.EMPLOYEE
    site_id: Optional[int] = None
    language: str = "en"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    device_hash: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Auth Schemas
class LoginRequest(BaseModel):
    phone: str
    password: str

class OTPVerifyRequest(BaseModel):
    phone: str
    otp: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    requires_otp: bool = False

# Site Schemas
class SiteBase(BaseModel):
    site_name: str
    latitude: float
    longitude: float

class SiteCreate(SiteBase):
    pass

class SiteResponse(SiteBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Production Card Schemas
class ProductionCardBase(BaseModel):
    card_number: str
    site_id: int
    data: Optional[Dict[str, Any]] = None

class ProductionCardCreate(ProductionCardBase):
    assigned_to: Optional[int] = None

class ProductionCardResponse(ProductionCardBase):
    id: int
    assigned_to: Optional[int] = None
    status: CardStatus
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Card Submission Schemas
class CardSubmissionBase(BaseModel):
    card_id: int
    latitude: float
    longitude: float
    data: Optional[Dict[str, Any]] = None

class CardSubmissionCreate(CardSubmissionBase):
    pass

class CardSubmissionResponse(CardSubmissionBase):
    id: int
    user_id: int
    submitted_at: datetime
    is_valid_location: str
    
    class Config:
        from_attributes = True

# Device Rebind Schemas
class DeviceRebindRequestBase(BaseModel):
    old_device_hash: str
    new_device_hash: str

class DeviceRebindRequestCreate(DeviceRebindRequestBase):
    pass

class DeviceRebindRequestResponse(DeviceRebindRequestBase):
    id: int
    user_id: int
    user_name: Optional[str] = None
    phone: Optional[str] = None
    status: RebindStatus
    requested_at: datetime
    approved_at: Optional[datetime] = None
    approved_by: Optional[int] = None
    
    class Config:
        from_attributes = True

class ApproveRebindRequest(BaseModel):
    request_id: int

# Admin Schemas
class DashboardStats(BaseModel):
    total_users: int
    total_cards: int
    pending_submissions: int
    completed_submissions: int
    rebind_requests: int

class CardAssignmentRequest(BaseModel):
    card_number: str
    user_id: int
    site_id: int

