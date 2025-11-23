from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime
from app.db.database import get_db
from app.db import models, schemas
from app.api.auth import get_current_user
from fastapi.responses import StreamingResponse
import csv
import io

router = APIRouter(prefix="/api/admin", tags=["admin"])

def require_admin(current_user: models.User = Depends(get_current_user)) -> models.User:
    """Require admin role"""
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

@router.get("/dashboard", response_model=schemas.DashboardStats)
async def get_dashboard(
    admin_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics"""
    total_users = db.query(func.count(models.User.id)).scalar()
    total_cards = db.query(func.count(models.ProductionCard.id)).scalar()
    pending_submissions = db.query(func.count(models.CardSubmission.id)).filter(
        models.CardSubmission.is_valid_location == "yes"
    ).scalar()
    completed_submissions = db.query(func.count(models.CardSubmission.id)).scalar()
    rebind_requests = db.query(func.count(models.DeviceRebindRequest.id)).filter(
        models.DeviceRebindRequest.status == models.RebindStatus.PENDING
    ).scalar()
    
    return {
        "total_users": total_users or 0,
        "total_cards": total_cards or 0,
        "pending_submissions": pending_submissions or 0,
        "completed_submissions": completed_submissions or 0,
        "rebind_requests": rebind_requests or 0
    }

@router.get("/users", response_model=List[schemas.UserResponse])
async def get_users(
    admin_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all users (admin only)"""
    users = db.query(models.User).filter(
        models.User.role == models.UserRole.EMPLOYEE
    ).all()
    return users

@router.get("/submissions")
async def get_submissions(
    admin_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all card submissions with user and site information"""
    submissions = db.query(models.CardSubmission).join(
        models.ProductionCard
    ).join(models.User).join(models.Site).all()
    
    # Format response with user and site info
    result = []
    for submission in submissions:
        result.append({
            "id": submission.id,
            "card_id": submission.card_id,
            "card_number": submission.card.card_number,
            "user_id": submission.user_id,
            "user_name": submission.user.name,
            "site_name": submission.card.site.site_name,
            "latitude": submission.latitude,
            "longitude": submission.longitude,
            "submitted_at": submission.submitted_at,
            "status": "completed" if submission.is_valid_location == "yes" else "pending",
            "data": submission.data
        })
    
    return result

@router.post("/assign-card")
async def assign_card(
    assignment: schemas.CardAssignmentRequest,
    admin_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Assign a production card to a user"""
    # Check if card exists
    card = db.query(models.ProductionCard).filter(
        models.ProductionCard.card_number == assignment.card_number
    ).first()
    
    if not card:
        # Create new card
        card = models.ProductionCard(
            card_number=assignment.card_number,
            site_id=assignment.site_id,
            assigned_to=assignment.user_id,
            status=models.CardStatus.ASSIGNED
        )
        db.add(card)
    else:
        # Update existing card
        card.assigned_to = assignment.user_id
        card.site_id = assignment.site_id
        card.status = models.CardStatus.ASSIGNED
    
    db.commit()
    db.refresh(card)
    
    return {"message": "Card assigned successfully", "card": card}

@router.get("/export-csv")
async def export_csv(
    admin_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Export all submission data to CSV in production format"""
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write headers matching the required format
    writer.writerow([
        "date",
        "operator name",
        "machine name",
        "part no and name",
        "operation name",
        "production time",
        "cycle time",
        "target",
        "produced qty",
        "percent qty",
        "rejection qty",
        "rework qty",
        "remarks"
    ])
    
    # Write data
    submissions = db.query(models.CardSubmission).join(
        models.ProductionCard
    ).join(models.User).join(models.Site).order_by(
        models.CardSubmission.submitted_at.desc()
    ).all()
    
    for submission in submissions:
        # Extract data from JSON field if available
        submission_data = submission.data or {}
        
        # Format date as DD.MM.YYYY
        date_str = submission.submitted_at.strftime("%d.%m.%Y") if submission.submitted_at else ""
        
        # Get operator name
        operator_name = submission.user.name or ""
        
        # Extract production data from JSON
        machine_name = submission_data.get("machine_name", submission_data.get("machine", ""))
        part_no_and_name = submission_data.get("part_no_and_name", submission_data.get("part_number", ""))
        if not part_no_and_name and submission_data.get("part_name"):
            part_no_and_name = f"{submission_data.get('part_number', '')}-{submission_data.get('part_name', '')}"
        operation_name = submission_data.get("operation_name", submission_data.get("operation", ""))
        production_time = submission_data.get("production_time", submission_data.get("production_time_hours", ""))
        cycle_time = submission_data.get("cycle_time", submission_data.get("cycle_time_minutes", ""))
        target = submission_data.get("target", submission_data.get("target_qty", ""))
        produced_qty = submission_data.get("produced_qty", submission_data.get("produced", ""))
        rejection_qty = submission_data.get("rejection_qty", submission_data.get("rejection", ""))
        rework_qty = submission_data.get("rework_qty", submission_data.get("rework", ""))
        remarks = submission_data.get("remarks", submission_data.get("notes", ""))
        
        # Calculate percent qty if target and produced qty are available
        percent_qty = ""
        try:
            if target and produced_qty:
                target_val = float(target) if isinstance(target, (int, float, str)) and str(target).strip() else 0
                produced_val = float(produced_qty) if isinstance(produced_qty, (int, float, str)) and str(produced_qty).strip() else 0
                if target_val > 0:
                    percent = (produced_val / target_val) * 100
                    percent_qty = f"{percent:.0f}%"
        except (ValueError, TypeError):
            pass
        
        # Format production time (add 'h' suffix if it's a number)
        if production_time and isinstance(production_time, (int, float)):
            production_time = f"{production_time}h"
        elif production_time and isinstance(production_time, str) and production_time.replace(".", "").replace("-", "").isdigit():
            production_time = f"{production_time}h"
        
        # Format cycle time (add 'min' suffix if it's a number)
        if cycle_time and isinstance(cycle_time, (int, float)):
            cycle_time = f"{cycle_time}min"
        elif cycle_time and isinstance(cycle_time, str) and cycle_time.replace(".", "").replace("-", "").isdigit():
            cycle_time = f"{cycle_time}min"
        
        writer.writerow([
            date_str,
            operator_name,
            machine_name,
            part_no_and_name,
            operation_name,
            production_time,
            cycle_time,
            target,
            produced_qty,
            percent_qty,
            rejection_qty,
            rework_qty,
            remarks
        ])
    
    output.seek(0)
    
    # Generate filename with current date
    date_str = datetime.now().strftime("%Y-%m-%d")
    filename = f"submissions_{date_str}.csv"
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

