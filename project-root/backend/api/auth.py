"""
Authentication API router.

Endpoints for user registration, login, and profile retrieval.
Uses JWT tokens with bcrypt password hashing.
"""

from datetime import datetime ,timedelta ,timezone 
from typing import Optional 

from fastapi import APIRouter ,Depends ,HTTPException ,status 
from fastapi .security import OAuth2PasswordBearer ,OAuth2PasswordRequestForm 
from jose import JWTError ,jwt 
from passlib .context import CryptContext 
from pydantic import BaseModel ,EmailStr 
from sqlalchemy .orm import Session 

from config import settings 
from database .session import get_db 
from database .models import User ,Profile 


router =APIRouter (prefix ="/api/auth",tags =["Authentication"])

pwd_context =CryptContext (schemes =["bcrypt"],deprecated ="auto")
oauth2_scheme =OAuth2PasswordBearer (tokenUrl ="/api/auth/login")




class RegisterRequest (BaseModel ):
    name :str 
    email :str 
    password :str 

class LoginRequest (BaseModel ):
    email :str 
    password :str 

class TokenResponse (BaseModel ):
    access_token :str 
    token_type :str ="bearer"
    user :dict 

class UserResponse (BaseModel ):
    id :str 
    name :str 
    email :str 
    created_at :Optional [datetime ]=None 




def hash_password (password :str )->str :
    return pwd_context .hash (password )

def verify_password (plain :str ,hashed :str )->bool :
    return pwd_context .verify (plain ,hashed )

def create_access_token (data :dict ,expires_delta :Optional [timedelta ]=None )->str :
    to_encode =data .copy ()
    expire =datetime .now (timezone .utc )+(expires_delta or timedelta (minutes =settings .ACCESS_TOKEN_EXPIRE_MINUTES ))
    to_encode .update ({"exp":expire })
    return jwt .encode (to_encode ,settings .SECRET_KEY ,algorithm =settings .ALGORITHM )

async def get_current_user (
token :str =Depends (oauth2_scheme ),
db :Session =Depends (get_db ),
)->User :
    """Decode JWT and return the authenticated user."""
    credentials_exception =HTTPException (
    status_code =status .HTTP_401_UNAUTHORIZED ,
    detail ="Invalid authentication credentials",
    headers ={"WWW-Authenticate":"Bearer"},
    )
    try :
        payload =jwt .decode (token ,settings .SECRET_KEY ,algorithms =[settings .ALGORITHM ])
        user_id :str =payload .get ("sub")
        if user_id is None :
            raise credentials_exception 
    except JWTError :
        raise credentials_exception 

    user =db .query (User ).filter (User .id ==user_id ).first ()
    if user is None :
        raise credentials_exception 
    return user 




@router .post ("/register",response_model =TokenResponse ,status_code =status .HTTP_201_CREATED )
async def register (req :RegisterRequest ,db :Session =Depends (get_db )):
    """Register a new user account."""
    existing =db .query (User ).filter (User .email ==req .email ).first ()
    if existing :
        raise HTTPException (status_code =400 ,detail ="Email already registered")

    user =User (
    name =req .name ,
    email =req .email ,
    hashed_password =hash_password (req .password ),
    )
    db .add (user )
    db .flush ()


    profile =Profile (user_id =user .id ,skills =[],experience =[])
    db .add (profile )
    db .commit ()
    db .refresh (user )

    token =create_access_token ({"sub":user .id })
    return TokenResponse (
    access_token =token ,
    user ={"id":user .id ,"name":user .name ,"email":user .email },
    )


@router .post ("/login",response_model =TokenResponse )
async def login (req :LoginRequest ,db :Session =Depends (get_db )):
    """Authenticate and return a JWT token."""
    user =db .query (User ).filter (User .email ==req .email ).first ()
    if not user or not verify_password (req .password ,user .hashed_password ):
        raise HTTPException (status_code =401 ,detail ="Invalid email or password")

    token =create_access_token ({"sub":user .id })
    return TokenResponse (
    access_token =token ,
    user ={"id":user .id ,"name":user .name ,"email":user .email },
    )


@router .get ("/me",response_model =UserResponse )
async def get_me (current_user :User =Depends (get_current_user )):
    """Return the currently authenticated user's info."""
    return UserResponse (
    id =current_user .id ,
    name =current_user .name ,
    email =current_user .email ,
    created_at =current_user .created_at ,
    )
