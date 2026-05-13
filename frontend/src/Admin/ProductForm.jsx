// ProductForm.jsx
import { useState, useEffect } from "react";

const ProductForm = ({ product, onClose, onSave }) => {
  const API_URL = import.meta.env.VITE_API_URL; // Nueva constante para la URL de la API
  const [formData, setFormData] = useState(
    product
      ? {
          name: product.nombre || "",
          description: product.descripcion || "",
          price: product.precio || 0,
          categoria_ids: product.categorias?.map(cat => cat.id) || [],
          proveedor_id: product.proveedor?.id || "",
          variants: product.variantes || [],
        }
      : {
          name: "",
          description: "",
          price: 0,
          categoria_ids: [],
          proveedor_id: "",
          variants: [],
        }
  );

  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [categories, setCategories] = useState([]);
  const [searchCategory, setSearchCategory] = useState("");
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const [providers, setProviders] = useState([]);
  const [searchProvider, setSearchProvider] = useState(product?.proveedor?.nombre || "");
  const [filteredProviders, setFilteredProviders] = useState([]);

  const [variant, setVariant] = useState({ size: "", color: "", stock: "" });

  useEffect(() => {
    // Cargar categorías desde la API
    fetch(`${API_URL}/categorias`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setCategories(data);
        if (product && product.categorias) {
          const initialCategories = data.filter((cat) => 
            product.categorias.some(productCat => productCat.id === cat.id)
          );
          setSelectedCategories(initialCategories);
        }
      })
      .catch((error) => console.error("Error cargando categorías:", error));
  }, [product]);

  useEffect(() => {
    // Cargar proveedores desde la API
    fetch(`${API_URL}/proveedores`)
      .then((response) => response.json())
      .then((data) => {
        setProviders(data);
        if (product && product.proveedor && data.length > 0) {
          const initialProvider = data.find((prov) => prov.id === product.proveedor.id);
          if (initialProvider) {
            setSearchProvider(initialProvider.nombre);
            setFormData((prev) => ({ ...prev, proveedor_id: initialProvider.id }));
          }
        }
      })
      .catch((error) => console.error("Error cargando proveedores:", error));
  }, [product]);

  useEffect(() => {
    // Lógica de filtrado de categorías
    if (searchCategory && categories.length > 0) {
      const filtered = categories.filter((cat) =>
        cat.name && cat.name.toLowerCase().includes(searchCategory.toLowerCase()) &&
        !selectedCategories.some(selected => selected.id === cat.id)
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories([]);
    }
  }, [searchCategory, categories, selectedCategories]);

  useEffect(() => {
    // Lógica de filtrado de proveedores (este ya funcionaba bien)
    if (searchProvider && providers.length > 0) {
      setFilteredProviders(
        providers.filter((prov) =>
          prov.nombre && prov.nombre.toLowerCase().includes(searchProvider.toLowerCase())
        )
      );
    } else {
      setFilteredProviders([]);
    }
  }, [searchProvider, providers]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectCategory = (category) => {
    const newSelectedCategories = [...selectedCategories, category];
    setSelectedCategories(newSelectedCategories);
    setFormData({ 
      ...formData, 
      categoria_ids: newSelectedCategories.map(cat => cat.id) 
    });
    setSearchCategory("");
    setFilteredCategories([]);
  };

  const handleRemoveCategory = (categoryToRemove) => {
    const newSelectedCategories = selectedCategories.filter(cat => cat.id !== categoryToRemove.id);
    setSelectedCategories(newSelectedCategories);
    setFormData({ 
      ...formData, 
      categoria_ids: newSelectedCategories.map(cat => cat.id) 
    });
  };

  const handleSelectProvider = (provider) => {
    setFormData({ ...formData, proveedor_id: provider.id });
    setSearchProvider(provider.nombre);
    setFilteredProviders([]);
  };

  const handleVariantChange = (e) => {
    setVariant({ ...variant, [e.target.name]: e.target.value });
  };

  const handleImageFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            setImageUploadError("Tipo de archivo no soportado. Solo JPG, PNG, GIF.");
            setSelectedImageFile(null);
            return;
        }
        setSelectedImageFile(file);
        setImageUploadError(null);
    }
  };

  const addVariant = () => {
    if (!variant.size || !variant.color || !variant.stock) {
      alert("Completa todos los campos de la variante.");
      return;
    }
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        {
          talla: variant.size,
          color: variant.color,
          stock: parseInt(variant.stock),
        },
      ],
    });
    setVariant({ size: "", color: "", stock: "" });
  };

  const uploadProductImage = async (productId, imageFile) => {
    if (!imageFile || !productId) return null;

    setIsUploadingImage(true);
    setImageUploadError(null);

    const formData = new FormData();
    formData.append('file', imageFile);

    try {
        const response = await fetch(`${API_URL}/products/${productId}/upload-image`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
        }

        const updatedProduct = await response.json();
        console.log("Producto actualizado con imagen:", updatedProduct);
        return updatedProduct.image_url;
    } catch (err) {
        setImageUploadError(`❌ Error al subir la imagen: ${err.message}`);
        console.error("Error al subir la imagen:", err);
        return null;
    } finally {
        setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.description ||
      formData.price <= 0 ||
      formData.categoria_ids.length === 0 ||
      !formData.proveedor_id
    ) {
      alert(
        "Por favor, rellena todos los campos obligatorios (Nombre, Descripción, Precio, al menos una Categoría, Proveedor)."
      );
      return;
    }
    if (formData.variants.length === 0) {
      alert("Debes agregar al menos una variante.");
      return;
    }

    const productData = {
      nombre: formData.name,
      descripcion: formData.description,
      precio: parseFloat(formData.price),
      categoria_ids: formData.categoria_ids,
      proveedor_id: parseInt(formData.proveedor_id),
      variantes: formData.variants,
    };

    let savedProduct = null;
    try {
      const url = product
        ? `${API_URL}/products/${product.id}`
        : `${API_URL}/products`;

      const method = product ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al ${product ? "editar" : "crear"} el producto: ${errorText}`);
      }

      savedProduct = await response.json();

      if (selectedImageFile) {
        const imageUrl = await uploadProductImage(savedProduct.id, selectedImageFile);
        if (!imageUrl) {
          console.warn("La imagen no pudo ser subida, pero el producto se guardó.");
        } else {
          alert(`✅ Producto ${product ? "editado" : "creado"} correctamente y con imagen.`);
        }
      } else {
        alert(`✅ Producto ${product ? "editado" : "creado"} correctamente (sin imagen nueva).`);
      }

      if (onSave) {
        onSave(savedProduct);
      }
      onClose();
    } catch (error) {
      console.error("Error:", error);
      alert(`❌ No se pudo ${product ? "editar" : "crear"} el producto. ${error.message}`);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {product ? "✏️ Editar Producto" : "➕ Agregar Producto"}
        </h2>

        {/* --- CAMPOS PRINCIPALES --- */}
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
        ></textarea>

        <label className="block text-gray-700">Precio</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md mb-3"
        />

        {/* --- Buscador de categorías --- */}
        <label className="block text-gray-700">Categorías</label>
        <input
          type="text"
          placeholder="Buscar categoría..."
          value={searchCategory}
          onChange={(e) => setSearchCategory(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md mb-3"
        />

        {/* Lista de categorías filtradas */}
        {searchCategory && filteredCategories.length > 0 && (
          <ul className="bg-white border rounded shadow-md mt-2 max-h-40 overflow-y-auto">
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
        {searchCategory && filteredCategories.length === 0 && categories.length > 0 && (
          <p className="text-sm text-gray-500 mb-2">No se encontraron categorías.</p>
        )}
        {!searchCategory && categories.length > 0 && (
            <p className="text-sm text-gray-500 mb-2">Empieza a escribir para buscar categorías.</p>
        )}

        {/* Categorías seleccionadas */}
        {selectedCategories.length > 0 && (
          <div className="mb-3">
            <p className="text-sm text-gray-600 mb-2">Categorías seleccionadas:</p>
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map((category) => (
                <span
                  key={category.id}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {category.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(category)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}


        {/* --- Buscador de proveedores --- */}
        <label className="block text-gray-700 mt-3">Proveedor</label>
        <input
          type="text"
          placeholder="Buscar proveedor..."
          value={searchProvider}
          onChange={(e) => setSearchProvider(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md mb-3"
        />

        {/* Lista de proveedores filtrados */}
        {searchProvider && filteredProviders.length > 0 && (
          <ul className="bg-white border rounded shadow-md mt-2 max-h-40 overflow-y-auto">
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
        {searchProvider && filteredProviders.length === 0 && providers.length > 0 && (
          <p className="text-sm text-gray-500 mb-2">No se encontraron proveedores.</p>
        )}
        {!searchProvider && providers.length > 0 && (
            <p className="text-sm text-gray-500 mb-2">Empieza a escribir para buscar proveedores.</p>
        )}

        {/* --- Campo de entrada para la imagen --- */}
        <label className="block text-gray-700 mt-3">Imagen del Producto</label>
        <input
            type="file"
            accept="image/jpeg, image/png, image/gif"
            onChange={handleImageFileChange}
            disabled={isUploadingImage}
            className="w-full p-2 border border-gray-300 rounded-md mb-3"
        />
        {imageUploadError && <p style={{ color: 'red', fontSize: '0.85em' }}>{imageUploadError}</p>}
        {product?.image_url && (
            <div className="mb-3">
                <p className="text-sm text-gray-600">Imagen actual:</p>
                <img src={`${API_URL}/static/${product.image_url}`} alt="Imagen actual" style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover', border: '1px solid #ddd' }} />
            </div>
        )}

        {/* --- AGREGAR VARIANTES --- */}
        <h3 className="text-lg font-bold mt-4">Variantes</h3>
        <div className="flex gap-2">
          <input
            type="text"
            name="size"
            placeholder="Talla"
            value={variant.size}
            onChange={handleVariantChange}
            className="w-1/3 p-2 border border-gray-300 rounded-md mb-3"
          />
          <input
            type="text"
            name="color"
            placeholder="Color"
            value={variant.color}
            onChange={handleVariantChange}
            className="w-1/3 p-2 border border-gray-300 rounded-md mb-3"
          />
          <input
            type="number"
            name="stock"
            placeholder="Stock"
            value={variant.stock}
            onChange={handleVariantChange}
            className="w-1/3 p-2 border border-gray-300 rounded-md mb-3"
          />
        </div>

        <button
          type="button"
          onClick={addVariant}
          className="w-full bg-navyLight text-white py-2 rounded-md mb-3 hover:bg-navy"
        >
          ➕ Agregar Variante
        </button>

        {/* Lista de variantes agregadas */}
        {formData.variants.length > 0 && (
          <ul className="bg-coldgray p-3 rounded">
            {formData.variants.map((v, index) => (
              <li key={index} className="p-1 border-b">
                {v.talla} - {v.color} - Stock: {v.stock}
              </li>
            ))}
          </ul>
        )}

        {/* --- BOTONES --- */}
        <div className="flex justify-between mt-4">
          <button onClick={onClose} className="bg-navyLight text-white px-4 py-2 rounded-md hover:bg-navy">
            ❌ Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="bg-navyLight text-white px-4 py-2 rounded-md hover:bg-navy"
            disabled={isUploadingImage}
          >
            {isUploadingImage ? 'Guardando imagen...' : '✅ Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;