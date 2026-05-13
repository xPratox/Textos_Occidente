import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import CartItem from "./CartItem";

const CartList = ({ cartItems, updateQuantity }) => {
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
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.5
            }
        },
        exit: {
            opacity: 0,
            x: 20,
            transition: {
                duration: 0.3
            }
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <span className="text-2xl mr-3">🛒</span>
                    Productos en tu carrito
                </h2>
                <p className="text-gray-600 mt-2">
                    {cartItems.length} {cartItems.length === 1 ? 'producto' : 'productos'} seleccionados
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Producto
                            </th>
                            <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Precio
                            </th>
                            <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Cantidad
                            </th>
                            <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Subtotal
                            </th>
                            <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        <AnimatePresence>
                            {cartItems.map((item, index) => (
                                <motion.tr
                                    key={item.id}
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    transition={{ delay: index * 0.1 }}
                                    className="hover:bg-gray-50 transition-colors duration-200"
                                >
                                    <CartItem item={item} updateQuantity={updateQuantity} />
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {cartItems.length === 0 && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-12 text-center"
                >
                    <div className="text-4xl mb-4">📦</div>
                    <p className="text-gray-500">No hay productos en tu carrito</p>
                </motion.div>
            )}
        </div>
    );
};

export default CartList;
