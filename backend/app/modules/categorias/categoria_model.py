# app/modules/categorias/category_model.py
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base

class Categoria(Base):
    __tablename__ = "categorias"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)

    # Relación many-to-many con productos
    productos = relationship("Producto", secondary="producto_categoria", back_populates="categorias")
