from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional

# Importaciones de otros módulos
from app.modules.proveedores.proveedor_schema import ProveedorResponse
from app.modules.categorias.categoria_schema import CategoriaResponse


# ----------- Esquema de Producto 'simple' para evitar recursión --------------
# Este esquema de Producto NO incluirá la lista de variantes para evitar el ciclo.
class ProductSimpleResponse(BaseModel):
    id: int
    nombre: str
    descripcion: str
    precio: float
    proveedor_id: int 

    categorias: Optional[List[CategoriaResponse]] = None
    proveedor: Optional[ProveedorResponse] = None

    model_config = ConfigDict(
        from_attributes=True,
        arbitrary_types_allowed=True
    )

# ----------- VarianteProducto --------------
class VarianteProductoBase(BaseModel):
    color: str
    talla: str
    stock: int = 0


class VarianteProductoCreate(VarianteProductoBase):
    pass


class VarianteProductoResponse(VarianteProductoBase):
    id: int
    # Aquí es donde usamos el esquema 'simple' para el producto asociado
    producto: Optional[ProductSimpleResponse] = None # ¡¡¡CAMBIO CLAVE AQUÍ!!!

    model_config = ConfigDict(
        from_attributes=True,
        arbitrary_types_allowed=True
    )


# ----------- Producto (esquema completo) ----------------------
class ProductBase(BaseModel):
    nombre: str
    descripcion: str
    precio: float
    image_url: Optional[str] = None

class ProductCreate(ProductBase):
    categoria_ids: List[int] = Field(..., min_items=1, description="Lista de IDs de categorías")
    proveedor_id: int
    variantes: List[VarianteProductoCreate]


class ProductUpdate(ProductBase):
    categoria_ids: Optional[List[int]] = Field(None, min_items=1, description="Lista de IDs de categorías")
    proveedor_id: Optional[int] = None


class ProductResponse(ProductBase):
    id: int
    categorias: List[CategoriaResponse]
    variantes: List[VarianteProductoResponse] # Aquí sí queremos todas las variantes
    proveedor: Optional[ProveedorResponse] = None
    image_url: Optional[str] = None

    model_config = ConfigDict(
        from_attributes=True,
        arbitrary_types_allowed=True
    )

# Ya no necesitamos model_rebuild() si se rompe el ciclo con ProductSimpleResponse,
# pero no hace daño dejarlo si hay otras referencias complejas.
# Si lo quitas y hay un error de forward reference, vuelve a ponerlo.
# VarianteProductoResponse.model_rebuild()