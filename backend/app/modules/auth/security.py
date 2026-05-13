from datetime import datetime, timedelta, timezone
from typing import Any
from jose import jwt, JWTError
from passlib.context import CryptContext

from app.config import settings
from app.modules.users.user_schema import UserRole # Necesitamos UserRole para los claims del JWT

# Configuración para el hashing de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- Funciones de Hashing de Contraseñas ---
def get_password_hash(password: str) -> str:
    """Hashea una contraseña."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica una contraseña hasheada."""
    return pwd_context.verify(plain_password, hashed_password)

# --- Funciones de JWT ---
def create_access_token(
    data: dict[str, Any], expires_delta: timedelta | None = None
) -> str:
    """
    Crea un token de acceso JWT.
    Los datos incluirán al menos 'sub' (subject, ej. email) y 'role'.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> dict[str, Any]:
    """
    Decodifica y valida un token JWT.
    Retorna los claims del token si es válido, si no, levanta JWTError.
    """

    print(f"DEBUG: Token recibido por decode_access_token: '{token}' AAAAAAAAAAAAAAAAAAA") # <--- AÑADE ESTA LÍNEA CLAVE
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        # Aseguramos que 'sub' (email) y 'role' estén presentes y sean válidos
        email: str = payload.get("sub")
        role_str: str = payload.get("role")

        if email is None or role_str is None:
            raise JWTError("Invalid token payload: missing email or role")
        
        # Validar que el rol sea uno de los roles definidos
        try:
            role = UserRole(role_str)
        except ValueError:
            raise JWTError("Invalid token payload: invalid role value")

        return {"sub": email, "role": role.value}
    except JWTError as e:
        print(f"DEBUG: JWTError atrapado al decodificar: {e}") # <--- (Opcional)
        raise e # Re-lanzar la excepción para que sea manejada por el que llama