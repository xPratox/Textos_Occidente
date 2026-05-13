// ProductCard.jsx
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const API_URL = import.meta.env.VITE_API_URL; // Nueva constante para la URL de la API
  const navigate = useNavigate();

  const referenceCode = product.codigo_referencia || `TX-${String(product.id).padStart(3, "0")}`;
  const minimumPack = product.unidad_empaque || product.packaging_unit || "1 unidad";
  const summary = product.descripcion || "Referencia disponible para gestión comercial, reposición institucional y compra por volumen.";

  // Esta función es la que genera la URL COMPLETA y correcta para la imagen.
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23e5e7eb'/%3E%3Ctext x='50%' y='50%' font-family='sans-serif' font-size='10' text-anchor='middle' dominant-baseline='middle' fill='%236b7280'%3ENo Image%3C/text%3E%3C/svg%3E";
    }
    const cleanPath = imagePath.startsWith('images/') ? imagePath : `images/${imagePath}`;
    const fullUrl = `${API_URL}/static/${cleanPath}`;
    return fullUrl;
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = getImageUrl(null);
  };

  return (
    <motion.div 
      className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative h-56 overflow-hidden border-b border-slate-200 bg-coldgray">
        <img
          src={getImageUrl(product.image_url)}
          alt={product.nombre}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
          onClick={() => navigate(`/product/${product.id}`)}
          onError={handleImageError}
        />
        <div className="absolute left-4 top-4 rounded-full bg-navy px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-sm">
          {referenceCode}
        </div>
      </div>

      <div className="p-6">
        <div className="mb-3 flex flex-wrap gap-2">
          {product.categorias && product.categorias.length > 0 ? (
            product.categorias.map((category, index) => (
              <span
                key={category.id || index}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-coldgrayDark"
              >
                {category.name}
              </span>
            ))
          ) : (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-coldgrayDark">
              Referencia comercial
            </span>
          )}
        </div>

        <h3 
          className="mb-3 cursor-pointer text-xl font-bold text-slate-900 transition-colors duration-300 hover:text-navy"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          {product.nombre}
        </h3>

        <p className="mb-5 min-h-20 text-sm leading-6 text-coldgrayDark">
          {summary}
        </p>

        <div className="mb-5 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4 text-left">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-coldgrayDark">Empaque mín.</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{minimumPack}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-coldgrayDark">Referencia</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{referenceCode}</p>
          </div>
        </div>

        <div className="mb-5 flex items-center justify-between border-t border-slate-200 pt-4">
          <span className="text-2xl font-bold text-navy">
            ${product.precio?.toFixed(2) || 'N/A'}
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-coldgrayDark">
            Compra institucional
          </span>
        </div>

        <motion.button
          className="w-full rounded-xl bg-navy px-4 py-3 font-semibold text-white transition-all duration-300 hover:bg-navyLight"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate(`/product/${product.id}`)}
        >
          Ver ficha técnica
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProductCard;