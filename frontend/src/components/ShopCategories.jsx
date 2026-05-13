import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductList from "./ProductList";
import { useLocation } from "react-router-dom";

const ITEMS_PER_PAGE = 6;

const StorePage = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productRes, categoryRes] = await Promise.all([
          fetch(`${API_URL}/products`),
          fetch(`${API_URL}/categorias`)
        ]);

        if (!productRes.ok || !categoryRes.ok) {
          throw new Error('Error al cargar los datos');
        }

        const [productData, categoryData] = await Promise.all([
          productRes.json(),
          categoryRes.json()
        ]);

        setProducts(productData || []);
        setFilteredProducts(productData || []);
        setCategories(categoryData || []);
        setError(null);
      } catch (err) {
        setError(err.message || String(err));
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_URL]);

  // Aplicar categoría desde query param o desde location.state cuando cambien categories o location
  useEffect(() => {
    if (!categories || categories.length === 0) return;

    // preferir query param, si no existe usar location.state
    let rawCategory = new URLSearchParams(location.search).get("category");
    if (!rawCategory && location.state && (location.state.category || location.state.categoryName)) {
      rawCategory = location.state.category || location.state.categoryName;
    }
    if (!rawCategory) return;

    const decoded = decodeURIComponent(rawCategory);
    const normalize = (s) => (s ? String(s).trim().toLowerCase() : "");
    const target = normalize(decoded);

    // Buscar match robusto en varios campos posibles
    const matched = categories.find((c) => {
      const candidates = [
        c.name,
        c.nombre,
        c.title,
        c.slug,
        c.id ? String(c.id) : null
      ].filter(Boolean);
      return candidates.some(val => normalize(val) === target);
    });

    if (matched) {
      setSelectedCategories([matched]);
      setSelectedCategory(matched);
    }
  }, [location.search, location.state, categories]);

  useEffect(() => {
    let filtered = products;

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((p) => {
        // Si producto tiene arreglo p.categorias (objetos)
        if (p.categorias && Array.isArray(p.categorias)) {
          return p.categorias.some(productCategory =>
            selectedCategories.some(selectedCat =>
              // comparar por name/nombre/slug/id
              (productCategory.name || productCategory.nombre || String(productCategory.id || "")).toString() === (selectedCat.name || selectedCat.nombre || String(selectedCat.id || ""))
            )
          );
        }

        // Fallbacks para distintas estructuras
        let productCategory = null;
        if (typeof p.category === "string") {
          productCategory = p.category;
        } else if (p.category && typeof p.category === "object") {
          productCategory = p.category.name || p.category.nombre;
        } else if (p.categoria) {
          productCategory = typeof p.categoria === "string" ? p.categoria : p.categoria.name;
        }

        if (productCategory == null) return false;

        return selectedCategories.some(selectedCat => {
          const selName = selectedCat.name || selectedCat.nombre || String(selectedCat.id || "");
          return String(productCategory) === String(selName);
        });
      });
    }

    if (searchTerm) {
      filtered = filtered.filter((p) =>
        (p.nombre || "").toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, selectedCategories, searchTerm]);

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => {
      const isSelected = prev.some(cat => String(cat.id) === String(category.id) || (cat.name && category.name && cat.name === category.name));
      if (isSelected) {
        const next = prev.filter(cat => !(String(cat.id) === String(category.id) || (cat.name && category.name && cat.name === category.name)));
        setSelectedCategory(next.length === 1 ? next[0] : null);
        return next;
      } else {
        setSelectedCategory(category);
        return [...prev, category];
      }
    });
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedCategory(null);
    setSearchTerm("");
  };

  const totalPages = Math.ceil((filteredProducts.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = (filteredProducts || []).slice(startIndex, startIndex + ITEMS_PER_PAGE);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">😞</div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Error al cargar productos</h3>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar - Categories */}
        <motion.aside variants={itemVariants} className="lg:col-span-1">
          <div className="bg-coldgray rounded-2xl shadow-lg p-6 sticky top-24">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <span className="text-2xl mr-2">🏷️</span>
              Categorías
            </h2>
            <div className="space-y-2">
              <motion.button
                onClick={() => { setSelectedCategory(null); setSelectedCategories([]); }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 ${
                  selectedCategory === null && selectedCategories.length === 0
                    ? 'bg-indigo-100 text-indigo-600 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <span className="flex items-center justify-between">
                  <span>Todas las categorías</span>
                  <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {products.length}
                  </span>
                </span>
              </motion.button>

              {categories.map((cat, index) => {
                const displayName = cat.name || cat.nombre || cat.title || String(cat.id);
                const categoryCount = products.filter(p => {
                  if (p.categorias && Array.isArray(p.categorias)) {
                    return p.categorias.some(productCategory => {
                      const pcName = productCategory.name || productCategory.nombre || String(productCategory.id || "");
                      return String(pcName) === String(displayName);
                    });
                  }

                  let productCategory = null;
                  if (typeof p.category === "string") {
                    productCategory = p.category;
                  } else if (p.category && typeof p.category === "object") {
                    productCategory = p.category.name || p.category.nombre;
                  } else if (p.categoria) {
                    productCategory = typeof p.categoria === "string" ? p.categoria : p.categoria.name;
                  }
                  return String(productCategory) === String(displayName);
                }).length;

                const isSelected = selectedCategories.some(selectedCat => String(selectedCat.id) === String(cat.id) || (selectedCat.name && cat.name && selectedCat.name === cat.name));

                return (
                  <motion.button
                    key={cat.id ?? `${cat.name}-${index}`}
                    onClick={() => handleCategoryToggle(cat)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 ${
                      isSelected
                        ? 'bg-indigo-100 text-indigo-600 font-semibold'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                  >
                    <span className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        {isSelected && <span className="text-indigo-600">✓</span>}
                        {displayName}
                      </span>
                      <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs">
                        {categoryCount}
                      </span>
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <motion.main variants={itemVariants} className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <motion.button
                onClick={clearAllFilters}
                className="px-6 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all duration-300 font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Limpiar Filtros
              </motion.button>
            </div>

            {/* Results Info */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Mostrando {paginatedProducts.length} de {filteredProducts.length} productos
                {totalPages > 1 && ` (Página ${currentPage} de ${totalPages})`}
              </p>
              {selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map((category) => (
                    <span
                      key={category.id ?? category.name}
                      className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {category.name || category.nombre || category.title || String(category.id)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Products Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedCategories.map(c => c.id || c.name).join(',')}-${searchTerm}-${currentPage}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ProductList products={paginatedProducts} />
            </motion.div>
          </AnimatePresence>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              className="bg-white rounded-2xl shadow-lg p-6 mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="text-center">
                  <p className="text-gray-600 text-sm">
                    Página {currentPage} de {totalPages} • {filteredProducts.length} productos total
                  </p>
                </div>

                <div className="flex justify-center items-center space-x-2">
                  <motion.button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 shadow-md'
                    }`}
                    whileHover={currentPage !== 1 ? { scale: 1.05 } : {}}
                    whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Anterior</span>
                  </motion.button>

                  {/* Page Numbers */}
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 7) {
                        pageNum = i + 1;
                      } else if (currentPage <= 4) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 3) {
                        pageNum = totalPages - 6 + i;
                      } else {
                        pageNum = currentPage - 3 + i;
                      }

                      if (pageNum < 1 || pageNum > totalPages) return null;

                      return (
                        <motion.button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 rounded-lg font-medium transition-all duration-300 ${
                            currentPage === pageNum
                              ? 'bg-indigo-600 text-white shadow-lg'
                              : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 shadow-md'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ duration: 0.2, delay: i * 0.05 }}
                        >
                          {pageNum}
                        </motion.button>
                      );
                    })}
                  </div>

                  <motion.button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 shadow-md'
                    }`}
                    whileHover={currentPage !== totalPages ? { scale: 1.05 } : {}}
                    whileTap={currentPage !== totalPages ? { scale: 0.95 } : {}}
                  >
                    <span>Siguiente</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.main>
      </div>
    </motion.div>
  );
};

export default StorePage;
