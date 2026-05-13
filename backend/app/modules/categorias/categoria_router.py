
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db
from app.modules.categorias.categoria_service import CategoriaService
from app.modules.categorias import categoria_schema as schemas

router = APIRouter(prefix="/categorias", tags=["Categorias"])

@router.get("/", response_model=list[schemas.CategoriaResponse])
def list_categories(db: Session = Depends(get_db)):
    return CategoriaService(db).get_all()

@router.post("/", response_model=schemas.CategoriaResponse, status_code=status.HTTP_201_CREATED)
def create_categoria(data: schemas.CategoriaCreate, db: Session = Depends(get_db)):
    return CategoriaService(db).create(data)

@router.get("/{categoria_id}", response_model=schemas.CategoriaResponse)
def get_categoria(categoria_id: int, db: Session = Depends(get_db)):
    return CategoriaService(db).get_by_id(categoria_id)

@router.put("/{categoria_id}", response_model=schemas.CategoriaResponse)
def update_categoria(categoria_id: int, data: schemas.CategoriaUpdate, db: Session = Depends(get_db)):
    return CategoriaService(db).update(categoria_id, data)

@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_categoria(categoria_id: int, db: Session = Depends(get_db)):
    CategoriaService(db).delete(categoria_id)
    return None
