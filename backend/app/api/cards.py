from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.db import models, schemas
from app.api.auth import get_current_user
from app.core import geofence
from app.core.config import settings

router = APIRouter(prefix="/api/cards", tags=["cards"])

@router.get("/my", response_model=List[schemas.ProductionCardResponse])
async def get_my_cards(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all cards assigned to current user"""
    cards = db.query(models.ProductionCard).filter(
        models.ProductionCard.assigned_to == current_user.id
    ).all()
    return cards

@router.get("/{card_id}", response_model=schemas.ProductionCardResponse)
async def get_card(
    card_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get card details by ID"""
    card = db.query(models.ProductionCard).filter(
        models.ProductionCard.id == card_id,
        models.ProductionCard.assigned_to == current_user.id
    ).first()
    
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Card not found"
        )
    
    return card

@router.post("/{card_id}/submit", response_model=schemas.CardSubmissionResponse)
async def submit_card(
    card_id: int,
    submission_data: schemas.CardSubmissionCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit a production card with GPS location"""
    card = db.query(models.ProductionCard).filter(
        models.ProductionCard.id == card_id,
        models.ProductionCard.assigned_to == current_user.id
    ).first()
    
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Card not found"
        )
    
    # Get site location
    site = db.query(models.Site).filter(models.Site.id == card.site_id).first()
    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Site not found"
        )
    
    # Validate geofence
    is_valid, distance = geofence.is_within_geofence(
        submission_data.latitude,
        submission_data.longitude,
        site.latitude,
        site.longitude,
        settings.MAX_DISTANCE_METERS
    )
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Location is {distance:.0f}m away from site. Must be within {settings.MAX_DISTANCE_METERS}m"
        )
    
    # Create submission
    submission = models.CardSubmission(
        card_id=card_id,
        user_id=current_user.id,
        latitude=submission_data.latitude,
        longitude=submission_data.longitude,
        data=submission_data.data,
        is_valid_location="yes"
    )
    
    db.add(submission)
    
    # Update card status
    card.status = models.CardStatus.SUBMITTED
    db.commit()
    db.refresh(submission)
    
    return submission

