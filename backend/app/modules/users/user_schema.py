# app/modules/users/user_schema.py
from pydantic import BaseModel, EmailStr, Field
from enum import Enum
from typing import Optional
from pydantic import ConfigDict

class UserRole(str, Enum):
    CLIENT = "client"
    MANAGER = "manager"
    ADMIN = "admin"

class UserBase(BaseModel):
    email: EmailStr = Field(..., example="john.doe@example.com")
    full_name: str | None = Field(None, example="John Doe")
    cedula: str = Field(..., example="1234567890")

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, example="securepassword123")
    # ¡ASEGÚRATE DE QUE ESTA LÍNEA ESTÉ PRESENTE Y CORRECTA!
    role: UserRole = Field(UserRole.CLIENT, example=UserRole.CLIENT)

class UserUpdate(UserBase):
    email: EmailStr | None = None
    full_name: str | None = None
    password: str | None = None
    is_active: bool | None = None
    role: UserRole | None = Field(None, example=UserRole.MANAGER)

class UserInDBBase(UserBase):
    id: int
    is_active: bool
    # ¡ASEGÚRATE DE QUE ESTA LÍNEA ESTÉ PRESENTE Y CORRECTA!
    role: UserRole # Aquí se espera el enum UserRole

    class Config:
        from_attributes = True

class User(UserInDBBase):
    pass

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, arbitrary_types_allowed=True)

    id: int
    email: str

    cedula: str
    full_name: Optional[str] = None 

