from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.modules.proveedores.proveedor_service import ProveedorService
from app.modules.proveedores import proveedor_schema as schemas
from app.core.dependencies import get_db

router = APIRouter(prefix="/proveedores", tags=["Proveedores"])

# Dependencia
def get_proveedor_service(db: Session = Depends(get_db)) -> ProveedorService:
    return ProveedorService(db)


@router.post("/", response_model=schemas.ProveedorResponse, status_code=status.HTTP_201_CREATED)
def crear_proveedor(proveedor_data: schemas.ProveedorCreate, service: ProveedorService = Depends(get_proveedor_service)):
    return service.crear_proveedor(proveedor_data)


@router.get("/", response_model=List[schemas.ProveedorResponse])
def listar_proveedores(service: ProveedorService = Depends(get_proveedor_service)):
    return service.listar_proveedores()


@router.get("/{proveedor_id}", response_model=schemas.ProveedorResponse)
def obtener_proveedor(proveedor_id: int, service: ProveedorService = Depends(get_proveedor_service)):
    return service.obtener_proveedor_por_id(proveedor_id)


@router.put("/{proveedor_id}", response_model=schemas.ProveedorResponse)
def actualizar_proveedor(proveedor_id: int, proveedor_data: schemas.ProveedorUpdate, service: ProveedorService = Depends(get_proveedor_service)):
    return service.actualizar_proveedor(proveedor_id, proveedor_data)


@router.delete("/{proveedor_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_proveedor(proveedor_id: int, service: ProveedorService = Depends(get_proveedor_service)):
    service.eliminar_proveedor(proveedor_id)
    return None
