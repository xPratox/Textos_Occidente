import { motion } from "framer-motion";
import ProductPageComponent from "../components/ProductPageComponent";

const ProductPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
            >
                <ProductPageComponent />
            </motion.div>
        </div>
    );
};

export default ProductPage;