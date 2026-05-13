import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import CartList from "./CartList";
import CartSummary from "./CartSummary";
import { useCart } from "../context/CartContext";

const CartComponent = () => {
  const { cartItems, confirmation } = useCart();
  const total = cartItems.reduce((acc, item) => acc + (item.precio || 0) * item.quantity, 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto relative">
      {/* Confirmation Message */}
      <AnimatePresence>
        {confirmation && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{confirmation}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {cartItems.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center py-20"
        >
          <div className="bg-coldgray rounded-2xl shadow-lg p-12 max-w-md mx-auto">
            <div className="text-6xl mb-6">🛒</div>
            <h3 className="text-2xl font-bold text-navy mb-4">Tu carrito está vacío</h3>
            <p className="text-coldgrayDark mb-8">
              Parece que no has agregado ningún producto a tu carrito aún.
            </p>
            <motion.a
              href="/products"
              className="inline-flex items-center space-x-2 bg-navy hover:bg-blue-800 text-coldgray px-6 py-3 rounded-lg font-semibold transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Explorar Productos</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.a>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Cart Items */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <CartList cartItems={cartItems} />
          </motion.div>

          {/* Cart Summary */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <CartSummary total={total} cartItems={cartItems} />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default CartComponent;
