import { motion } from "framer-motion";
import StorePage from "../components/ShopCategories";

const Products = () => {
    return (
        <div className="min-h-screen bg-white pt-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
            >
                {/* Header Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                        Nuestros Productos
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Descubre nuestra amplia colección de ropa y accesorios. 
                        Encuentra el estilo perfecto para cada ocasión.
                    </p>
                </motion.div>

                {/* Store Content */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    <StorePage />
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Products;
