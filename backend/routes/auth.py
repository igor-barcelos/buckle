from fastapi import APIRouter, HTTPException, status, Depends
from database import get_database
from pymongo.database import Database
from models.user import UserCreate, UserLogin, UserResponse
from auth import hash_password, verify_password, create_access_token
from bson import ObjectId
from typing import Dict

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Database = Depends(get_database)):
    existing_user = db.users.find_one({"email": user_data.email})
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    password = hash_password(user_data.password)
    
    new_user = {
        "email": user_data.email,
        "username": user_data.username,
        "password": password,
        "active": True
    }
    
    result = db.users.insert_one(new_user)
    
    return UserResponse(
        id=str(result.inserted_id),
        email=new_user["email"],
        username=new_user["username"],
        active=new_user["active"]
    )


@router.post("/login", response_model=Dict[str, str])
async def login(user_credentials: UserLogin, db: Database = Depends(get_database)):
    user = db.users.find_one({"email": user_credentials.email})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not verify_password(user_credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.get("active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    user_id = str(user["_id"])
    token_data = {
        "sub": user["email"],
        "user_id": user_id
    }
    
    access_token = create_access_token(data=token_data)
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

