# app/modules/categorias/categoria_service.py
from sqlalchemy.orm import Session
from app.modules.categorias import categoria_model as models, categoria_schema as schemas
from app.core.exceptions import NotFoundException, DuplicateEntryException

class CategoriaService:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(models.Categoria).all()

    def get_by_id(self, categoria_id: int):
        categoria = self.db.query(models.Categoria).filter(models.Categoria.id == categoria_id).first()
        if not categoria:
            raise NotFoundException("Categoria not found")
        return categoria

    def create(self, data: schemas.CategoriaCreate):
        exists = self.db.query(models.Categoria).filter(models.Categoria.name == data.name).first()
        if exists:
            raise DuplicateEntryException("Categoria name already exists")

        categoria = models.Categoria(**data.dict())
        self.db.add(categoria)
        self.db.commit()
        self.db.refresh(categoria)
        return categoria

    def update(self, categoria_id: int, data: schemas.CategoriaUpdate):
        categoria = self.get_by_id(categoria_id)
        for key, value in data.dict(exclude_unset=True).items():
            setattr(categoria, key, value)
        self.db.commit()
        self.db.refresh(categoria)
        return categoria

    def delete(self, categoria_id: int):
        categoria = self.get_by_id(categoria_id)
        self.db.delete(categoria)
        self.db.commit()
