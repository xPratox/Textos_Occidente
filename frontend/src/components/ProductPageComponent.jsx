import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Star, 
  Minus, 
  Plus, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Package,
  Truck,
  Shield
} from "lucide-react";

const ProductPageComponent = () => {
  const API_URL = import.meta.env.VITE_API_URL; // Nueva constante para la URL de la API
  const { productId } = useParams();
  const id = parseInt(productId, 10);
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const getImageUrl = useCallback((imagePath) => {
    if (!imagePath) {
      return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23e5e7eb'/%3E%3Ctext x='50%' y='50%' font-family='sans-serif' font-size='10' text-anchor='middle' dominant-baseline='middle' fill='%236b7280'%3ENo Image%3C/text%3E%3C/svg%3E";
    }
    const cleanPath = imagePath.startsWith('images/') ? imagePath : `images/${imagePath}`;
    const fullUrl = `${API_URL}/static/${cleanPath}`;
    return fullUrl;
  }, [API_URL]);

  const handleImageError = useCallback((e) => {
    e.target.onerror = null;
    e.target.src = getImageUrl(null);
  }, [getImageUrl]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const apiUrl = `${API_URL}/products/${id}`;

    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Producto no encontrado o error en el servidor - Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const variantes = data.variantes || [];
        const sizes = [...new Set(variantes.map(v => v.talla))];
        const colors = [...new Set(variantes.map(v => v.color))];

        setProduct({
          ...data,
          sizes,
          colors
        });

        setSelectedSize(sizes.length > 0 ? sizes[0] : null);
        setSelectedColor(colors.length > 0 ? colors[0] : null);
        setCurrentImage(getImageUrl(data.image_url));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar el producto:", err);
        setError(err);
        setLoading(false);
      });
  }, [id, getImageUrl, API_URL]);

  const handleAddToCart = () => {
    if (!product || !selectedSize || !selectedColor) {
      alert("Por favor, selecciona talla y color.");
      return;
    }

    const selectedVariant = product.variantes.find(
      (v) => v.talla === selectedSize && v.color === selectedColor
    );

    if (!selectedVariant) {
      alert("Variante no disponible. Intente otra combinación.");
      return;
    }

    if (quantity <= 0) {
      alert("La cantidad debe ser mayor que cero.");
      return;
    }

    if (selectedVariant.stock < quantity) {
      alert(`No hay suficiente stock. Solo quedan ${selectedVariant.stock} unidades.`);
      return;
    }

    addToCart(product, quantity, selectedVariant.id);
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 3000);
  };

  const handleQuantityChange = (newQuantity) => {
    const qty = Math.max(1, Math.min(99, newQuantity));
    setQuantity(qty);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto text-center py-20"
      >
        <div className="bg-white rounded-2xl shadow-lg p-12">
          <div className="text-6xl mb-6">😞</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Error al cargar el producto</h2>
          <p className="text-gray-600 mb-8">{error.message}</p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link 
              to="/" 
              className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Regresar a la Página Principal</span>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (!product) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto text-center py-20"
      >
        <div className="bg-white rounded-2xl shadow-lg p-12">
          <div className="text-6xl mb-6">📦</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Producto no disponible</h2>
          <p className="text-gray-600 mb-8">No se encontraron datos para este producto.</p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link 
              to="/" 
              className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Regresar a la Página Principal</span>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  const selectedVariant = product.variantes?.find(
    (v) => v.talla === selectedSize && v.color === selectedColor
  );

  return (
    <motion.div 
      className="max-w-7xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Breadcrumb */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <Link to="/" className="hover:text-indigo-600 transition-colors">Inicio</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-indigo-600 transition-colors">Productos</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.nombre}</span>
        </nav>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="aspect-square relative group">
              <img
                src={currentImage}
                alt={product.nombre}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={handleImageError}
              />
              
              {/* Image Actions */}
              <div className="absolute top-4 right-4 flex flex-col space-y-2">
                <motion.button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`p-3 rounded-full shadow-lg transition-all duration-300 ${
                    isFavorite 
                      ? 'bg-red-500 text-white' 
                      : 'bg-white text-gray-600 hover:text-red-500'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </motion.button>
                
                <motion.button
                  className="p-3 bg-white text-gray-600 rounded-full shadow-lg hover:text-indigo-600 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Share2 className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="space-y-8"
        >
          {/* Product Header */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.nombre}</h1>
            
            {/* Categories */}
            {product.categorias && product.categorias.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {product.categorias.map((category, index) => (
                  <span
                    key={category.id || index}
                    className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            )}
            
            {/* Rating */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="text-gray-600 text-sm">(4.8) • 124 reseñas</span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4 mb-6">
              <span className="text-4xl font-bold text-indigo-600">
                ${product.precio ? product.precio.toFixed(2) : 'N/A'}
              </span>
              {selectedVariant && (
                <span className="text-sm text-gray-500">
                  Stock: {selectedVariant.stock} unidades
                </span>
              )}
            </div>
          </div>

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Talla</h3>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <motion.button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                      selectedSize === size
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Color</h3>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => (
                  <motion.button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                      selectedColor === color
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {color}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Add to Cart */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Cantidad</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <motion.button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="p-3 hover:bg-gray-100 transition-colors duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Minus className="w-4 h-4 text-gray-600" />
                  </motion.button>
                  
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-20 text-center border-0 focus:ring-0 focus:outline-none py-3"
                    min="1"
                    max="99"
                  />
                  
                  <motion.button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="p-3 hover:bg-gray-100 transition-colors duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Plus className="w-4 h-4 text-gray-600" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="relative">
              <motion.button
                onClick={handleAddToCart}
                disabled={!selectedSize || !selectedColor}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
                  !selectedSize || !selectedColor
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                }`}
                whileHover={selectedSize && selectedColor ? { scale: 1.02 } : {}}
                whileTap={selectedSize && selectedColor ? { scale: 0.98 } : {}}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Agregar al Carrito</span>
              </motion.button>

              {/* Confirmation Message */}
              <AnimatePresence>
                {showConfirmation && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>¡Producto agregado al carrito!</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Product Description */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Descripción</h3>
            <p className="text-gray-600 leading-relaxed">{product.descripcion}</p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
              <Truck className="w-6 h-6 text-indigo-600" />
              <div>
                <p className="font-semibold text-gray-900">Envío Gratis</p>
                <p className="text-sm text-gray-600">En compras +$50</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
              <Package className="w-6 h-6 text-indigo-600" />
              <div>
                <p className="font-semibold text-gray-900">Devolución</p>
                <p className="text-sm text-gray-600">30 días gratis</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
              <Shield className="w-6 h-6 text-indigo-600" />
              <div>
                <p className="font-semibold text-gray-900">Garantía</p>
                <p className="text-sm text-gray-600">1 año</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProductPageComponent;