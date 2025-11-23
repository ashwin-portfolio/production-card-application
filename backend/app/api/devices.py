from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.db import models, schemas
from app.api.auth import get_current_user
from app.core import sms_service
from datetime import datetime

router = APIRouter(prefix="/api/devices", tags=["devices"])

@router.post("/register")
async def register_device(
    device_hash: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Register or update device hash for user"""
    hashed_device = sms_service.hash_device_id(device_hash)
    
    # Check if device is already registered
    if current_user.device_hash == hashed_device:
        return {"message": "Device already registered"}
    
    # Check if user has existing device
    if current_user.device_hash:
        # Create rebind request
        rebind_request = models.DeviceRebindRequest(
            user_id=current_user.id,
            old_device_hash=current_user.device_hash,
            new_device_hash=hashed_device,
            status=models.RebindStatus.PENDING
        )
        db.add(rebind_request)
        db.commit()
        
        return {
            "message": "Device rebind request created. Waiting for admin approval.",
            "requires_approval": True
        }
    
    # First time device registration
    current_user.device_hash = hashed_device
    db.commit()
    
    return {"message": "Device registered successfully"}

@router.get("/rebind-requests", response_model=List[schemas.DeviceRebindRequestResponse])
async def get_rebind_requests(
    admin_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all pending rebind requests (admin only)"""
    if admin_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    requests = db.query(models.DeviceRebindRequest).join(
        models.User, models.DeviceRebindRequest.user_id == models.User.id
    ).filter(
        models.DeviceRebindRequest.status == models.RebindStatus.PENDING
    ).all()
    
    # Add user information to response
    result = []
    for req in requests:
        user = db.query(models.User).filter(models.User.id == req.user_id).first()
        req_dict = {
            "id": req.id,
            "user_id": req.user_id,
            "user_name": user.name if user else None,
            "phone": user.phone if user else None,
            "old_device_hash": req.old_device_hash,
            "new_device_hash": req.new_device_hash,
            "status": req.status,
            "requested_at": req.requested_at,
            "approved_at": req.approved_at,
            "approved_by": req.approved_by
        }
        result.append(req_dict)
    
    return result

@router.post("/approve-rebind")
async def approve_rebind(
    request_data: schemas.ApproveRebindRequest,
    admin_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Approve a device rebind request (admin only)"""
    if admin_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    rebind_request = db.query(models.DeviceRebindRequest).filter(
        models.DeviceRebindRequest.id == request_data.request_id
    ).first()
    
    if not rebind_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rebind request not found"
        )
    
    # Update user device hash
    user = db.query(models.User).filter(models.User.id == rebind_request.user_id).first()
    if user:
        user.device_hash = rebind_request.new_device_hash
    
    # Update rebind request status
    rebind_request.status = models.RebindStatus.APPROVED
    rebind_request.approved_at = datetime.utcnow()
    rebind_request.approved_by = admin_user.id
    
    db.commit()
    
    return {"message": "Rebind request approved successfully"}

