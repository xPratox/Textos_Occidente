import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL; // Nueva constante para la URL de la API

const BtnVerTienda = () => {
    const handleButtonClick = async () => {
        const response = await fetch(`${API_URL}/store-info`); // Llamada a la API actualizada
        const data = await response.json();
        // ...handle data...
    };

    return (
        <div className="w-full text-center py-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
            >
                <Link to={"/products"}>
                    <motion.button
                        className="rounded-full border border-navy bg-white px-12 py-4 text-lg font-bold text-navy shadow-sm transition-all duration-300 hover:bg-navy hover:text-white hover:shadow-xl"
                        whileHover={{ 
                            scale: 1.05,
                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                        }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        onClick={handleButtonClick}
                    >
                        <span className="flex items-center">
                            Explorar catálogo mayorista
                            <svg 
                                className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </span>
                    </motion.button>
                </Link>
            </motion.div>
        </div>
    );
}

export default BtnVerTienda;