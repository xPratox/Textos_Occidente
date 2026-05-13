# app/modules/users/user_model.py
from sqlalchemy import Column, Integer, String, Boolean
from app.database import Base
from sqlalchemy.orm import relationship
from app.modules.ventas.ventas_model import Venta  # Asegúrate de que esta importación sea correcta

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    cedula = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)

    role = Column(String, default="client", nullable=False)
    ventas = relationship("Venta", back_populates="cliente")