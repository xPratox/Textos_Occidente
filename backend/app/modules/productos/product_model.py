from sqlalchemy import Column, String, Integer, ForeignKey, Numeric, Table
from sqlalchemy.orm import relationship
from app.database import Base
import sqlalchemy as sa
from app.modules.categorias.categoria_model import Categoria
from app.modules.proveedores.proveedor_model import Proveedor

# Tabla de asociación many-to-many para productos y categorías
producto_categoria = Table(
    'producto_categoria',
    Base.metadata,
    Column('producto_id', Integer, ForeignKey('productos.id'), primary_key=True),
    Column('categoria_id', Integer, ForeignKey('categorias.id'), primary_key=True)
)

class Producto(Base):
    __tablename__ = "productos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    descripcion = Column(String, nullable=False)
    precio = Column(Numeric(10, 2), nullable=False)
    proveedor_id = Column(Integer, ForeignKey("proveedor.id"), nullable=False)
    image_url = sa.Column(sa.String, nullable=True)
    
    # Relación many-to-many con categorías
    categorias = relationship("Categoria", secondary=producto_categoria, back_populates="productos")
    proveedor = relationship("Proveedor", back_populates="productos")
    variantes = relationship("VarianteProducto", back_populates="producto", cascade="all, delete") # Nota: cascade="all, delete-orphan" es común si quieres eliminar variantes al borrar un producto. Si solo "delete" está bien para ti, déjalo.


class VarianteProducto(Base):
    __tablename__ = "variantes_producto"

    id = Column(Integer, primary_key=True, index=True)
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=False)
    color = Column(String, nullable=False)
    talla = Column(String, nullable=False)
    stock = Column(Integer, default=0)

    producto = relationship("Producto", back_populates="variantes")
    # ¡¡¡ESTA ES LA LÍNEA QUE FALTABA O ESTABA MAL!!!
    # Aquí definimos la relación inversa para que SQLAlchemy sepa que "variante" en DetalleVenta
    # se refiere a este lado de la relación.
    detalles_venta = relationship("DetalleVenta", back_populates="variante")

