import React, { useEffect, useState } from 'react';
import ProveedorForm from './ProveedorForm'; // Asegúrate de que la ruta de importación sea correcta

const API_URL = import.meta.env.VITE_API_URL; // Nueva constante para la URL de la API

const ProveedorManager = () => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState(null);

  useEffect(() => {
    fetchProveedores();
  }, []);

  const fetchProveedores = async () => {
    setLoading(true);
    setError(''); // Limpiar errores previos
    try {
      const response = await fetch(`${API_URL}/proveedores/`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al cargar proveedores');
      }
      const data = await response.json();
      setProveedores(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching proveedores:", err);
      setError(`No se pudieron cargar los proveedores: ${err.message}`);
      setLoading(false);
    }
  };

  const handleCreateProveedor = async (proveedorData) => {
    try {
      const response = await fetch(`${API_URL}/proveedores/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(proveedorData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al crear proveedor');
      }
      await fetchProveedores(); // Refrescar la lista después de crear
      alert('✅ Proveedor creado con éxito.');
    } catch (err) {
      console.error("Error creating proveedor:", err);
      setError(`Error al crear el proveedor: ${err.message}`);
    }
  };

  const handleUpdateProveedor = async (proveedorData) => {
    try {
      const response = await fetch(
        `${API_URL}/proveedores/${editingProveedor.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(proveedorData),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al actualizar proveedor');
      }
      await fetchProveedores(); // Refrescar la lista después de actualizar
      alert('✅ Proveedor actualizado con éxito.');
    } catch (err) {
      console.error("Error updating proveedor:", err);
      setError(`Error al actualizar el proveedor: ${err.message}`);
    }
  };

  const handleDeleteProveedor = async (proveedorId) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este proveedor?")) {
      return; // El usuario canceló
    }
    try {
      const response = await fetch(
        `${API_URL}/proveedores/${proveedorId}`,
        {
          method: 'DELETE',
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al eliminar proveedor');
      }
      await fetchProveedores(); // Refrescar la lista después de eliminar
      alert('✅ Proveedor eliminado con éxito.');
    } catch (err) {
      console.error("Error deleting proveedor:", err);
      setError(`Error al eliminar el proveedor: ${err.message}`);
    }
  };

  const handleFormSubmit = async (formData) => {
    if (editingProveedor) {
      await handleUpdateProveedor(formData);
    } else {
      await handleCreateProveedor(formData);
    }
  };

  if (loading) return <div className="text-center p-4 text-blue-600">Cargando proveedores...</div>;
  if (error) return <div className="text-center p-4 text-red-600 font-bold">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-gray-800">📦 Gestión de Proveedores</h1>
        <button
          onClick={() => {
            setEditingProveedor(null); // Para crear, no hay proveedor en edición
            setShowForm(true); // Mostrar el formulario
          }}
          className="bg-green-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-green-700 transition duration-300 ease-in-out"
        >
          ➕ Nuevo Proveedor
        </button>
      </div>

      {showForm && (
        <ProveedorForm
          initialProveedor={editingProveedor}
          onSubmit={handleFormSubmit}
          onClose={() => setShowForm(false)}
        />
      )}

      {proveedores.length === 0 ? (
        <div className="text-center p-6 text-gray-600 bg-white rounded-lg shadow-md mt-6">
          No hay proveedores registrados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {proveedores.map((proveedor) => (
            <div
              key={proveedor.id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out border border-gray-200"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900">{proveedor.nombre}</h3>
              <p className="text-gray-700 mb-1">📞 Teléfono: {proveedor.telefono}</p>
              <p className="text-gray-700 mb-4">📧 Correo: {proveedor.correo}</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setEditingProveedor(proveedor); // Establecer el proveedor para edición
                    setShowForm(true); // Mostrar el formulario
                  }}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors duration-200 text-sm"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleDeleteProveedor(proveedor.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-200 text-sm"
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProveedorManager;