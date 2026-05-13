import { useState, useEffect } from "react";

const CreateSale = ({ onAddSale }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [cedulaCliente, setCedulaCliente] = useState("");
  const [saleStatus, setSaleStatus] = useState("pendiente");
  const [selectedItems, setSelectedItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantityNotice, setQuantityNotice] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error cargando productos:", error);
        alert("Error al cargar productos. Por favor, intente de nuevo mas tarde.");
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (search.trim()) {
      setFilteredProducts(
        products.filter((product) => product.nombre.toLowerCase().includes(search.toLowerCase()))
      );
    } else {
      setFilteredProducts([]);
    }
  }, [search, products]);

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setSearch("");
    setFilteredProducts([]);

    if (product.variantes && product.variantes.length > 0) {
      if (product.variantes.length === 1) {
        const variant = product.variantes[0];
        const newItem = {
          product_id: product.id,
          variant_id: variant.id,
          product_name: product.nombre,
          size: variant.talla,
          color: variant.color,
          quantity: 1,
          stock_available: variant.stock,
          unit_price: product.precio,
        };
        addItemToSelectedItems(newItem);
        setSelectedProduct(null);
      } else {
        setSelectedVariant(null);
      }
    } else {
      const newItem = {
        product_id: product.id,
        variant_id: null,
        product_name: product.nombre,
        size: "N/A",
        color: "N/A",
        quantity: 1,
        stock_available: product.stock || 0,
        unit_price: product.precio,
      };
      addItemToSelectedItems(newItem);
      setSelectedProduct(null);
    }
  };

  const handleVariantChange = (e) => {
    const variantId = parseInt(e.target.value);
    const variant = selectedProduct.variantes.find((item) => item.id === variantId);
    setSelectedVariant(variant);
  };

  const addItemToSelectedItems = (newItem) => {
    const existingItemIndex = selectedItems.findIndex(
      (item) => item.product_id === newItem.product_id && item.variant_id === newItem.variant_id
    );

    if (existingItemIndex > -1) {
      alert("Este producto/variante ya ha sido anadido a la lista de venta.");
    } else {
      setSelectedItems((prevItems) => [...prevItems, newItem]);
    }
  };

  const handleAddProductToCart = () => {
    if (!selectedProduct) return;

    if (selectedProduct.variantes && selectedProduct.variantes.length > 1 && !selectedVariant) {
      alert("Por favor, seleccione una variante antes de anadir.");
      return;
    }

    let itemToAddVariant = null;
    if (selectedProduct.variantes && selectedProduct.variantes.length === 1) {
      itemToAddVariant = selectedProduct.variantes[0];
    } else if (selectedVariant) {
      itemToAddVariant = selectedVariant;
    }

    const stockForNewItem = itemToAddVariant?.stock || selectedProduct.stock || 0;
    const priceForNewItem = selectedProduct.precio;

    const newItem = {
      product_id: selectedProduct.id,
      variant_id: itemToAddVariant?.id || null,
      product_name: selectedProduct.nombre,
      size: itemToAddVariant?.talla || "N/A",
      color: itemToAddVariant?.color || "N/A",
      quantity: 1,
      stock_available: stockForNewItem,
      unit_price: priceForNewItem,
    };

    addItemToSelectedItems(newItem);
    setSelectedProduct(null);
    setSelectedVariant(null);
  };

  const updateQuantity = (index, newQuantity) => {
    const updatedItems = [...selectedItems];
    const item = updatedItems[index];

    let quantityToSet = parseInt(newQuantity);
    if (isNaN(quantityToSet) || quantityToSet < 1) {
      quantityToSet = 1;
      setQuantityNotice({
        index,
        text: "La cantidad minima es 1.",
      });
    }
    if (quantityToSet > item.stock_available) {
      setQuantityNotice({
        index,
        text: `Solo hay ${item.stock_available} unidad${item.stock_available === 1 ? "" : "es"} disponible${item.stock_available === 1 ? "" : "s"}.`,
      });
      quantityToSet = item.stock_available;
    } else {
      setQuantityNotice(null);
    }

    item.quantity = quantityToSet;
    setSelectedItems(updatedItems);
  };

  const decreaseQuantity = (index) => {
    const currentItem = selectedItems[index];
    if (!currentItem || currentItem.quantity <= 1) {
      setQuantityNotice({
        index,
        text: "La cantidad minima es 1.",
      });
      return;
    }

    updateQuantity(index, currentItem.quantity - 1);
  };

  const increaseQuantity = (index) => {
    const currentItem = selectedItems[index];
    if (!currentItem || currentItem.quantity >= currentItem.stock_available) {
      if (currentItem) {
        setQuantityNotice({
          index,
          text: `Solo hay ${currentItem.stock_available} unidad${currentItem.stock_available === 1 ? "" : "es"} disponible${currentItem.stock_available === 1 ? "" : "s"}.`,
        });
      }
      return;
    }

    updateQuantity(index, currentItem.quantity + 1);
  };

  const removeItem = (index) => {
    if (quantityNotice?.index === index) {
      setQuantityNotice(null);
    }
    setSelectedItems(selectedItems.filter((_, itemIndex) => itemIndex !== index));
  };

  const total = selectedItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cedulaCliente.trim()) {
      alert("Por favor, ingrese la cedula del cliente.");
      return;
    }
    if (selectedItems.length === 0) {
      alert("Seleccione al menos un producto para registrar la venta.");
      return;
    }

    const detallesParaAPI = selectedItems.map((item) => ({
      variante_id: item.variant_id,
      cantidad: item.quantity,
      precio_unitario: item.unit_price,
    }));

    const saleData = {
      cedula_cliente: cedulaCliente,
      estado: saleStatus,
      detalles: detallesParaAPI,
    };

    try {
      const response = await fetch(`${API_URL}/sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saleData),
      });

      if (!response.ok) {
        const errorDetail = await response.text();
        let errorMessage = `Error al registrar la venta: ${response.status}`;
        try {
          const errorJson = JSON.parse(errorDetail);
          errorMessage = `Error al registrar la venta: ${errorJson.detail || JSON.stringify(errorJson)}`;
        } catch {
          errorMessage += ` - ${errorDetail}`;
        }
        throw new Error(errorMessage);
      }

      const registeredSale = await response.json();
      alert("Venta registrada con exito.");
      onAddSale(registeredSale);

      setCedulaCliente("");
      setSelectedItems([]);
      setSelectedProduct(null);
      setSelectedVariant(null);
      setSaleStatus("pendiente");
      setSearch("");
    } catch (error) {
      console.error("Error al registrar la venta:", error);
      alert(`No se pudo registrar la venta. Detalles: ${error.message}`);
    }
  };

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Nueva transaccion</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Registrar venta</h2>
          <p className="mt-2 text-sm text-slate-500">Carga rapida de cliente, estado y productos con un flujo mas limpio.</p>
        </div>
        <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
          Total actual: <span className="font-semibold text-slate-950">${total.toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div>
            <label htmlFor="cedulaCliente" className="mb-2 block text-sm font-medium text-slate-600">Cedula del cliente</label>
            <input
              id="cedulaCliente"
              type="text"
              placeholder="Ingrese la cedula del cliente"
              value={cedulaCliente}
              onChange={(e) => setCedulaCliente(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
              required
            />
          </div>
          <div>
            <label htmlFor="saleStatus" className="mb-2 block text-sm font-medium text-slate-600">Estado de la venta</label>
            <select
              id="saleStatus"
              value={saleStatus}
              onChange={(e) => setSaleStatus(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
            >
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </div>

        <div className="mt-8 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Catalogo</p>
            <h3 className="mt-2 text-lg font-semibold text-slate-950">Busqueda y seleccion de productos</h3>
          </div>
          <label htmlFor="productSearch" className="mb-2 mt-5 block text-sm font-medium text-slate-600">Buscar producto</label>
          <input
            id="productSearch"
            type="text"
            placeholder="Buscar por nombre del producto"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
          />

          {filteredProducts.length > 0 && (
            <ul className="relative z-10 mt-3 max-h-60 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5">
              {filteredProducts.map((product) => (
                <li
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className="flex cursor-pointer items-center justify-between gap-4 border-b border-slate-100 px-4 py-4 transition hover:bg-slate-50"
                >
                  <div>
                    <strong className="text-slate-900">{product.nombre}</strong> - ${product.precio.toFixed(2)}
                    <p className="text-sm text-slate-500">{product.descripcion}</p>
                  </div>
                  {product.variantes && product.variantes.length > 0 && (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {product.variantes.length} variantes
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}

          {selectedProduct && selectedProduct.variantes && selectedProduct.variantes.length > 1 && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
              <label htmlFor="variantSelect" className="mb-2 block text-sm font-medium text-slate-600">
                Seleccionar variante para "{selectedProduct.nombre}"
              </label>
              <select
                id="variantSelect"
                onChange={handleVariantChange}
                className="mb-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                value={selectedVariant?.id || ""}
              >
                <option value="">-- Selecciona una variante --</option>
                {selectedProduct.variantes.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    Talla: {variant.talla} - Color: {variant.color} (Stock: {variant.stock})
                  </option>
                ))}
              </select>
              {selectedVariant && (
                <p className="mt-2 text-sm text-slate-500">
                  Variante seleccionada: <span className="font-semibold">{selectedVariant.talla}</span> - <span className="font-semibold">{selectedVariant.color}</span> (Stock actual: <span className="font-semibold">{selectedVariant.stock}</span>)
                </p>
              )}
              <button
                type="button"
                onClick={handleAddProductToCart}
                disabled={!selectedVariant}
                className={`mt-4 w-full rounded-2xl py-3 text-sm font-semibold transition-colors duration-200 ${
                  !selectedVariant ? "cursor-not-allowed bg-slate-300 text-slate-500" : "bg-slate-950 text-white hover:bg-slate-800"
                }`}
              >
                Anadir variante
              </button>
            </div>
          )}

          {selectedProduct && (!selectedProduct.variantes || selectedProduct.variantes.length <= 1) && (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
              <p className="mb-3 font-semibold text-emerald-900">
                "{selectedProduct.nombre}" (sin variantes o variante unica) ha sido anadido directamente.
              </p>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Cerrar mensaje
              </button>
            </div>
          )}
        </div>

        {selectedItems.length > 0 && (
          <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <h3 className="mb-3 text-lg font-semibold text-slate-950">Items en la venta ({selectedItems.length})</h3>
            <ul className="space-y-3">
              {selectedItems.map((item, index) => (
                <li
                  key={`${item.product_id}-${item.variant_id || "no-variant"}-${index}`}
                  className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
                >
                  <div className="flex-1 mb-2 sm:mb-0">
                    <span className="font-semibold text-slate-900">{item.product_name}</span>
                    <span className="ml-2 text-sm text-slate-500">
                      ({item.size !== "N/A" ? item.size : "Talla unica"}, {item.color !== "N/A" ? item.color : "Color unico"})
                    </span>
                    <br />
                    <span className="text-sm text-slate-600">
                      Precio Unitario: <span className="font-bold">${item.unit_price.toFixed(2)}</span> | Stock disponible: {item.stock_available}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                    <label htmlFor={`quantity-${index}`} className="sr-only">Cantidad</label>
                    <button
                      type="button"
                      onClick={() => decreaseQuantity(index)}
                      className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-200"
                      aria-label={`Disminuir cantidad de ${item.product_name}`}
                      title="Disminuir cantidad"
                    >
                      -
                    </button>
                    <input
                      id={`quantity-${index}`}
                      type="number"
                      value={item.quantity}
                      min="1"
                      max={item.stock_available}
                      onChange={(e) => updateQuantity(index, parseInt(e.target.value))}
                      className="hide-number-spin w-20 rounded-2xl border border-slate-200 px-3 py-2 text-center text-slate-800 outline-none transition focus:border-slate-400"
                      aria-label={`Cantidad de ${item.product_name}`}
                    />
                    <button
                      type="button"
                      onClick={() => increaseQuantity(index)}
                      className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-200"
                      aria-label={`Aumentar cantidad de ${item.product_name}`}
                      title="Aumentar cantidad"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="rounded-2xl bg-rose-600 p-2 text-white transition-colors duration-200 hover:bg-rose-700"
                      aria-label={`Remover ${item.product_name}`}
                    >
                      X
                    </button>
                    </div>
                    {quantityNotice?.index === index && (
                      <p className="text-xs font-medium text-amber-700">{quantityNotice.text}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 rounded-[24px] border border-blue-100 bg-blue-50 p-5 text-right shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-700">Resumen</p>
          <h3 className="mt-2 text-3xl font-semibold text-slate-950">${total.toFixed(2)}</h3>
        </div>

        <button
          type="submit"
          disabled={!cedulaCliente.trim() || selectedItems.length === 0}
          className={`mt-6 w-full rounded-2xl py-4 text-base font-semibold transition-colors duration-200 ${
            !cedulaCliente.trim() || selectedItems.length === 0
              ? "cursor-not-allowed bg-slate-300 text-slate-500"
              : "bg-slate-950 text-white hover:bg-slate-800"
          }`}
        >
          Confirmar venta
        </button>
      </form>
    </section>
  );
};

export default CreateSale;