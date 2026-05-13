from pydantic import BaseModel, EmailStr, Field
from app.modules.users.user_schema import UserRole # Importa UserRole del módulo de usuarios

# Esquema para login
class UserLogin(BaseModel):
    email: EmailStr = Field(..., example="john.doe@example.com")
    password: str = Field(..., example="securepassword123")

# Esquema para token JWT
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    email: str | None = None
    role: UserRole | None = None # El rol también es parte de la data del token