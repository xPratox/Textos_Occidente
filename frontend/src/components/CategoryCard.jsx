import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const CategoryCard = ({ title, link, description, icon, accent }) => {  
    return (
        <Link to={link} className="group block">
          <motion.div 
            className="relative h-full overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-10 flex items-start justify-between">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${accent}`}>
                <span className="text-3xl">{icon}</span>
              </div>
              <span className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-coldgrayDark">
                Línea estratégica
              </span>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-bold leading-tight text-slate-900 transition-colors duration-300 group-hover:text-navy">
                {title}
              </h3>
              <p className="min-h-20 text-sm leading-6 text-coldgrayDark">
                {description}
              </p>
            </div>

            <div className="mt-8 border-t border-slate-200 pt-4">
              <motion.div
                className="inline-flex items-center text-sm font-semibold uppercase tracking-[0.16em] text-navy"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                Ver línea
                <svg 
                  className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-60"></div>
            <div className="pointer-events-none absolute bottom-5 right-5 text-5xl opacity-5 transition-opacity duration-300 group-hover:opacity-10">
                {icon}
            </div>
          </motion.div>
        </Link>
      );
}

export default CategoryCard;