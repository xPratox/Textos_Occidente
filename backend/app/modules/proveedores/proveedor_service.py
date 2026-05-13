from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.modules.proveedores import proveedor_model as models, proveedor_schema as schemas


class ProveedorService:
    def __init__(self, db: Session):
        self.db = db

    def crear_proveedor(self, proveedor_data: schemas.ProveedorCreate):
        proveedor = models.Proveedor(**proveedor_data.dict())
        self.db.add(proveedor)
        self.db.commit()
        self.db.refresh(proveedor)
        return proveedor

    def listar_proveedores(self):
        return self.db.query(models.Proveedor).all()

    def obtener_proveedor_por_id(self, proveedor_id: int):
        proveedor = self.db.query(models.Proveedor).filter_by(id=proveedor_id).first()
        if not proveedor:
            raise HTTPException(status_code=404, detail="Proveedor no encontrado")
        return proveedor

    def actualizar_proveedor(self, proveedor_id: int, proveedor_data: schemas.ProveedorUpdate):
        proveedor = self.obtener_proveedor_por_id(proveedor_id)
        for campo, valor in proveedor_data.dict(exclude_unset=True).items():
            setattr(proveedor, campo, valor)
        self.db.commit()
        self.db.refresh(proveedor)
        return proveedor

    def eliminar_proveedor(self, proveedor_id: int):
        proveedor = self.obtener_proveedor_por_id(proveedor_id)
        self.db.delete(proveedor)
        self.db.commit()
