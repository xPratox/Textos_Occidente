from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.modules.ventas import ventas_schema as schemas
from app.modules.ventas.ventas_service import SaleService
from app.core.dependencies import get_db # Asegúrate de que esta ruta sea correcta
from app.core.exceptions import NotFoundException

router = APIRouter(prefix="/sales", tags=["Sales"])

# Inyección de dependencias para SaleService
def get_sale_service(db: Session = Depends(get_db)) -> SaleService:
    return SaleService(db)

@router.post("/", response_model=schemas.VentaOut, status_code=status.HTTP_201_CREATED)
def create_sale_endpoint(
    sale_data: schemas.VentaCreate,
    sale_service: SaleService = Depends(get_sale_service)
):
    """
    Crea una nueva venta en estado 'pendiente' y disminuye el stock de las variantes.
    """
    try:
        return sale_service.create_sale(sale_data)
    except HTTPException as e:
        raise e # Re-lanza HTTPException para que FastAPI la maneje
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error interno al crear la venta: {str(e)}")


@router.get("/", response_model=List[schemas.VentaOut])
def list_sales_endpoint(
    sale_service: SaleService = Depends(get_sale_service)
):
    """
    Lista todas las ventas registradas.
    """
    return sale_service.get_all_sales()

@router.get("/{sale_code}", response_model=schemas.VentaOut)
def get_sale_by_code_endpoint(
    sale_code: str,
    sale_service: SaleService = Depends(get_sale_service)
):
    """
    Obtiene los detalles de una venta específica usando su código único.
    """
    try:
        return sale_service.get_sale_by_code(sale_code)
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/{sale_code}/status", response_model=schemas.VentaOut)
def update_sale_status_endpoint(
    sale_code: str,
    status_update: schemas.VentaUpdateEstado,
    sale_service: SaleService = Depends(get_sale_service)
):
    """
    Actualiza el estado de una venta (ej. de 'pendiente' a 'confirmada' o 'cancelada').
    """
    try:
        return sale_service.update_sale_status(sale_code, status_update)
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except HTTPException as e: # Captura si hay validaciones de estado en el servicio
        raise e

@router.delete("/{sale_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sale_endpoint(
    sale_id: int,
    sale_service: SaleService = Depends(get_sale_service)
):
    """
    Elimina una venta por su ID.
    Considera la lógica de reposición de stock si una venta 'confirmada' es eliminada.
    """
    try:
        sale_service.delete_sale(sale_id)
        return None
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/by-cedula/{cedula}", response_model=List[schemas.VentaOut])
def get_sales_by_cedula_endpoint(
    cedula: str,
    sale_service: SaleService = Depends(get_sale_service)
):
    """
    Obtiene todas las ventas asociadas a una cédula de cliente específica.
    """
    try:
        return sale_service.get_sales_by_cedula(cedula)
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))