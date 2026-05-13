from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict # <-- ConfigDict de pydantic
from enum import Enum
from datetime import datetime
from app.modules.users.user_schema import UserOut
from app.modules.productos.product_schema import VarianteProductoResponse # Asegúrate de importar esto

class EstadoVenta(str, Enum):
    pendiente = "pendiente"
    confirmada = "confirmada"
    cancelada = "cancelada"

class DetalleVentaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, arbitrary_types_allowed=True)

    id: int
    cantidad: int
    precio_unitario: float
    variante: Optional[VarianteProductoResponse] = None

class DetalleVentaCreate(BaseModel):
    variante_id: int
    cantidad: int
    precio_unitario: float = Field(..., gt=0, description="Precio unitario de la variante/producto en el momento de la venta")

class VentaCreate(BaseModel):
    cedula_cliente: str = Field(..., min_length=1, description="Cédula del cliente")
    estado: EstadoVenta = EstadoVenta.pendiente
    detalles: List[DetalleVentaCreate]

class VentaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, arbitrary_types_allowed=True)

    id: int
    cliente: Optional[UserOut] = None # Esto mapeará al objeto User con cédula
    total: float
    estado: EstadoVenta
    codigo: str
    fecha_creacion: datetime
    detalles: List[DetalleVentaOut]

class VentaUpdateEstado(BaseModel):
    estado: EstadoVenta