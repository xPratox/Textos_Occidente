import React, { useState, useEffect } from 'react';

const ProveedorForm = ({ initialProveedor, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    nombre: initialProveedor?.nombre || '',
    telefono: initialProveedor?.telefono || '',
    correo: initialProveedor?.correo || ''
  });

  // Actualizar formData si initialProveedor cambia (para el modo edición)
  useEffect(() => {
    if (initialProveedor) {
      setFormData({
        nombre: initialProveedor.nombre || '',
        telefono: initialProveedor.telefono || '',
        correo: initialProveedor.correo || ''
      });
    } else {
      // Limpiar el formulario si no hay initialProveedor (modo creación)
      setFormData({
        nombre: '',
        telefono: '',
        correo: ''
      });
    }
  }, [initialProveedor]); // Dependencia para que se ejecute cuando initialProveedor cambie

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
    onClose(); // Cierra el formulario después de enviar
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">
          {initialProveedor ? '✏️ Editar Proveedor' : '➕ Nuevo Proveedor'}
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre del proveedor"
            value={formData.nombre}
            onChange={handleChange}
            className="w-full p-2 border mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="text"
            name="telefono"
            placeholder="Teléfono"
            value={formData.telefono}
            onChange={handleChange}
            className="w-full p-2 border mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="email" // Usar tipo email para validación básica
            name="correo"
            placeholder="Correo electrónico"
            value={formData.correo}
            onChange={handleChange}
            className="w-full p-2 border mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-navyLight text-white px-4 py-2 rounded-md hover:bg-navy transition-colors duration-200"
            >
              ❌ Cancelar
            </button>
            <button
              type="submit"
              className="bg-navyLight text-white px-4 py-2 rounded-md hover:bg-navy transition-colors duration-200"
            >
              {initialProveedor ? '✅ Guardar' : '➕ Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProveedorForm;