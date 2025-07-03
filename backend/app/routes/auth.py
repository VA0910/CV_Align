from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import timedelta
from typing import Optional
from ..models.user import UserCreate, User, UserRole
from ..database import Database
from ..utils.mongo_utils import convert_id
from ..auth.utils import (
    verify_password,
    get_password_hash,
    create_access_token,
    verify_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    payload = verify_token(token)
    user = await Database.get_collection("users").find_one({"email": payload["sub"]})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    return User(**convert_id(user))

@router.post("/signup")
async def signup(user_data: UserCreate):
    # Check if user already exists
    existing_user = await Database.get_collection("users").find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Verify company code
    company = await Database.get_collection("companies").find_one({"code": user_data.company_code})
    if not company:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid company code"
        )
    
    # Create new user
    user_dict = user_data.dict()
    user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
    user_dict["is_active"] = True
    
    result = await Database.get_collection("users").insert_one(user_dict)
    user_dict["id"] = str(result.inserted_id)
    
    return {"message": "User created successfully", "user": User(**convert_id(user_dict))}

@router.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await Database.get_collection("users").find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"], "role": user["role"]},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": User(**convert_id(user))
    }

@router.get("/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user 