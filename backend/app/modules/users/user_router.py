# app/modules/users/user_router.py
from fastapi import APIRouter, Depends, status, Body
from typing import List, Any
from app.core.exceptions import DuplicateEntryException
from fastapi.exceptions import HTTPException
from app.modules.users import user_schema as schemas
from app.modules.users.user_service import UserService
from app.core.dependencies import (
    get_user_service_dependency,
    get_current_active_user,
    get_current_admin_user
)

router = APIRouter(prefix="/users", tags=["Users"])

@router.post(
    "/",
    response_model=schemas.User,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_current_admin_user)]
)
def create_user_endpoint(
    user_data: schemas.UserCreate,
    user_service: UserService = Depends(get_user_service_dependency)
):
    """
    Creacion interna de usuarios de tipo vendedor.
    """
    return user_service.create_internal_user(user_data)


@router.post(
    "/register",
    response_model=schemas.User, # Devuelve el esquema completo del usuario creado
    status_code=status.HTTP_201_CREATED,
    summary="Registrar un nuevo usuario como 'cliente'"
)
def register_client_account(
    user_data: schemas.UserCreate, # El frontend envía email, full_name, cedula, password (sin 'role')
    user_service: UserService = Depends(get_user_service_dependency) # Inyectamos el UserService
):
    """
    Registra un nuevo usuario en el sistema con el rol predeterminado de 'client'.
    No requiere autenticación.
    """
    try:
        # El router pasa los datos al UserService, que es quien tiene la lógica de registro.
        new_user = user_service.register_client(user_data)
        return new_user
    except ValueError as e: # Captura el ValueError si el rol no es 'client'
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except DuplicateEntryException: # Captura la excepción específica para duplicados
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, # 409 Conflict es apropiado
            detail="Un usuario con este email ya existe."
        )
    except Exception as e:
        # Otros errores inesperados
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno al registrar usuario: {e}"
        )



@router.get(
    "/",
    response_model=List[schemas.User],
    dependencies=[Depends(get_current_admin_user)]
)
def read_users_endpoint(
    skip: int = 0,
    limit: int = 100,
    user_service: UserService = Depends(get_user_service_dependency)
):
    """
    Obtiene una lista de usuarios internos.
    **Requiere rol: Administrador**
    """
    return user_service.get_internal_users(skip=skip, limit=limit)

@router.get(
    "/{user_id}",
    response_model=schemas.User,
    dependencies=[Depends(get_current_active_user)]
)
def read_user_endpoint(
    user_id: int,
    user_service: UserService = Depends(get_user_service_dependency),
):
    """
    Obtiene un usuario específico por su ID.
    **Requiere rol: Cualquier usuario activo**
    """
    return user_service.get_user(user_id)

@router.put(
    "/{user_id}",
    response_model=schemas.User,
    dependencies=[Depends(get_current_admin_user)]
)
def update_user_endpoint(
    user_id: int,
    user_data: schemas.UserUpdate,
    user_service: UserService = Depends(get_user_service_dependency)
):
    """
    Actualiza los datos de un usuario interno.
    **Requiere rol: Administrador**
    """
    return user_service.update_internal_user(user_id, user_data)

@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(get_current_admin_user)]
)
def delete_user_endpoint(
    user_id: int,
    user_service: UserService = Depends(get_user_service_dependency)
):
    """
    Elimina un usuario del sistema.
    **Requiere rol: Administrador**
    """
    user_service.delete_internal_user(user_id)
    return

# Nuevo endpoint para que el usuario autenticado actualice SU propio perfil
@router.put(
    "/me/",
    response_model=schemas.User,
    summary="Actualizar perfil propio (sin token: requiere user_id en body)"
)
def update_my_profile(
    user_id: int = Body(..., embed=True),
    user_data: schemas.UserUpdate = Body(...),
    user_service: UserService = Depends(get_user_service_dependency),
):
    """
    Actualiza el perfil del usuario indicado por user_id.
    NOTA: este endpoint no requiere token (petición debe incluir user_id).
    El servicio se encargará de no permitir cambios de rol.
    """
    if not user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Se requiere 'user_id' en el body.")
    try:
        if hasattr(user_service, "update_own_profile"):
            updated = user_service.update_own_profile(user_id, user_data)
        else:
            updated = user_service.update_user(user_id, user_data)
        return updated
    except DuplicateEntryException:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Un usuario con ese correo ya existe.")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error interno al actualizar perfil: {str(e)}")

