import React, { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Plus, Minus } from "lucide-react";
import { useCart } from "../context/CartContext";

const CartItem = ({ item }) => {
  const API_URL = import.meta.env.VITE_API_URL; // Nueva constante para la URL de la API
  const { removeFromCart, updateQuantity } = useCart();
  const [quantity, setQuantity] = useState(item.quantity);

  const handleQuantityChange = (newQuantity) => {
    const qty = Math.max(1, Math.min(99, newQuantity));
    setQuantity(qty);
    if (updateQuantity) {
      updateQuantity(item.id, qty);
    }
  };

  const handleRemove = () => {
    removeFromCart(item.id);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23e5e7eb'/%3E%3Ctext x='50%' y='50%' font-family='sans-serif' font-size='10' text-anchor='middle' dominant-baseline='middle' fill='%236b7280'%3ENo Image%3C/text%3E%3C/svg%3E";
    }
    const cleanPath = imagePath.startsWith('images/') ? imagePath : `images/${imagePath}`;
    return `${API_URL}/static/${cleanPath}`;
  };

  return (
    <>
      {/* Product Info */}
      <td className="px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <img
              src={getImageUrl(item.image)}
              alt={item.name}
              className="w-16 h-16 object-cover rounded-lg"
              onError={(e) => {
                e.target.src = getImageUrl(null);
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {item.name}
            </h3>
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
              <span className="flex items-center">
                <span className="font-medium">Talla:</span>
                <span className="ml-1 px-2 py-1 bg-gray-100 rounded text-xs">
                  {item.talla}
                </span>
              </span>
              <span className="flex items-center">
                <span className="font-medium">Color:</span>
                <span className="ml-1 px-2 py-1 bg-gray-100 rounded text-xs">
                  {item.color}
                </span>
              </span>
            </div>
          </div>
        </div>
      </td>

      {/* Price */}
      <td className="px-6 py-4 text-center">
        <span className="text-lg font-semibold text-gray-900">
          ${item.precio?.toFixed(2) || '0.00'}
        </span>
      </td>

      {/* Quantity Controls */}
      <td className="px-6 py-4 text-center">
        <div className="flex items-center justify-center space-x-2">
          <motion.button
            onClick={() => handleQuantityChange(quantity - 1)}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Minus className="w-4 h-4 text-gray-600" />
          </motion.button>
          
          <input
            type="number"
            className="w-16 text-center border border-gray-300 rounded-lg py-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={quantity}
            min="1"
            max="99"
            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
          />
          
          <motion.button
            onClick={() => handleQuantityChange(quantity + 1)}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </motion.button>
        </div>
      </td>

      {/* Subtotal */}
      <td className="px-6 py-4 text-center">
        <span className="text-lg font-bold text-indigo-600">
          ${((item.precio || 0) * quantity).toFixed(2)}
        </span>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 text-center">
        <motion.button
          onClick={handleRemove}
          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Eliminar del carrito"
        >
          <Trash2 className="w-5 h-5" />
        </motion.button>
      </td>
    </>
  );
};

export default CartItem;
