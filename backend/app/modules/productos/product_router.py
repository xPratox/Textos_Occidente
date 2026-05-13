# app/modules/products/product_router.py

from fastapi import APIRouter, Depends, status, File, UploadFile, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.modules.productos import product_schema as schemas
from app.modules.productos.product_service import ProductService # Asegúrate de que esto apunta al archivo correcto
from app.core.dependencies import get_db # Asegúrate de que get_db está bien definido aquí

router = APIRouter(prefix="/products", tags=["Products"])

# Inyección de dependencias para el servicio
def get_product_service(db: Session = Depends(get_db)) -> ProductService:
    return ProductService(db)

@router.post("/", response_model=schemas.ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product_endpoint(
    product_data: schemas.ProductCreate,
    product_service: ProductService = Depends(get_product_service)
):
    return product_service.create_product(product_data)

@router.get("/", response_model=List[schemas.ProductResponse])
def list_products_endpoint(
    categoria_ids: Optional[List[int]] = Query(None, description="Lista de IDs de categorías para filtrar"),
    product_service: ProductService = Depends(get_product_service)
):
    if categoria_ids:
        return product_service.get_products_by_categories(categoria_ids)
    return product_service.get_all_products()

@router.get("/{product_id}", response_model=schemas.ProductResponse)
def get_product_by_id_endpoint(
    product_id: int,
    product_service: ProductService = Depends(get_product_service)
):
    # El servicio ya lanza NotFoundException si no lo encuentra
    return product_service.get_product_by_id(product_id)

@router.put("/{product_id}", response_model=schemas.ProductResponse)
def update_product_endpoint(
    product_id: int,
    updated_data: schemas.ProductUpdate,
    product_service: ProductService = Depends(get_product_service)
):
    return product_service.update_product(product_id, updated_data)

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product_endpoint(
    product_id: int,
    product_service: ProductService = Depends(get_product_service)
):
    product_service.delete_product(product_id)
    return None # FastAPI maneja 204 No Content con None o sin retorno

# ----------------- ENDPOINT PARA SUBIR IMAGEN -----------------
@router.post("/{product_id}/upload-image", response_model=schemas.ProductResponse)
async def upload_product_image_endpoint(
    product_id: int,
    file: UploadFile = File(...), # <-- ¡CLAVE! 'file' debe ser el nombre del campo en el FormData del frontend
    product_service: ProductService = Depends(get_product_service)
):
    """
    Sube una imagen para un producto específico y asocia su URL en la base de datos.
    """
    return await product_service.upload_image_to_product(product_id, file)

# ----------------- ENDPOINTS DE VARIANTES -----------------

@router.post("/{product_id}/variants", response_model=schemas.VarianteProductoResponse, status_code=status.HTTP_201_CREATED)
def create_variant_endpoint(
    product_id: int,
    variant_data: schemas.VarianteProductoCreate,
    product_service: ProductService = Depends(get_product_service)
):
    return product_service.create_variant(product_id, variant_data)

@router.get("/{product_id}/variants", response_model=List[schemas.VarianteProductoResponse])
def list_variants_by_product_endpoint(
    product_id: int,
    product_service: ProductService = Depends(get_product_service)
):
    return product_service.get_variants_by_product(product_id)

@router.get("/variants/{variant_id}", response_model=schemas.VarianteProductoResponse)
def get_variant_by_id_endpoint(
    variant_id: int,
    product_service: ProductService = Depends(get_product_service)
):
    return product_service.get_variant_by_id(variant_id)

@router.put("/variants/{variant_id}", response_model=schemas.VarianteProductoResponse)
def update_variant_endpoint(
    variant_id: int,
    updated_data: schemas.VarianteProductoCreate,
    product_service: ProductService = Depends(get_product_service)
):
    return product_service.update_variant(variant_id, updated_data)

@router.delete("/variants/{variant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_variant_endpoint(
    variant_id: int,
    product_service: ProductService = Depends(get_product_service)
):
    product_service.delete_variant(variant_id)
    return None