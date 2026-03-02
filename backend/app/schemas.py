from typing import Optional, Any

from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    is_active: bool
    is_superuser: bool

    class Config:
        from_attributes = True


class EmployerBase(BaseModel):
    company_name_anonymized: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None
    stage: Optional[str] = None
    location: Optional[str] = None
    timezone: Optional[str] = None
    remote_policy: Optional[str] = None
    compensation_bracket: Optional[str] = None
    privacy_settings: Optional[dict[str, Any]] = None


class EmployerCreate(EmployerBase):
    pass


class EmployerUpdate(EmployerBase):
    pass


class EmployerResponse(EmployerBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
