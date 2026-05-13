from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base
from app.modules.pedidos.pedido_model import Pedido

class Proveedor(Base):
    __tablename__ = "proveedor"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    telefono = Column(String(20))
    correo = Column(String(100))
    pedidos = relationship("Pedido", back_populates="proveedor")
    productos = relationship("Producto", back_populates="proveedor")
