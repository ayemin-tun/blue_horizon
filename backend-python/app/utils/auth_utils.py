import os
from datetime import datetime, timedelta
from passlib.context import CryptContext
import jwt
from dotenv import load_dotenv

load_dotenv() # read variable from env 
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.environ.get("SECRET_KEY", "fallback_local_secret_key")
ALGORITHM = os.environ.get("ALGORITHM", "HS256")

# Password Hashing Function
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# Check password with hash
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Generate Access token
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        #use expire time on .env (change string to integer
        expire_minutes = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", 60))
        expire = datetime.utcnow() + timedelta(minutes=expire_minutes)
        
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import models
from app.database.database import get_db


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decode the JWT Token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except (jwt.PyJWTError, AttributeError):
        raise credentials_exception

    
    user = db.query(models.User).filter(
        models.User.email == email, 
        models.User.is_deleted == 0
    ).first()
    
    if user is None:
        raise credentials_exception
        
    return user