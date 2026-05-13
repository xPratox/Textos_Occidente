from fastapi import HTTPException, status
from app.modules.users.user_service import UserService
from app.modules.auth import auth_schema as schemas
from app.modules.auth.security import verify_password, create_access_token
from app.core.exceptions import UnauthorizedException
from datetime import timedelta
from app.config import settings


class AuthService:
    def __init__(self, user_service: UserService): # Sigue recibiendo el UserService
        self.user_service = user_service

    def authenticate_user(self, email: str, password: str) -> dict:
        user = self.user_service.get_user_by_email(email)
        if not user:
            raise UnauthorizedException(detail="Incorrect email or password")
        
        if not verify_password(password, user.hashed_password):
            raise UnauthorizedException(detail="Incorrect email or password")
        
        if not user.is_active:
            raise UnauthorizedException(detail="Inactive user")
        
        return {"email": user.email, "full_name": user.full_name, "role": user.role, "cedula": user.cedula}

    def create_auth_token(self, email: str, role: schemas.UserRole, cedula: str) -> schemas.Token:
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        access_token_data = {
            "sub": email,
            "role": role.value,
            "cedula": cedula
        }
        access_token = create_access_token(
            access_token_data, expires_delta=access_token_expires
        )
        return schemas.Token(access_token=access_token)