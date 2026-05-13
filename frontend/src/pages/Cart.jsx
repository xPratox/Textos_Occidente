import { motion } from "framer-motion";
import CartComponent from "../components/CartComponent";

const Cart = () => {
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
                        Tu Carrito de Compras
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Revisa tus productos seleccionados y procede al checkout
                    </p>
                </motion.div>

                {/* Cart Content */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    <CartComponent />
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Cart;