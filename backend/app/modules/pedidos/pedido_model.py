from sqlalchemy import Column, Integer, ForeignKey, Date, String, Float
from sqlalchemy.orm import relationship
from app.database import Base

class Pedido(Base):
    __tablename__ = "pedidos"

    id = Column(Integer, primary_key=True, index=True)
    proveedor_id = Column(Integer, ForeignKey("proveedor.id"), nullable=False)
    fecha = Column(Date, nullable=False)
    estado = Column(String, default="pendiente")

    proveedor = relationship("Proveedor", back_populates="pedidos")
    detalles = relationship("DetallePedido", back_populates="pedido", cascade="all, delete-orphan")


class DetallePedido(Base):
    __tablename__ = "detalle_pedido"

    id = Column(Integer, primary_key=True, index=True)
    pedido_id = Column(Integer, ForeignKey("pedidos.id"), nullable=False)
    variante_id = Column(Integer, ForeignKey("variantes_producto.id"), nullable=False)
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(Float, nullable=False)

    pedido = relationship("Pedido", back_populates="detalles")
    variante = relationship("VarianteProducto")  # relación opcional si quieres consultar detalles
