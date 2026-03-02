from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database import get_db
from app.models.employer import Employer
from app.models.user import User
from app.schemas import EmployerCreate, EmployerUpdate, EmployerResponse


router = APIRouter()


@router.get("/me", response_model=EmployerResponse)
def get_my_employer_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    employer = db.query(Employer).filter(Employer.user_id == current_user.id).first()
    if not employer:
        raise HTTPException(status_code=404, detail="Employer profile not found")
    return employer


@router.post("", response_model=EmployerResponse)
def create_employer_profile(
    payload: EmployerCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = db.query(Employer).filter(Employer.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Employer profile already exists")

    employer = Employer(user_id=current_user.id, **payload.dict(exclude_unset=True))
    db.add(employer)
    db.commit()
    db.refresh(employer)
    return employer


@router.patch("/me", response_model=EmployerResponse)
def update_employer_profile(
    payload: EmployerUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    employer = db.query(Employer).filter(Employer.user_id == current_user.id).first()
    if not employer:
        raise HTTPException(status_code=404, detail="Employer profile not found")

    for key, value in payload.dict(exclude_unset=True).items():
        setattr(employer, key, value)

    db.add(employer)
    db.commit()
    db.refresh(employer)
    return employer

