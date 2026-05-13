from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError
from app.database import get_db
from app.modules.users.user_service import UserService
from app.modules.auth.auth_service import AuthService
from app.modules.auth import auth_schema as auth_schemas
from app.modules.users import user_model as user_models
from app.modules.users.user_schema import UserRole # Para los roles del usuario
from app.modules.auth.security import decode_access_token

# Esquema de seguridad para OAuth2 con flujo de contraseña (para swagger UI)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

# --- Dependencia para obtener el UserService ---
def get_user_service_dependency(db: Session = Depends(get_db)) -> UserService:
    """
    Dependencia que proporciona una instancia del servicio de usuarios,
    inyectando la sesión de base de datos.
    """
    return UserService(db)

# --- Dependencia para obtener el AuthService ---
def get_auth_service_dependency(
    user_service: UserService = Depends(get_user_service_dependency)
) -> AuthService:
    """
    Dependencia que proporciona una instancia del servicio de autenticación,
    inyectando el UserService necesario.
    """
    return AuthService(user_service)

# --- Dependencias para obtener el usuario actual y validar roles ---
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    user_service: UserService = Depends(get_user_service_dependency)
) -> user_models.User:
    """
    Dependencia que verifica un token JWT y retorna el usuario asociado.
    """
    try:
        payload = decode_access_token(token)
        print(f"🔍 PAYLOAD RECIBIDO: {payload}")  # ⬅️ Muy importante
        email: str = payload.get("sub")
        role: UserRole = payload.get("role")

        if email is None or role is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials - malformed token data",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        token_data = auth_schemas.TokenData(email=email, role=role)

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials - token invalid",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Asegurarse de que el usuario aún existe y está activo en la DB
    user = user_service.get_user_by_email(token_data.email)
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

def get_current_active_user(current_user: user_models.User = Depends(get_current_user)) -> user_models.User:
    """
    Retorna el usuario actual, asegurándose de que esté activo.
    """
    return current_user

def get_current_admin_user(current_user: user_models.User = Depends(get_current_user)) -> user_models.User:
    """
    Retorna el usuario actual si tiene el rol de ADMINISTRADOR.
    """
    if current_user.role != UserRole.ADMIN.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions (Admin required)")
    return current_user

def get_current_manager_or_admin_user(current_user: user_models.User = Depends(get_current_user)) -> user_models.User:
    """
    Retorna el usuario actual si tiene el rol de GERENTE o ADMINISTRADOR.
    """
    if current_user.role not in [UserRole.MANAGER.value, UserRole.ADMIN.value]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions (Manager or Admin required)")
    return current_user