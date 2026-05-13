# app/modules/pedidos/pedido_router.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
# Importa la clase del servicio, asumiendo que ahora es una clase como en tus otros módulos
from app.modules.pedidos.pedido_service import PedidoService
from app.modules.pedidos import pedido_schema as schemas

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])

# Dependencia para obtener la instancia del servicio
# Este patrón es consistente con el que ya tienes en otros módulos.
def get_pedido_service(db: Session = Depends(get_db)) -> PedidoService:
    return PedidoService(db)

@router.post("/", response_model=schemas.PedidoResponse)
def crear_pedido(
    pedido: schemas.PedidoCreate,
    pedido_service: PedidoService = Depends(get_pedido_service) # Inyecta el servicio
):
    return pedido_service.crear_pedido(pedido)

@router.get("/", response_model=List[schemas.PedidoResponse])
def listar_pedidos(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=200),
    pedido_service: PedidoService = Depends(get_pedido_service) # Inyecta el servicio
):
    """
    Lista todos los pedidos con sus detalles y relaciones anidadas.
    """
    pedidos = pedido_service.obtener_pedidos(skip=skip, limit=limit)
    return pedidos

@router.get("/{pedido_id}", response_model=schemas.PedidoResponse)
def obtener_pedido(
    pedido_id: int,
    pedido_service: PedidoService = Depends(get_pedido_service) # Inyecta el servicio
):
    # CRÍTICO: Delega completamente al servicio para obtener el pedido con sus relaciones
    return pedido_service.obtener_pedido(pedido_id)


@router.put("/{pedido_id}", response_model=schemas.PedidoResponse)
def actualizar_pedido(
    pedido_id: int,
    pedido: schemas.PedidoCreate,
    pedido_service: PedidoService = Depends(get_pedido_service) # Inyecta el servicio
):
    return pedido_service.actualizar_pedido(pedido_id, pedido)

@router.patch("/{pedido_id}/estado", response_model=schemas.PedidoResponse)
def cambiar_estado_pedido(
    pedido_id: int,
    estado: schemas.ActualizarEstado,
    pedido_service: PedidoService = Depends(get_pedido_service) # Inyecta el servicio
):
    # Accede a .estado del modelo Pydantic
    return pedido_service.cambiar_estado_pedido(pedido_id, estado.estado)

@router.delete("/{pedido_id}")
def eliminar_pedido(
    pedido_id: int,
    pedido_service: PedidoService = Depends(get_pedido_service) # Inyecta el servicio
):
    pedido_service.eliminar_pedido(pedido_id)
    return {"msg": "Pedido eliminado correctamente"}