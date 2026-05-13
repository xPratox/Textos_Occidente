import { useState, useEffect, useCallback } from "react";

const FormEditPrincipal = ({ product, onClose, onSave }) => {
  const API_URL = import.meta.env.VITE_API_URL; // Nueva constante para la URL de la API
  // Estado para los datos del formulario principal del producto
  const [formData, setFormData] = useState({
    name: product?.nombre || "", // Asegurarse de usar 'nombre' si ese es el campo del API
    description: product?.descripcion || "", // Asegurarse de usar 'descripcion'
    category_id: product?.categoria?.id || "", // Asegurarse de usar 'categoria.id'
    proveedor_id: product?.proveedor?.id || "", // Asegurarse de usar 'proveedor.id'
    precio: product?.precio || 0,
  });

  // Estados para categorías
  const [categories, setCategories] = useState([]);
  // Inicializa searchCategory con el nombre actual de la categoría del producto
  const [searchCategory, setSearchCategory] = useState(product?.categoria?.name || ""); 
  const [filteredCategories, setFilteredCategories] = useState([]);

  // Estados para proveedores
  const [providers, setProviders] = useState([]);
  // Inicializa searchProvider con el nombre actual del proveedor del producto
  const [searchProvider, setSearchProvider] = useState(product?.proveedor?.nombre || ""); 
  const [filteredProviders, setFilteredProviders] = useState([]);

  // Sincronizar searchCategory/searchProvider si el 'product' prop cambia
  // Esto es útil si el mismo modal se reutiliza para diferentes productos sin desmontar
  useEffect(() => {
    setSearchCategory(product?.categoria?.name || "");
    setSearchProvider(product?.proveedor?.nombre || "");
    setFormData({
      name: product?.nombre || "",
      description: product?.descripcion || "",
      category_id: product?.categoria?.id || "",
      proveedor_id: product?.proveedor?.id || "",
      precio: product?.precio || 0,
    });
  }, [product]);


  // Función para cargar categorías
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/categorias`);
      if (!response.ok) {
        throw new Error("Error al cargar categorías");
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
    }
  }, []); // Sin dependencia de 'product' aquí, solo carga las categorías

  // Función para cargar proveedores
  const fetchProviders = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/proveedores`);
      if (!response.ok) {
        throw new Error("Error al cargar proveedores");
      }
      const data = await response.json();
      setProviders(data);
    } catch (error) {
      console.error("Error al obtener proveedores:", error);
    }
  }, []); // Sin dependencia de 'product' aquí, solo carga los proveedores

  // Efecto para cargar categorías y proveedores al montar el componente
  useEffect(() => {
    fetchCategories();
    fetchProviders();
  }, [fetchCategories, fetchProviders]);

  // Efecto para filtrar categorías según el texto de búsqueda
  useEffect(() => {
    if (searchCategory) {
      setFilteredCategories(
        categories.filter((cat) =>
          cat.name.toLowerCase().includes(searchCategory.toLowerCase())
        )
      );
    } else {
      setFilteredCategories([]);
    }
  }, [searchCategory, categories]);

  // Efecto para filtrar proveedores según el texto de búsqueda
  useEffect(() => {
    if (searchProvider) {
      setFilteredProviders(
        providers.filter((prov) =>
          prov.nombre.toLowerCase().includes(searchProvider.toLowerCase())
        )
      );
    } else {
      setFilteredProviders([]);
    }
  }, [searchProvider, providers]);

  // Manejador de cambios para inputs normales
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejador de cambios específico para los inputs de búsqueda de categoría/proveedor
  const handleSearchChange = (e, type) => {
    const value = e.target.value;
    if (type === 'category') {
      setSearchCategory(value);
      // Si el usuario edita el campo, deselecciona el ID actual para forzar una nueva elección
      setFormData(prev => ({ ...prev, category_id: "" }));
    } else if (type === 'provider') {
      setSearchProvider(value);
      // Si el usuario edita el campo, deselecciona el ID actual para forzar una nueva elección
      setFormData(prev => ({ ...prev, proveedor_id: "" }));
    }
  };

  const handleSelectCategory = (category) => {
    setFormData(prev => ({ ...prev, category_id: category.id }));
    setSearchCategory(category.name);
    setFilteredCategories([]); // Oculta las sugerencias
  };

  const handleSelectProvider = (provider) => {
    setFormData(prev => ({ ...prev, proveedor_id: provider.id }));
    setSearchProvider(provider.nombre);
    setFilteredProviders([]); // Oculta las sugerencias
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas antes de enviar
    if (!formData.name.trim()) {
      alert("El nombre del producto es obligatorio.");
      return;
    }
    if (!formData.description.trim()) {
      alert("La descripción del producto es obligatoria.");
      return;
    }
    if (formData.precio === null || formData.precio === undefined || isNaN(parseFloat(formData.precio))) {
      alert("El precio es obligatorio y debe ser un número.");
      return;
    }
    if (!formData.category_id) {
      alert("Debe seleccionar una categoría.");
      return;
    }
    if (!formData.proveedor_id) {
      alert("Debe seleccionar un proveedor.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.name,
          descripcion: formData.description,
          precio: parseFloat(formData.precio),
          categoria_id: parseInt(formData.category_id),
          proveedor_id: parseInt(formData.proveedor_id),
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al actualizar el producto: ${errorText}`);
      }
      alert("✅ Producto actualizado correctamente.");
      if (onSave) {
        onSave(); // Notifica al componente padre para que recargue los datos
      }
      onClose();
    } catch (error) {
      console.error(error);
      alert(`❌ Error al actualizar el producto. ${error.message}`);
    }
  };

  const getImageUrl = useCallback((imagePath) => {
    if (!imagePath) {
      return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23e5e7eb'/%3E%3Ctext x='50%' y='50%' font-family='sans-serif' font-size='10' text-anchor='middle' dominant-baseline='middle' fill='%236b7280'%3ENo Image%3C/text%3E%3C/svg%3E";
    }
    const cleanPath = imagePath.startsWith('images/') ? imagePath : `images/${imagePath}`;
    const fullUrl = `${API_URL}/static/${cleanPath}`;
    return fullUrl;
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">✏️ Editar Producto</h2>
        <form onSubmit={handleSubmit}>
          <label className="block text-gray-700">Nombre</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md mb-3"
          />
          <label className="block text-gray-700">Descripción</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md mb-3"
          />

          <label className="block text-gray-700">Precio</label>
          <input
            type="number"
            name="precio"
            value={formData.precio}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md mb-3"
          />

          {/* Buscador de Categorías */}
          <label className="block text-gray-700">Categoría</label>
          <input
            type="text"
            placeholder="Buscar categoría..."
            value={searchCategory}
            onChange={(e) => handleSearchChange(e, 'category')} // Usar el nuevo manejador
            className="w-full p-2 border border-gray-300 rounded-md mb-3"
          />
          {filteredCategories.length > 0 && (
            <ul className="bg-coldgray border rounded shadow-md mt-2 max-h-40 overflow-y-auto">
              {filteredCategories.map((category) => (
                <li
                  key={category.id}
                  onClick={() => handleSelectCategory(category)}
                  className="p-2 hover:bg-gray-200 cursor-pointer"
                >
                  {category.name}
                </li>
              ))}
            </ul>
          )}

          {/* Buscador de Proveedores */}
          <label className="block text-gray-700 mt-3">Proveedor</label>
          <input
            type="text"
            placeholder="Buscar proveedor..."
            value={searchProvider}
            onChange={(e) => handleSearchChange(e, 'provider')} // Usar el nuevo manejador
            className="w-full p-2 border border-gray-300 rounded-md mb-3"
          />
          {filteredProviders.length > 0 && (
            <ul className="bg-coldgray border rounded shadow-md mt-2 max-h-40 overflow-y-auto">
              {filteredProviders.map((provider) => (
                <li
                  key={provider.id}
                  onClick={() => handleSelectProvider(provider)}
                  className="p-2 hover:bg-gray-200 cursor-pointer"
                >
                  {provider.nombre}
                </li>
              ))}
            </ul>
          )}

          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-md"
            >
              ❌ Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              ✅ Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormEditPrincipal;