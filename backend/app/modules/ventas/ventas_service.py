# app/modules/ventas/ventas_service.py

from sqlalchemy.orm import Session, joinedload
from app.modules.ventas import ventas_model as models
from app.modules.ventas import ventas_schema as schemas
from app.modules.productos import product_model as product_models
from app.modules.users import user_model as user_models
from fastapi import HTTPException # Importante: usar la HTTPException de FastAPI
from typing import List
import uuid
from app.core.exceptions import NotFoundException

class SaleService:
    def __init__(self, db: Session):
        self.db = db

    def _generate_unique_sale_code(self) -> str:
        return str(uuid.uuid4()).replace("-", "")[:8].upper()

    def create_sale(self, sale_data: schemas.VentaCreate) -> models.Venta:
        """
        Crea una nueva venta, valida el cliente y el stock de variantes,
        calcula el total basándose en el precio del producto padre y disminuye el stock.
        """
        cliente = self.db.query(user_models.User).filter(user_models.User.cedula == sale_data.cedula_cliente).first()
        if not cliente:
            raise HTTPException(
                status_code=404,
                detail=f"Cliente con cédula '{sale_data.cedula_cliente}' no encontrado."
            )

        sale_code = self._generate_unique_sale_code()
        while self.db.query(models.Venta).filter_by(codigo=sale_code).first():
            sale_code = self._generate_unique_sale_code()

        total_venta = 0.0
        detalles_venta = []
        variantes_a_actualizar = []

        for item_data in sale_data.detalles:
            # Aquí es importante cargar el producto de la variante para el cálculo del precio
            variante = self.db.query(product_models.VarianteProducto).options(
                joinedload(product_models.VarianteProducto.producto)
            ).filter_by(id=item_data.variante_id).first()

            if not variante:
                raise HTTPException(status_code=404, detail=f"Variante de producto con ID {item_data.variante_id} no encontrada.")
            if variante.stock < item_data.cantidad:
                raise HTTPException(status_code=400, detail=f"Stock insuficiente para la variante ID {item_data.variante_id}. Disponible: {variante.stock}, Solicitado: {item_data.cantidad}.")
            if not variante.producto:
                raise HTTPException(status_code=500, detail=f"Variante ID {item_data.variante_id} no está asociada a un producto padre.")

            precio_unitario_real = float(item_data.precio_unitario)

            subtotal_detalle = item_data.cantidad * precio_unitario_real
            total_venta += subtotal_detalle

            detalle = models.DetalleVenta(
                variante_id=item_data.variante_id,
                cantidad=item_data.cantidad,
                precio_unitario=precio_unitario_real
            )
            detalles_venta.append(detalle)

            variantes_a_actualizar.append({"variante": variante, "cantidad_vendida": item_data.cantidad})

        new_sale = models.Venta(
            cliente_id=cliente.id,
            total=total_venta,
            estado=sale_data.estado,
            codigo=sale_code,
            detalles=detalles_venta
        )

        self.db.add(new_sale)
        self.db.flush()

        for item in variantes_a_actualizar:
            item["variante"].stock -= item["cantidad_vendida"]
            self.db.add(item["variante"])

        self.db.commit()
        self.db.refresh(new_sale)
        return new_sale

    def get_sale_by_id(self, sale_id: int) -> models.Venta:
        # Cargamos detalles, variante y producto para la respuesta de salida
        sale = self.db.query(models.Venta).options(
            joinedload(models.Venta.detalles).joinedload(models.DetalleVenta.variante).joinedload(product_models.VarianteProducto.producto),
            joinedload(models.Venta.cliente) # Opcional: si quieres el objeto cliente en VentaOut
        ).filter(models.Venta.id == sale_id).first()
        if not sale:
            raise NotFoundException("Venta no encontrada")
        return sale

    def get_sale_by_code(self, sale_code: str) -> models.Venta:
        # Cargamos detalles, variante y producto para la respuesta de salida
        sale = self.db.query(models.Venta).options(
            joinedload(models.Venta.detalles).joinedload(models.DetalleVenta.variante).joinedload(product_models.VarianteProducto.producto),
            joinedload(models.Venta.cliente) # Opcional: si quieres el objeto cliente en VentaOut
        ).filter(models.Venta.codigo == sale_code).first()
        if not sale:
            raise NotFoundException(f"Venta con código '{sale_code}' no encontrada")
        return sale

    def update_sale_status(self, sale_code: str, new_status_data: schemas.VentaUpdateEstado) -> models.Venta:
        # Para esta función, es CRÍTICO cargar la variante para poder reestablecer el stock
        sale = self.db.query(models.Venta).options(
            joinedload(models.Venta.detalles).joinedload(models.DetalleVenta.variante)
        ).filter(models.Venta.codigo == sale_code).first()

        if not sale:
            raise NotFoundException(f"Venta con código '{sale_code}' no encontrada.")

        if sale.estado == models.EstadoVenta.confirmada and new_status_data.estado == models.EstadoVenta.cancelada:
            raise HTTPException(status_code=400, detail="No se puede cancelar una venta ya confirmada.")

        # Lógica para reestablecer stock al CANCELAR una venta PENDIENTE
        if sale.estado == models.EstadoVenta.pendiente and new_status_data.estado == models.EstadoVenta.cancelada:
            for detalle in sale.detalles:
                variante = detalle.variante # La variante ya está cargada gracias al joinedload
                if variante:
                    variante.stock += detalle.cantidad # Reestablecer el stock
                    self.db.add(variante) # Marcar para actualización
                    print(f"Stock de variante {variante.id} restaurado: +{detalle.cantidad}. Nuevo stock: {variante.stock}")
                else:
                    print(f"Advertencia: Variante con ID {detalle.variante_id} no encontrada para el detalle de venta {detalle.id} al cancelar.")
            self.db.flush() # Guardar los cambios de stock antes de commitear la venta

        sale.estado = new_status_data.estado
        self.db.add(sale)
        self.db.commit()
        self.db.refresh(sale)
        return sale

    def get_all_sales(self) -> List[models.Venta]:
        # Cargamos detalles, variante y producto para la respuesta de salida de la lista
        return self.db.query(models.Venta).options(
            joinedload(models.Venta.detalles).joinedload(models.DetalleVenta.variante).joinedload(product_models.VarianteProducto.producto),
            joinedload(models.Venta.cliente) # Opcional: si quieres el objeto cliente en VentaOut
        ).all()

    def delete_sale(self, sale_id: int) -> None:
        sale = self.get_sale_by_id(sale_id)
        self.db.delete(sale)
        self.db.commit()

    # Agrega este método a la clase SaleService
    def get_sales_by_cedula(self, cedula: str) -> List[models.Venta]:
        """
        Obtiene todas las ventas asociadas a una cédula de cliente específica.
        """
        cliente = self.db.query(user_models.User).filter(user_models.User.cedula == cedula).first()
        if not cliente:
            raise NotFoundException(f"Cliente con cédula '{cedula}' no encontrado.")
        
        # Cargamos detalles, variante y producto para la respuesta
        ventas = self.db.query(models.Venta).options(
            joinedload(models.Venta.detalles).joinedload(models.DetalleVenta.variante).joinedload(product_models.VarianteProducto.producto),
            joinedload(models.Venta.cliente)
        ).filter(models.Venta.cliente_id == cliente.id).all()
        
        return ventas