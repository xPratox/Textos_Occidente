import { useState, useEffect, useCallback } from "react";
import ProductForm from "./ProductForm";
import VariantForm from "./VariantForm";
import FormEditPrincipal from "./FormEditPrincipal";
const API_URL = import.meta.env.VITE_API_URL; // Nueva constante para la URL de la API

const Products = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isVariantFormOpen, setIsVariantFormOpen] = useState(false);
  const [isEditPrincipalOpen, setIsEditPrincipalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [categoriesMap, setCategoriesMap] = useState({});

  // Aseguramos que fetchProducts siempre se tenga en cuenta si cambia el estado del componente
  // al ser usada en un useEffect, aunque aquí no debería cambiar
  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Productos desde API (Products.jsx):", data); // Verifica esta salida
      const sortedProducts = data.sort((a, b) => a.id - b.id);
      setProducts(sortedProducts);
    } catch (error) {
      console.error("Error cargando productos en Products.jsx:", error);
    }
  }, []); // Dependencias vacías, solo se crea una vez

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/categorias`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const map = {};
      data.forEach((cat) => {
        map[cat.id] = cat.name;
      });
      setCategoriesMap(map);
    } catch (error) {
      console.error("Error cargando categorías en Products.jsx:", error);
    }
  }, []);

  // Carga inicial de productos y categorías
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  // Filtrado de productos (tu lógica aquí está bien)
  useEffect(() => {
    if (search) {
      setFilteredProducts(
        products.filter((product) =>
          product.nombre.toLowerCase().includes(search.toLowerCase()) ||
          product.descripcion.toLowerCase().includes(search.toLowerCase()) ||
          (product.categoria?.name && product.categoria.name.toLowerCase().includes(search.toLowerCase())) || // Usar product.categoria.name
          product.proveedor?.nombre?.toLowerCase().includes(search.toLowerCase())
        )
      );
    } else {
      setFilteredProducts(products);
    }
  }, [search, products]); // Eliminamos categoriesMap de aquí, ya que el filtrado por categoría ya está bien

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este producto y todas sus variantes?")) {
      return;
    }
    try {
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Error al eliminar el producto");
      }
      alert("Producto eliminado correctamente.");
      fetchProducts(); // Recarga los productos para que la lista se actualice
    } catch (error) {
      console.error("Error eliminando producto:", error);
      alert("No se pudo eliminar el producto.");
    }
  };

  const handleDeleteVariant = async (variantId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta variante?")) {
      return;
    }
    try {
      const response = await fetch(`${API_URL}/products/variants/${variantId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Error al eliminar la variante");
      }
      alert("Variante eliminada correctamente.");
      fetchProducts(); // Recarga los productos para que la lista se actualice
    } catch (error) {
      console.error("Error eliminando variante:", error);
      alert("No se pudo eliminar la variante.");
    }
  };

  const openAddProductModal = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  // Esta función es CRUCIAL para que el ProductForm o FormEditPrincipal
  // le digan a Products que se ha guardado algo.
  const handleProductSave = (updatedProductData) => {
    console.log("Producto guardado/actualizado, recargando lista:", updatedProductData);
    fetchProducts(); // Esto es lo que recarga la lista de productos
    setIsFormOpen(false);
    setIsEditPrincipalOpen(false);
    // setIsVariantFormOpen(false); // Podrías necesitar esto si la variante actualiza la lista principal
  };

  // Función para construir la URL correcta de la imagen
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
        return null;
    }
    const cleanPath = imagePath.startsWith('images/') ? imagePath : `images/${imagePath}`;
    const fullUrl = `${API_URL}/static/${cleanPath}`;
    return fullUrl;
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">📦 Productos</h1>
      <p className="text-gray-600 mb-4">
        Administra todos los productos de la tienda.
      </p>

      <input
        type="text"
        placeholder="🔍 Buscar producto..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md mb-4"
      />

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-600 shadow-md rounded-lg">
          <thead className="bg-blue-700 text-white">
            <tr>
              <th className="border border-gray-700 p-3">Imagen</th>
              <th className="border border-gray-700 p-3">Nombre</th>
              <th className="border border-gray-700 p-3">Descripción</th>
              <th className="border border-gray-700 p-3">Categoría</th>
              <th className="border border-gray-700 p-3">Proveedor</th>
              <th className="border border-gray-700 p-3">Talla</th>
              <th className="border border-gray-700 p-3">Color</th>
              <th className="border border-gray-700 p-3">Stock</th>
              <th className="border border-gray-700 p-3 bg-indigo-600">
                Acciones Principales
              </th>
              <th className="border border-gray-700 p-3 bg-yellow-600">
                Acciones de Variante
              </th>
            </tr>
          </thead>
          <tbody>
            {(filteredProducts || []).map((product, productIndex) =>
              (product.variantes || []).map((variant, index) => (
                <tr
                  key={`${product.id}-${variant.id}`}
                  className={`${
                    productIndex % 2 === 0 ? "bg-coldgray" : "bg-coldgrayDark"
                  } hover:bg-navy/10 transition`}
                >
                  {index === 0 && (
                    <>
                      <td
                        rowSpan={product.variantes?.length || 1}
                        className="border border-gray-700 p-3 align-middle"
                      >
                        {/* Aquí es donde se muestra la imagen */}
                        {product.image_url ? (
                          <img
                            // Asegúrate de que getImageUrl devuelve la ruta completa correcta
                            src={getImageUrl(product.image_url)}
                            alt={product.nombre}
                            className="w-16 h-16 object-cover rounded-md"
                            onError={(e) => {
                              // Esto es clave: si la imagen no carga, muestra un placeholder.
                              // Ayuda a debuggear si la URL es correcta pero el archivo no existe o está corrupto.
                              e.target.onerror = null; // Evita bucles infinitos de error
                              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23e5e7eb'/%3E%3Ctext x='50%' y='50%' font-family='sans-serif' font-size='10' text-anchor='middle' dominant-baseline='middle' fill='%236b7280'%3ENo Image%3C/text%3E%3C/svg%3E";
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded-md">
                            <span className="text-gray-500 text-xs text-center">Sin imagen</span>
                          </div>
                        )}
                      </td>
                      <td
                        rowSpan={product.variantes?.length || 1}
                        className="border border-gray-700 p-3 align-middle font-semibold"
                      >
                        {product.nombre}
                      </td>
                      <td
                        rowSpan={product.variantes?.length || 1}
                        className="border border-gray-700 p-3 align-middle text-gray-600"
                      >
                        {product.descripcion}
                      </td>
                      <td
                        rowSpan={product.variantes?.length || 1}
                        className="border border-gray-700 p-3 align-middle font-medium"
                      >
                        {product.categorias && product.categorias.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {product.categorias.map((category, index) => (
                              <span
                                key={category.id || index}
                                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                              >
                                {category.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          "Sin categoría"
                        )}
                      </td>
                      <td
                        rowSpan={product.variantes?.length || 1}
                        className="border border-gray-700 p-3 align-middle font-medium"
                      >
                        {product.proveedor?.nombre || "Sin proveedor"}
                      </td>
                    </>
                  )}

                  <td className="border border-gray-700 p-3">
                    {variant.talla}
                  </td>
                  <td className="border border-gray-700 p-3">
                    {variant.color}
                  </td>
                  <td className="border border-gray-700 p-3 font-semibold text-blue-600">
                    {variant.stock}
                  </td>
                  {index === 0 && (
                    <td rowSpan={product.variantes?.length || 1} className="border border-gray-700 p-3 align-middle">
                      <div className="flex flex-col gap-2">
                        <button
                          className="bg-indigo-500 px-3 py-1 text-white rounded-md shadow hover:bg-indigo-600 transition w-full"
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsEditPrincipalOpen(true);
                          }}
                        >
                          ✏️ Editar Principal
                        </button>
                        <button
                          className="bg-red-600 px-3 py-1 text-white rounded-md shadow hover:bg-red-700 transition w-full"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          🗑️ Eliminar Principal
                        </button>
                      </div>
                    </td>
                  )}
                  <td className="border border-gray-700 p-3 align-middle">
                    <div className="flex flex-col gap-2">
                      <button
                        className="bg-yellow-500 px-3 py-1 text-white rounded-md shadow hover:bg-yellow-600 transition w-full"
                        onClick={() => {
                          setSelectedVariant(variant);
                          setIsVariantFormOpen(true);
                        }}
                      >
                        ✏️ Editar Variante
                      </button>
                      <button
                        className="bg-red-500 px-3 py-1 text-white rounded-md shadow hover:bg-red-600 transition w-full"
                        onClick={() => handleDeleteVariant(variant.id, product.id)}
                      >
                        🗑️ Eliminar Variante
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <button
        className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md text-lg w-full"
        onClick={openAddProductModal}
      >
        ➕ Agregar Producto
      </button>

      {isFormOpen && (
        <ProductForm
          product={selectedProduct}
          onClose={() => setIsFormOpen(false)}
          onSave={handleProductSave}
        />
      )}
      {isEditPrincipalOpen && selectedProduct && (
        <FormEditPrincipal
          product={selectedProduct}
          onClose={() => setIsEditPrincipalOpen(false)}
          onSave={handleProductSave}
        />
      )}
      {isVariantFormOpen && selectedVariant && (
        <VariantForm
          variant={selectedVariant}
          onClose={() => setIsVariantFormOpen(false)}
          onSave={handleProductSave}
        />
      )}
    </div>
  );
};

export default Products;