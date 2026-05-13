# app/modules/ventas/ventas_model.py

from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base # ¡Asegúrate de que esta importación sea correcta!
import enum
from app.modules.productos.product_model import VarianteProducto


class EstadoVenta(str, enum.Enum):
    pendiente = "pendiente"
    confirmada = "confirmada"
    cancelada = "cancelada"

class Venta(Base):
    __tablename__ = "ventas"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    total = Column(Float, nullable=False)
    estado = Column(Enum(EstadoVenta), default=EstadoVenta.pendiente)
    codigo = Column(String, unique=True, index=True, nullable=False)
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())

    detalles = relationship("DetalleVenta", back_populates="venta", cascade="all, delete-orphan")
    cliente = relationship("User", back_populates="ventas")

class DetalleVenta(Base):
    __tablename__ = "detalle_venta" # Cambiado a 'detalle_venta' para coincidir con el nombre del modelo.

    id = Column(Integer, primary_key=True, index=True)
    venta_id = Column(Integer, ForeignKey("ventas.id", ondelete="CASCADE"), nullable=False)
    variante_id = Column(Integer, ForeignKey("variantes_producto.id", ondelete="RESTRICT"), nullable=False)
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(Float, nullable=False) # Asegúrate que 'Float' está importado al principio

    venta = relationship("Venta", back_populates="detalles")
    variante = relationship("VarianteProducto", back_populates="detalles_venta")