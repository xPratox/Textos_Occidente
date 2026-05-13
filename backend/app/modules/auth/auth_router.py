# app/modules/auth/auth_router.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.modules.auth.auth_service import AuthService
from app.core.dependencies import (
    get_auth_service_dependency,
    get_current_active_user,
    get_current_admin_user,
    get_current_manager_or_admin_user
)
from app.modules.auth import auth_schema as schemas
from app.modules.users import user_schema as user_schemas

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/token", response_model=schemas.Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    auth_service: AuthService = Depends(get_auth_service_dependency)
):
    """
    Endpoint para que los usuarios inicien sesión y obtengan un token JWT.
    """
    authenticated_user_data = auth_service.authenticate_user(form_data.username, form_data.password)
    print("👉 authenticated_user_data:", authenticated_user_data)
    
    token = auth_service.create_auth_token(
        email=authenticated_user_data["email"],
        role=user_schemas.UserRole(authenticated_user_data["role"]),
        cedula=authenticated_user_data["cedula"]
    )
    return token

@router.get("/me", response_model=user_schemas.User)
async def read_users_me(
    current_user: user_schemas.User = Depends(get_current_active_user)
):
    """
    Obtiene los datos del usuario actualmente autenticado.
    """
    return current_user

@router.get("/admin-only", status_code=status.HTTP_200_OK)
async def admin_only_test(
    current_admin_user: user_schemas.User = Depends(get_current_admin_user)
):
    """
    Endpoint de prueba accesible solo para usuarios con rol 'admin'.
    """
    return {"message": f"Welcome, Admin {current_admin_user.full_name}! You have access."}

@router.get("/manager-or-admin-only", status_code=status.HTTP_200_OK)
async def manager_or_admin_only_test(
    current_user: user_schemas.User = Depends(get_current_manager_or_admin_user)
):
    """
    Endpoint de prueba accesible solo para usuarios con rol 'manager' o 'admin'.
    """
    return {"message": f"Welcome, {current_user.role.capitalize()} {current_user.full_name}! You have access."}