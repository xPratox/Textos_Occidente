import { motion } from "framer-motion";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const API_URL = import.meta.env.VITE_API_URL; // Nueva constante para la URL de la API

const fetchCarouselData = async () => {
    const response = await fetch(`${API_URL}/carousel-data`); // Llamada a la API actualizada
    const data = await response.json();
    return data;
};

const images = [
  {
    src: "/images/primera.jpg",
    title: "Nueva Colección",
    subtitle: "Descubre las últimas tendencias",
    cta: "Explorar Ahora"
  },
  {
    src: "/images/segunda.jpg", 
    title: "Ofertas Especiales",
    subtitle: "Hasta 50% de descuento",
    cta: "Ver Ofertas"
  },
  {
    src: "/images/tercera.jpg",
    title: "Estilo Único",
    subtitle: "Para cada ocasión",
    cta: "Descubrir"
  }
];

const Carousel = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    fade: true,
    cssEase: "linear",
    pauseOnHover: true,
    customPaging: (i) => (
      <div className="w-3 h-3 bg-white/50 rounded-full transition-all duration-300 hover:bg-white/80" />
    )
  };

  return (
    <div className="relative w-full overflow-hidden">
      <Slider {...settings}>
        {images.map((slide, index) => (
          <div key={index} className="relative">
            <div className="relative h-[600px] sm:h-[700px]">
              <img 
                src={slide.src} 
                alt={slide.title} 
                className="w-full h-full object-cover" 
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
              
              {/* Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-white max-w-2xl"
                  >
                    <motion.h1 
                      className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                    >
                      {slide.title}
                    </motion.h1>
                    
                    <motion.p 
                      className="text-xl sm:text-2xl mb-8 text-gray-200"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.7 }}
                    >
                      {slide.subtitle}
                    </motion.p>
                    
                    <motion.button
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.9 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {slide.cta}
                    </motion.button>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
      
      {/* Custom styles for dots */}
      <style jsx>{`
        .slick-dots {
          bottom: 30px !important;
          z-index: 10;
        }
        .slick-dots li {
          margin: 0 8px !important;
        }
        .slick-dots li button:before {
          font-size: 0 !important;
          width: 12px !important;
          height: 12px !important;
          border-radius: 50% !important;
          background: rgba(255, 255, 255, 0.5) !important;
          transition: all 0.3s ease !important;
        }
        .slick-dots li.slick-active button:before {
          background: white !important;
          transform: scale(1.2) !important;
        }
      `}</style>
    </div>
  );
};

export default Carousel;
