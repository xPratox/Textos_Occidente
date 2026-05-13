import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';

const LogoutButton = () => {
    const { logout, isAuthenticated } = useAuth();

    if (!isAuthenticated) return null;

    return (
        <motion.button 
            onClick={logout} 
            className="flex items-center gap-3 px-4 py-2 text-white transition-all duration-300 font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-slate-100 ring-1 ring-white/10">
                <LogOut className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
            <span>Cerrar Sesión</span>
        </motion.button>
    );
};

export default LogoutButton;
