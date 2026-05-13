# app/modules/pedidos/pedido_schema.py
from datetime import date
from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class EstadoPedido(str, Enum):
    pendiente = "pendiente"
    confirmado = "confirmado"
    cancelado = "cancelado"

class DetallePedidoCreate(BaseModel):
    variante_id: int
    cantidad: int
    precio_unitario: float

    class Config:
        from_attributes = True

class PedidoCreate(BaseModel):
    proveedor_id: int
    fecha: date
    estado: EstadoPedido = EstadoPedido.pendiente  # si lo deseas por defecto
    detalles: List[DetallePedidoCreate]

class PedidoResponse(PedidoCreate):
    id: int
    estado: EstadoPedido

    class Config:
        from_attributes = True

class ActualizarEstado(BaseModel):
    estado: EstadoPedido