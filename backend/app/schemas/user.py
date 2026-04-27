from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from app.models.user import PlanType

class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    avatar: Optional[str] = None
    plan: PlanType = PlanType.FREE

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None
    plan: Optional[PlanType] = None

class User(UserBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    is_admin: bool = False
    email_verified: bool = False
    
    class Config:
        from_attributes = True
