import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaFacebook, FaInstagram, FaWhatsapp, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import BrandLogo from "./BrandLogo";

const Footer = () => {
  const currentYear = new Date().getFullYear();

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

  const socialLinks = [
    { icon: FaFacebook, href: "https://facebook.com", color: "hover:text-blue-400", label: "Facebook" },
    { icon: FaInstagram, href: "https://instagram.com", color: "hover:text-pink-400", label: "Instagram" },
    { icon: FaWhatsapp, href: "https://wa.me/5841447471668", color: "hover:text-green-400", label: "WhatsApp" }
  ];

  const categories = [
    { name: "Línea de Escritura y Corrección", path: "/products?category=L%C3%ADnea%20de%20Escritura%20y%20Correcci%C3%B3n" },
    { name: "Textos Escolares", path: "/products?category=Textos%20Escolares" },
    { name: "Suministros de Oficina", path: "/products?category=Suministros%20de%20Oficina" },
    { name: "Arte y Dibujo", path: "/products?category=Arte%20y%20Dibujo" }
  ];

  const quickLinks = [
    { name: "Inicio", path: "/" },
    { name: "Catálogo Mayorista", path: "/products" },
    { name: "Carrito", path: "/cart" },
    { name: "Perfil", path: "/perfil" }
  ];

  return (
    <footer className="bg-navy text-coldgray relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-coldgray/10 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-coldgray/10 rounded-full -translate-y-48 translate-x-48"></div>
      </div>

      <div className="relative z-10">
        <motion.div 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            
            {/* Brand Section */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-coldgray/15 ring-1 ring-white/10">
                  <BrandLogo className="h-8 w-8 text-white" simplified />
                </div>
                <h2 className="text-3xl font-bold">Textos Occidente</h2>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Tu aliado líder en el suministro de textos y papelería en la región. Solidez institucional y eficiencia logística.
              </p>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-gray-400 ${social.color} text-2xl transition-all duration-300`}
                    whileHover={{ scale: 1.2, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    aria-label={social.label}
                  >
                    <social.icon />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Categories Section */}
            <motion.div variants={itemVariants}>
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <span className="text-2xl mr-2">🛍️</span>
                Categorías
              </h3>
              <ul className="space-y-3">
                {categories.map((category, index) => (
                  <motion.li
                    key={category.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link 
                      to={category.path} 
                      className="text-gray-300 hover:text-white transition-all duration-300 flex items-center group"
                    >
                      <span className="w-2 h-2 bg-indigo-400 rounded-full mr-3 group-hover:bg-white transition-colors duration-300"></span>
                      {category.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Quick Links Section */}
            <motion.div variants={itemVariants}>
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <span className="text-2xl mr-2">🔗</span>
                Enlaces Rápidos
              </h3>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <motion.li
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link 
                      to={link.path} 
                      className="text-gray-300 hover:text-white transition-all duration-300 flex items-center group"
                    >
                      <span className="w-2 h-2 bg-indigo-400 rounded-full mr-3 group-hover:bg-white transition-colors duration-300"></span>
                      {link.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Contact Section */}
            <motion.div variants={itemVariants}>
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <span className="text-2xl mr-2">📞</span>
                Contacto
              </h3>
              <div className="space-y-4">
                <motion.div 
                  className="flex items-center space-x-3"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaPhone className="text-indigo-400 text-lg" />
                  <a href="https://wa.me/5841447471668" className="text-gray-300 hover:text-white transition-colors duration-300">
                    0414.747.1668
                  </a>
                </motion.div>
                
                <motion.div 
                  className="flex items-center space-x-3"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaEnvelope className="text-indigo-400 text-lg" />
                  <a href="mailto:contacto@textosoccidentes.com" className="text-gray-300 hover:text-white transition-colors duration-300">
                    contacto@textosoccidentes.com
                  </a>
                </motion.div>
                
                <motion.div 
                  className="flex items-center space-x-3"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaMapMarkerAlt className="text-indigo-400 text-lg" />
                  <span className="text-gray-300">Venezuela</span>
                </motion.div>
              </div>

              {/* WhatsApp CTA */}
              <br />

                <a
                  href="https://wa.me/5841447471668"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Abrir WhatsApp en nueva pestaña"
                  onClick={(e) => {
                    // Fallback: abrir con window.open si el navegador o algún handler previene la navegación por defecto
                    if (e && e.preventDefault) {
                      e.preventDefault();
                    }
                    window.open("https://wa.me/5841447471668", "_blank", "noopener,noreferrer");
                  }}
                  className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-300"
                >
                  <FaWhatsapp className="text-lg" />
                  <span className="font-semibold">WhatsApp</span>
                </a>

            </motion.div>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div 
          className="border-t border-white/20 bg-black/20 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-gray-300 text-sm">
                &copy; {currentYear} Textos Occidente - Todos los derechos reservados.
              </div>
              <div className="flex space-x-6 text-sm">
                <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors duration-300">
                  Política de Privacidad
                </Link>
                <Link to="/terms" className="text-gray-300 hover:text-white transition-colors duration-300">
                  Términos de Servicio
                </Link>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors duration-300">
                  Contacto
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
