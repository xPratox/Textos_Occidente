# app/modules/products/product_service.py

from sqlalchemy.orm import Session, joinedload
from app.modules.productos import product_model as models
from app.modules.productos import product_schema as schemas
from app.modules.categorias import categoria_model as categoria_models
from app.modules.proveedores import proveedor_model as proveedor_models
from app.core.exceptions import NotFoundException, DuplicateEntryException # Revisa si estas se usan o si HTTPException es suficiente
from fastapi import UploadFile, HTTPException # HTTPException ya está importado
from pathlib import Path
from typing import Optional, List
import uuid
import logging # ¡Importante para ver qué está pasando!

# Configuración básica del logger
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- RUTA DE SUBIDA DE ARCHIVOS ---
# Esta ruta DEBE ser absoluta y apuntar al directorio 'static/images'
# asumiendo que este archivo está en 'backend/app/modules/productos'
# y 'static' está en 'backend/app'
UPLOAD_DIRECTORY = Path(__file__).resolve().parent.parent.parent / "static" / "images"

# Asegurarse de que el directorio existe al iniciar el servicio
try:
    UPLOAD_DIRECTORY.mkdir(parents=True, exist_ok=True)
    logger.info(f"Directorio de subida asegurado: {UPLOAD_DIRECTORY}")
except Exception as e:
    logger.critical(f"ERROR CRÍTICO: No se pudo crear o asegurar el directorio de subida {UPLOAD_DIRECTORY}: {e}")
    # Considera si aquí debería haber un sys.exit() si es un fallo fatal.

class ProductService:
    def __init__(self, db: Session):
        self.db = db

    # --- Método para obtener producto por ID (con relaciones para respuestas completas) ---
    def get_product_by_id(self, producto_id: int) -> Optional[models.Producto]:
        logger.info(f"Buscando producto con ID: {producto_id}")
        product = self.db.query(models.Producto)\
            .options(
                joinedload(models.Producto.variantes),
                joinedload(models.Producto.categorias),
                joinedload(models.Producto.proveedor)
            )\
            .filter(models.Producto.id == producto_id)\
            .first()
        if not product:
            logger.warning(f"Producto con ID {producto_id} no encontrado.")
            raise HTTPException(status_code=404, detail="Producto no encontrado") # Lanza la excepción aquí
        return product

    def get_all_products(self) -> List[models.Producto]:
        logger.info("Obteniendo todos los productos.")
        return self.db.query(models.Producto)\
            .options(
                joinedload(models.Producto.variantes),
                joinedload(models.Producto.categorias),
                joinedload(models.Producto.proveedor)
            )\
            .all()

    def get_products_by_categories(self, categoria_ids: List[int]) -> List[models.Producto]:
        logger.info(f"Obteniendo productos por categorías: {categoria_ids}")
        return self.db.query(models.Producto)\
            .join(models.Producto.categorias)\
            .filter(categoria_models.Categoria.id.in_(categoria_ids))\
            .options(
                joinedload(models.Producto.variantes),
                joinedload(models.Producto.categorias),
                joinedload(models.Producto.proveedor)
            )\
            .distinct()\
            .all()

    # --- MÉTODO create_product (SOLO UNA VEZ, LA PRIMERA DEFINICIÓN) ---
    def create_product(self, product_data: schemas.ProductCreate) -> models.Producto:
        logger.info(f"Creando nuevo producto: {product_data.nombre}")
        
        # Validaciones de existencia de categorías
        categorias = self.db.query(categoria_models.Categoria).filter(
            categoria_models.Categoria.id.in_(product_data.categoria_ids)
        ).all()
        
        if len(categorias) != len(product_data.categoria_ids):
            missing_ids = set(product_data.categoria_ids) - {cat.id for cat in categorias}
            logger.error(f"Categorías con IDs {missing_ids} no encontradas para crear producto.")
            raise HTTPException(status_code=404, detail=f"Categorías con IDs {missing_ids} no encontradas")
        
        # Validación de existencia de proveedor
        proveedor = self.db.query(proveedor_models.Proveedor).filter_by(id=product_data.proveedor_id).first()
        if not proveedor:
            logger.error(f"Proveedor con ID {product_data.proveedor_id} no encontrado para crear producto.")
            raise HTTPException(status_code=404, detail="Proveedor no encontrado")

        new_product = models.Producto(
            nombre=product_data.nombre,
            descripcion=product_data.descripcion,
            precio=product_data.precio,
            proveedor_id=product_data.proveedor_id,
            image_url=product_data.image_url # Esto debería ser None o vacío al crear inicialmente
        )
        
        # Asociar categorías al producto
        new_product.categorias = categorias
        
        self.db.add(new_product)
        self.db.flush() # Para obtener el ID antes de añadir variantes

        for variant_data in product_data.variantes:
            variant = models.VarianteProducto(
                color=variant_data.color,
                talla=variant_data.talla,
                stock=variant_data.stock,
                producto_id=new_product.id
            )
            self.db.add(variant)

        self.db.commit()
        self.db.refresh(new_product)
        # Refresca las relaciones para que la respuesta contenga todos los datos
        self.db.refresh(new_product, attribute_names=["variantes", "categorias", "proveedor"])
        logger.info(f"Producto '{new_product.nombre}' creado con ID: {new_product.id}")
        return new_product

    def update_product(self, product_id: int, update_data: schemas.ProductUpdate) -> models.Producto:
        logger.info(f"Actualizando producto con ID: {product_id}")
        product = self.get_product_by_id(product_id) # Usa el método que carga las relaciones

        for field, value in update_data.model_dump(exclude_unset=True).items(): # .model_dump() para Pydantic v2
            # Actualizar categorías si se proporcionan
            if field == "categoria_ids":
                categorias = self.db.query(categoria_models.Categoria).filter(
                    categoria_models.Categoria.id.in_(value)
                ).all()
                
                if len(categorias) != len(value):
                    missing_ids = set(value) - {cat.id for cat in categorias}
                    raise HTTPException(status_code=404, detail=f"Categorías con IDs {missing_ids} no encontradas")
                
                product.categorias = categorias
            # Actualizar proveedor_id si se proporciona
            elif field == "proveedor_id":
                proveedor = self.db.query(proveedor_models.Proveedor).filter_by(id=value).first()
                if not proveedor:
                    raise HTTPException(status_code=404, detail="Nuevo proveedor no encontrado")
                setattr(product, field, value)
            else:
                setattr(product, field, value)

        self.db.commit()
        self.db.refresh(product)
        self.db.refresh(product, attribute_names=["variantes", "categorias", "proveedor"]) # Asegurar que se refrescan las relaciones
        logger.info(f"Producto {product_id} actualizado.")
        return product

    def delete_product(self, product_id: int):
        logger.info(f"Eliminando producto con ID: {product_id}")
        product = self.get_product_by_id(product_id)
        self.db.delete(product)
        self.db.commit()
        logger.info(f"Producto {product_id} eliminado.")

    # --- Función auxiliar para guardar el archivo físico ---
    async def _guardar_archivo_imagen(self, file: UploadFile) -> str:
        logger.info(f"Guardando archivo: {file.filename}, Tipo: {file.content_type}")
        allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
        
        if file.content_type not in allowed_types:
            logger.error(f"Tipo de archivo no soportado: {file.content_type}")
            raise HTTPException(status_code=400, detail="Tipo de archivo no soportado")

        # Verificar que el directorio existe y es accesible
        if not UPLOAD_DIRECTORY.exists():
            try:
                UPLOAD_DIRECTORY.mkdir(parents=True, exist_ok=True)
                logger.info(f"Directorio creado: {UPLOAD_DIRECTORY}")
            except Exception as e:
                logger.error(f"Error al crear directorio: {e}")
                raise HTTPException(
                    status_code=500,
                    detail="Error del servidor al preparar el almacenamiento"
                )

        # Generar nombre único para el archivo
        file_extension = Path(file.filename).suffix.lower()
        new_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = UPLOAD_DIRECTORY / new_filename

        logger.info(f"Intentando guardar en: {file_path}")

        try:
            # Leer y guardar el archivo
            contents = await file.read()
            with open(file_path, "wb") as buffer:
                buffer.write(contents)
            
            # Verificar que el archivo se escribió correctamente
            if not file_path.exists():
                logger.error("El archivo no se creó después de la escritura")
                raise HTTPException(
                    status_code=500,
                    detail="Error al verificar el archivo guardado"
                )
            
            logger.info(f"Archivo guardado exitosamente: {file_path}")
            return f"images/{new_filename}"
        
        except Exception as e:
            logger.error(f"Error al guardar archivo: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Error al guardar la imagen: {str(e)}"
            )
    # --- Método principal en el servicio para subir y asociar imagen ---
    async def upload_image_to_product(self, product_id: int, file: UploadFile) -> models.Producto:
        logger.info(f"Iniciando subida de imagen para producto ID: {product_id}")
        product = self.get_product_by_id(product_id) # Esto ya lanzará 404 si no existe

        # Guardar el archivo físicamente usando el método auxiliar
        image_url_db = await self._guardar_archivo_imagen(file)

        # Actualizar la URL de la imagen en el producto y guardar en DB
        product.image_url = image_url_db
        self.db.commit()
        self.db.refresh(product)
        # Asegurarse de que las relaciones se refresquen para la respuesta
        self.db.refresh(product, attribute_names=["variantes", "categorias", "proveedor"])
        logger.info(f"Producto {product_id} actualizado con image_url: {product.image_url}")
        return product

    # --- CRUD DE LAS VARIANTES DE PRODUCTO ---
    def create_variant(self, product_id: int, variant_data: schemas.VarianteProductoCreate) -> models.VarianteProducto:
        logger.info(f"Creando variante para producto ID: {product_id}")
        producto = self.db.query(models.Producto).filter_by(id=product_id).first()
        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")

        nueva_variante = models.VarianteProducto(
            producto_id=product_id,
            color=variant_data.color,
            talla=variant_data.talla,
            stock=variant_data.stock
        )
        self.db.add(nueva_variante)
        self.db.commit()
        self.db.refresh(nueva_variante)
        self.db.refresh(nueva_variante, attribute_names=["producto"])
        logger.info(f"Variante creada con ID: {nueva_variante.id} para producto {product_id}")
        return nueva_variante

    def get_variants_by_product(self, product_id: int) -> List[models.VarianteProducto]:
        logger.info(f"Obteniendo variantes para producto ID: {product_id}")
        return self.db.query(models.VarianteProducto)\
                       .filter_by(producto_id=product_id)\
                       .options(joinedload(models.VarianteProducto.producto))\
                       .all()

    def get_variant_by_id(self, variant_id: int) -> models.VarianteProducto:
        logger.info(f"Obteniendo variante con ID: {variant_id}")
        variante = self.db.query(models.VarianteProducto)\
                           .options(joinedload(models.VarianteProducto.producto))\
                           .filter_by(id=variant_id)\
                           .first()
        if not variante:
            raise HTTPException(status_code=404, detail="Variante no encontrada")
        return variante

    def update_variant(self, variant_id: int, updated_data: schemas.VarianteProductoCreate) -> models.VarianteProducto:
        logger.info(f"Actualizando variante con ID: {variant_id}")
        variante = self.get_variant_by_id(variant_id) # Esto ya carga el producto
        variante.color = updated_data.color
        variante.talla = updated_data.talla
        variante.stock = updated_data.stock
        self.db.commit()
        self.db.refresh(variante)
        self.db.refresh(variante, attribute_names=["producto"])
        logger.info(f"Variante {variant_id} actualizada.")
        return variante

    def delete_variant(self, variant_id: int):
        logger.info(f"Eliminando variante con ID: {variant_id}")
        variante = self.get_variant_by_id(variant_id)
        self.db.delete(variante)
        self.db.commit()
        logger.info(f"Variante {variant_id} eliminada.")