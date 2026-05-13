import { useState } from "react";

const VariantForm = ({ variant, onClose, onSave }) => {
  const API_URL = import.meta.env.VITE_API_URL; // Nueva constante para la URL de la API // Añadido onSave para refrescar la lista
  const [formData, setFormData] = useState({
    size: variant?.size || "",
    color: variant?.color || "",
    stock: variant?.stock || 0,
  });

  const handleChange = (e) => {
    const value = e.target.name === "stock" ? parseFloat(e.target.value) : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas antes de enviar
    if (!formData.size.trim()) {
      alert("La talla de la variante es obligatoria.");
      return;
    }
    if (!formData.color.trim()) {
      alert("El color de la variante es obligatorio.");
      return;
    }
    if (formData.stock === null || formData.stock === undefined || isNaN(formData.stock) || formData.stock < 0) {
      alert("El stock es obligatorio y debe ser un número entero no negativo.");
      return;
    }


    try {
      // *** CORRECCIÓN CLAVE: Endpoint apuntando a /products/variants/{variant.id} ***
      const response = await fetch(`${API_URL}/products/variants/${variant.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        // Mapear formData a la estructura JSON que espera el backend
        body: JSON.stringify({
          color: formData.color,
          talla: formData.size, // El backend espera 'talla', no 'size'
          stock: parseInt(formData.stock), // Asegurarse de que stock sea un entero
        }),
      });

      if (!response.ok) {
        const errorDetail = await response.text(); // Intenta leer el detalle del error
        throw new Error(`Error al actualizar la variante: ${errorDetail}`);
      }

      alert("✅ Variante actualizada correctamente.");
      onClose(); // Cierra el modal
      if (onSave) {
          onSave(); // Notifica al componente padre (ej. Products.jsx) para que recargue los datos
      }
    } catch (error) {
      console.error("Error:", error);
      alert(`❌ No se pudo actualizar la variante. Detalles: ${error.message}`);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">✏️ Editar Variante</h2>
        <form onSubmit={handleSubmit}>
          <label className="block text-gray-700">Talla</label>
          <input
            type="text"
            name="size"
            value={formData.size}
            onChange={handleChange}
            className="w-full p-2 border rounded-md mb-3"
          />

          <label className="block text-gray-700">Color</label>
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleChange}
            className="w-full p-2 border rounded-md mb-3"
          />

          <label className="block text-gray-700">Stock</label>
          <input disabled
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            min="0"
            className="w-full p-2 border rounded-md mb-3"
          />

          <div className="flex justify-between mt-4">
            <button type="button" onClick={onClose} className="bg-navyLight text-white px-4 py-2 rounded-md hover:bg-navy">
              ❌ Cancelar
            </button>
            <button type="submit" className="bg-navyLight text-white px-4 py-2 rounded-md hover:bg-navy">
              ✅ Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VariantForm;