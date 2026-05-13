// ProductList.jsx
import React from "react";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";

const API_URL = import.meta.env.VITE_API_URL; // Nueva constante para la URL de la API

const ProductList = ({ products }) => {
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
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const fetchProducts = async () => {
    const response = await fetch(`${API_URL}/products`); // Llamada a la API actualizada
    const data = await response.json();
    return data;
  };

  if (!products || products.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-20 text-center">
        <div className="mb-4 text-6xl">📦</div>
        <h3 className="mb-2 text-xl font-semibold text-slate-700">No hay referencias disponibles</h3>
        <p className="text-coldgrayDark">Actualiza el catálogo para mostrar nuevas líneas comerciales.</p>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          variants={itemVariants}
          whileHover={{ y: -5 }}
          transition={{ duration: 0.3 }}
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ProductList;