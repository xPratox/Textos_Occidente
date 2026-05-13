# app/modules/pedidos/pedido_service.py
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from app.modules.pedidos import pedido_model as models, pedido_schema as schemas
from app.modules.productos import product_model as product_models # Usaremos este alias
from app.modules.proveedores import proveedor_model as proveedor_models # Necesario para la validación/carga
from typing import List


class PedidoService:
    def __init__(self, db: Session):
        self.db = db

    # --- Función auxiliar para validar la pertenencia de productos a un proveedor ---
    def _validar_productos_de_proveedor(self, proveedor_id_pedido: int, detalles: List[schemas.DetallePedidoCreate]):

        for detalle in detalles:
            # Cargamos la variante y su producto asociado para poder acceder al proveedor_id del producto
            variante = self.db.query(product_models.VarianteProducto)\
                              .options(joinedload(product_models.VarianteProducto.producto))\
                              .filter(product_models.VarianteProducto.id == detalle.variante_id)\
                              .first()

            if not variante:
                raise HTTPException(status_code=404, detail=f"Variante de producto con ID {detalle.variante_id} no encontrada.")

            # CRÍTICO: Comprobar que el proveedor del producto de la variante coincide con el proveedor del pedido
            if variante.producto.proveedor_id != proveedor_id_pedido:
                raise HTTPException(
                    status_code=400,
                    detail=f"El producto '{variante.producto.nombre}' (Variante ID: {variante.id}) no pertenece al proveedor seleccionado (ID: {proveedor_id_pedido})."
                )

    # --- Funciones CRUD de Pedidos ---

    def crear_pedido(self, pedido_data: schemas.PedidoCreate):
        # Validar la pertenencia de los productos al proveedor del pedido antes de crear
        self._validar_productos_de_proveedor(pedido_data.proveedor_id, pedido_data.detalles)

        pedido = models.Pedido(
            proveedor_id=pedido_data.proveedor_id,
            fecha=pedido_data.fecha,
            estado=pedido_data.estado if hasattr(pedido_data, 'estado') else schemas.EstadoPedido.pendiente # Asegura el estado inicial
        )
        self.db.add(pedido)
        self.db.flush() # Para obtener el ID del pedido antes de añadir los detalles

        for detalle in pedido_data.detalles:
            detalle_db = models.DetallePedido(
                pedido_id=pedido.id,
                variante_id=detalle.variante_id,
                cantidad=detalle.cantidad,
                precio_unitario=detalle.precio_unitario
            )
            self.db.add(detalle_db)

        self.db.commit()
        self.db.refresh(pedido)
        # Refrescar las relaciones para asegurar que el objeto retornado esté completo para la serialización
        self.db.refresh(pedido, attribute_names=["proveedor", "detalles"])
        return pedido

    def obtener_pedido(self, pedido_id: int):
        # CRÍTICO: Cargar todas las relaciones necesarias para el pedido individual
        pedido = self.db.query(models.Pedido)\
                   .options(
                       joinedload(models.Pedido.proveedor), # Carga el proveedor del pedido
                       joinedload(models.Pedido.detalles).joinedload(models.DetallePedido.variante).joinedload(product_models.VarianteProducto.producto).joinedload(product_models.Producto.categoria), # Carga detalles, sus variantes, el producto de la variante y la categoría del producto
                       joinedload(models.Pedido.detalles).joinedload(models.DetallePedido.variante).joinedload(product_models.VarianteProducto.producto).joinedload(product_models.Producto.proveedor) # También carga el proveedor del producto, por si lo necesitas
                   )\
                   .filter(models.Pedido.id == pedido_id).first()
        if not pedido:
            raise HTTPException(status_code=404, detail="Pedido no encontrado")
        return pedido

    def actualizar_pedido(self, pedido_id: int, pedido_data: schemas.PedidoCreate):
        pedido = self.obtener_pedido(pedido_id) # Esta función ya carga las relaciones

        if pedido.estado != schemas.EstadoPedido.pendiente: # Usa el Enum directamente para comparar
            raise HTTPException(status_code=400, detail="Solo se puede actualizar un pedido en estado pendiente")

        # Validar los nuevos detalles antes de modificar el pedido
        self._validar_productos_de_proveedor(pedido_data.proveedor_id, pedido_data.detalles)

        # Eliminar detalles existentes y añadir nuevos
        self.db.query(models.DetallePedido).filter(models.DetallePedido.pedido_id == pedido_id).delete()
        self.db.flush() # Asegura que la eliminación se procese antes de añadir nuevos

        # Actualizar campos del pedido principal
        pedido.proveedor_id = pedido_data.proveedor_id
        pedido.fecha = pedido_data.fecha
        pedido.estado = pedido_data.estado # Permite cambiar el estado al actualizar si es pendiente

        # Añadir nuevos detalles
        for detalle in pedido_data.detalles:
            detalle_db = models.DetallePedido(
                pedido_id=pedido_id,
                variante_id=detalle.variante_id,
                cantidad=detalle.cantidad,
                precio_unitario=detalle.precio_unitario
            )
            self.db.add(detalle_db)

        self.db.commit()
        self.db.refresh(pedido)
        # Refrescar las relaciones después del commit para la respuesta
        self.db.refresh(pedido, attribute_names=["proveedor", "detalles"])
        return pedido

    def cambiar_estado_pedido(self, pedido_id: int, nuevo_estado: schemas.EstadoPedido):
        # Aquí es importante cargar los detalles si se van a modificar stocks
        pedido = self.db.query(models.Pedido)\
                       .options(joinedload(models.Pedido.detalles).joinedload(models.DetallePedido.variante))\
                       .filter(models.Pedido.id == pedido_id).first()
        if not pedido:
            raise HTTPException(status_code=404, detail="Pedido no encontrado")

        if pedido.estado != schemas.EstadoPedido.pendiente: # Usa el Enum
            raise HTTPException(status_code=400, detail="Solo se puede cambiar el estado si el pedido está pendiente")

        if nuevo_estado == schemas.EstadoPedido.confirmado: # Usa el Enum
            for detalle in pedido.detalles:
                # Asegúrate que product_models es el alias correcto para product_model
                variante = self.db.query(product_models.VarianteProducto).filter(product_models.VarianteProducto.id == detalle.variante_id).first()
                if not variante:
                    raise HTTPException(status_code=404, detail=f"Variante con ID {detalle.variante_id} no encontrada.")
                # Si el stock se resta al confirmar el pedido, aquí va la lógica.
                # Me adhiero a tu lógica actual de sumar stock:
                variante.stock += detalle.cantidad
        
        pedido.estado = nuevo_estado
        self.db.commit()
        self.db.refresh(pedido)
        self.db.refresh(pedido, attribute_names=["proveedor", "detalles"]) # Recargar para la respuesta
        return pedido

    def eliminar_pedido(self, pedido_id: int):
        pedido = self.obtener_pedido(pedido_id) # Esta ya carga las relaciones

        if pedido.estado != schemas.EstadoPedido.pendiente: # Usa el Enum
            raise HTTPException(status_code=400, detail="Solo se pueden eliminar pedidos pendientes")

        self.db.delete(pedido)
        self.db.commit()
        # No hay refresh ya que el objeto es eliminado

    def obtener_pedidos(self, skip: int = 0, limit: int = 100):
        """
        Obtiene una lista de todos los pedidos, cargando sus relaciones anidadas.
        """
        return self.db.query(models.Pedido)\
                 .options(
                     joinedload(models.Pedido.proveedor), # Carga el proveedor del pedido
                     # Carga los detalles, su variante, el producto de la variante, la categoría y el proveedor del producto
                     joinedload(models.Pedido.detalles).joinedload(models.DetallePedido.variante).joinedload(product_models.VarianteProducto.producto).joinedload(product_models.Producto.categorias),
                     joinedload(models.Pedido.detalles).joinedload(models.DetallePedido.variante).joinedload(product_models.VarianteProducto.producto).joinedload(product_models.Producto.proveedor)
                 )\
                 .offset(skip).limit(limit).all()