from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    HIRING_MANAGER = "hiring_manager"
    RECRUITER = "recruiter"

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    company_code: str
    role: UserRole

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    hashed_password: str
    is_active: bool = True

class User(UserBase):
    id: str
    is_active: bool

    class Config:
        from_attributes = True 