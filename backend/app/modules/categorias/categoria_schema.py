# app/modules/categorias/categoria_schema.py
from pydantic import BaseModel, Field, ConfigDict

class CategoriaBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)

class CategoriaCreate(CategoriaBase):
    pass

class CategoriaUpdate(BaseModel):
    name: str | None = None


class CategoriaResponse(CategoriaBase):
    id: int
    name: str # <--- Debe tener el campo 'name'
    model_config = ConfigDict(
        from_attributes=True
    )
