import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LogoutButton from "./LogoutBtn";
import BrandLogo from "./BrandLogo";

const Navbar = () => {
  const { cedula, userRole, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 500);
  }, [cedula]);

  if (isLoading) {
    return (
      <div className="h-20 bg-navy"></div>
    );
  }

  const navItems = [
    { path: "/", label: "Inicio", icon: "🏫" },
    { path: "/products", label: "Productos", icon: "📚" },
    { path: "/cart", label: "Carrito", icon: "🗂️" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-navy shadow-lg"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 transition-all duration-300 hover:transform hover:scale-105"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 shadow-sm">
              <BrandLogo className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              Textos Occidente
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 hover:transform hover:-translate-y-0.5 ${
                  isActive(item.path)
                    ? 'bg-navyLight text-white'
                    : 'text-white/80 hover:text-white hover:bg-navyLight/60'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}

            {/* Auth Section */}
            <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-white/20">
              {!isAuthenticated ? (
                <Link
                  to="/login"
                  className="rounded-full bg-white px-6 py-2 font-semibold text-navy transition-all duration-300 hover:scale-105 hover:bg-coldgray"
                >
                  Iniciar Sesión
                </Link>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/perfil"
                    className="flex items-center space-x-2 rounded-lg px-4 py-2 text-white/80 transition-all duration-300 hover:-translate-y-0.5 hover:bg-navyLight/60 hover:text-white"
                  >
                    <span className="text-lg">🧑‍🎓</span>
                    <span className="font-medium">Perfil</span>
                  </Link>
                  
                  {userRole === 'admin' || userRole === 'manager' ? (
                    <Link
                      to="/admin"
                      className="flex items-center space-x-2 rounded-lg bg-navyLight px-4 py-2 text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-600"
                    >
                      <span className="text-lg">🗃️</span>
                      <span className="font-medium">Admin</span>
                    </Link>
                  ) : null}
                  
                  <LogoutButton />
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="rounded-lg p-2 text-white md:hidden"
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <div className="flex h-6 w-6 flex-col justify-center space-y-1 text-white">
              <span className={`block h-0.5 w-6 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
              <span className={`block h-0.5 w-6 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block h-0.5 w-6 bg-current transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-navyLight bg-navy md:hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                      isActive(item.path)
                        ? 'bg-navyLight text-white'
                        : 'text-white/80 hover:text-white hover:bg-navyLight/60'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </motion.div>
              ))}
              
              <div className="border-t border-white/10 pt-4">
                {!isAuthenticated ? (
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full rounded-lg bg-navyLight px-4 py-3 text-center font-semibold text-white transition-colors duration-300 hover:bg-slate-600"
                  >
                    Iniciar Sesión
                  </Link>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/perfil"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 rounded-lg px-4 py-3 text-white/80 transition-colors duration-300 hover:bg-navyLight/60 hover:text-white"
                    >
                      <span className="text-xl">🧑‍🎓</span>
                      <span className="font-medium">Perfil</span>
                    </Link>
                    {userRole === 'admin' || userRole === 'manager' ? (
                      <Link
                        to="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 rounded-lg px-4 py-3 text-white/80 transition-colors duration-300 hover:bg-navyLight/60 hover:text-white"
                      >
                        <span className="text-xl">🗃️</span>
                        <span className="font-medium">Admin</span>
                      </Link>
                    ) : null}
                    <div className="px-4">
                      <LogoutButton />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;