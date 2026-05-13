from pydantic import BaseModel, EmailStr
from typing import Optional, List


# Base: Atributos comunes
class ProveedorBase(BaseModel):
    nombre: str
    telefono: Optional[str] = None
    correo: Optional[EmailStr] = None


# Para crear un proveedor
class ProveedorCreate(ProveedorBase):
    pass


# Para actualizar un proveedor
class ProveedorUpdate(ProveedorBase):
    pass


# Para mostrar un proveedor en respuestas
class ProveedorResponse(ProveedorBase):
    id: int

    model_config = {
        "from_attributes": True
    }
