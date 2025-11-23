from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Enum, Float, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    EMPLOYEE = "employee"

class CardStatus(str, enum.Enum):
    ASSIGNED = "assigned"
    SUBMITTED = "submitted"
    COMPLETED = "completed"

class RebindStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class Site(Base):
    __tablename__ = "sites"
    
    id = Column(Integer, primary_key=True, index=True)
    site_name = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    users = relationship("User", back_populates="site")
    cards = relationship("ProductionCard", back_populates="site")

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    phone = Column(String(20), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.EMPLOYEE)
    site_id = Column(Integer, ForeignKey("sites.id"), nullable=True)
    device_hash = Column(String(255), nullable=True)
    language = Column(String(10), default="en")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    site = relationship("Site", back_populates="users")
    cards = relationship("ProductionCard", back_populates="assigned_user")
    submissions = relationship("CardSubmission", back_populates="user")
    rebind_requests = relationship("DeviceRebindRequest", back_populates="user", foreign_keys="[DeviceRebindRequest.user_id]")

class ProductionCard(Base):
    __tablename__ = "production_cards"
    
    id = Column(Integer, primary_key=True, index=True)
    card_number = Column(String(100), unique=True, nullable=False, index=True)
    site_id = Column(Integer, ForeignKey("sites.id"), nullable=False)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    data = Column(JSON, nullable=True)
    status = Column(Enum(CardStatus), default=CardStatus.ASSIGNED)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    site = relationship("Site", back_populates="cards")
    assigned_user = relationship("User", back_populates="cards")
    submissions = relationship("CardSubmission", back_populates="card")

class CardSubmission(Base):
    __tablename__ = "card_submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(Integer, ForeignKey("production_cards.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    data = Column(JSON, nullable=True)
    is_valid_location = Column(String(10), default="yes")
    
    card = relationship("ProductionCard", back_populates="submissions")
    user = relationship("User", back_populates="submissions")

class DeviceRebindRequest(Base):
    __tablename__ = "device_rebind_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    old_device_hash = Column(String(255), nullable=False)
    new_device_hash = Column(String(255), nullable=False)
    status = Column(Enum(RebindStatus), default=RebindStatus.PENDING)
    requested_at = Column(DateTime, default=datetime.utcnow)
    approved_at = Column(DateTime, nullable=True)
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    user = relationship("User", back_populates="rebind_requests", foreign_keys=[user_id])

