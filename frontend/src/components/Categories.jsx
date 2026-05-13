import { motion } from "framer-motion";
import CategoryCard from "./CategoryCard";

const Categories = () => {
  const categories = [
    {
      title: "Línea de Escritura y Corrección",
      link: "/products?category=L%C3%ADnea%20de%20Escritura%20y%20Correcci%C3%B3n",
      description: "Bolígrafos, marcadores, resaltadores y soluciones de corrección para consumo institucional continuo.",
      icon: "✒️",
      accent: "bg-slate-100 text-navy"
    },
    {
      title: "Textos Escolares",
      link: "/products?category=Textos%20Escolares",
      description: "Catálogo de textos y materiales pedagógicos con surtido estable para instituciones y distribuidores.",
      icon: "📚",
      accent: "bg-coldgray text-navy"
    },
    {
    title: "Suministros de Oficina",
    link: "/products?category=Suministros%20de%20Oficina",
    description: "Papelería operativa, archivo, organización y reposición para oficinas con demanda de volumen.",
    icon: "🗂️",
    accent: "bg-slate-200 text-navy"
    },
    {
      title: "Arte y Dibujo",
      link: "/products?category=Arte%20y%20Dibujo",
      description: "Herramientas para ilustración, dibujo técnico y proyectos creativos con estándar profesional.",
      icon: "🎨",
      accent: "bg-slate-100 text-navy"
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <div className="mb-5 inline-flex rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-coldgrayDark">
          Portafolio estratégico
        </div>
        <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
          Categorías para abastecimiento mayorista
        </h2>
        <p className="text-xl text-coldgrayDark max-w-3xl mx-auto leading-8">
          Organización clara por líneas de demanda para compradores institucionales, colegios, librerías y oficinas.
        </p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
      >
        {categories.map((cat, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <CategoryCard {...cat} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Categories;
