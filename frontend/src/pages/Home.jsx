import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Categories from "../components/Categories";
import BtnVerTienda from "../components/BtnVerTienda";
import ProductList from "../components/ProductList";
import BrandLogo from "../components/BrandLogo";

const API_URL = import.meta.env.VITE_API_URL; // Nueva constante para la URL de la API

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
   
        fetch(`${API_URL}/products?limit=3`)  // Llamada a la API actualizada
            .then((response) => response.json())
            .then((data) => {
                setProducts(data);  // Guardar los productos en el estado
            })
            .catch((error) => console.error("Error al obtener productos:", error))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-white pt-20">
            <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative overflow-hidden bg-navy"
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.12),_transparent_32%),linear-gradient(135deg,_rgba(255,255,255,0.03),_transparent_45%)]"></div>
                <div className="absolute -right-24 top-10 h-80 w-80 rounded-full bg-white/5 blur-3xl"></div>
                <div className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-white/5 blur-3xl"></div>

                <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-14 px-4 py-20 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-24">
                    <div className="text-left text-white">
                        <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
                            <BrandLogo className="h-5 w-5 text-white" simplified />
                            Plataforma mayorista profesional
                        </div>
                        <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                            Soluciones de Papelería al por Mayor
                        </h1>
                        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
                            Portafolio especializado para librerías, colegios, distribuidores y oficinas que requieren surtido constante, trazabilidad comercial y atención logística seria.
                        </p>

                        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                            <a
                                href="https://wa.me/5841447471668"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-base font-semibold text-navy transition-all duration-300 hover:bg-coldgray"
                            >
                                Solicitar atención comercial
                            </a>
                            <a
                                href="/products"
                                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:bg-white/10"
                            >
                                Ver catálogo institucional
                            </a>
                        </div>

                        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
                            {[
                                { label: "Líneas estratégicas", value: "04" },
                                { label: "Atención comercial", value: "B2B" },
                                { label: "Cobertura operativa", value: "Regional" },
                            ].map((item) => (
                                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                                    <p className="text-3xl font-bold text-white">{item.value}</p>
                                    <p className="mt-2 text-sm uppercase tracking-[0.16em] text-white/65">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="rounded-[2rem] border border-white/10 bg-white p-6 text-left shadow-2xl shadow-black/20">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-5">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-coldgrayDark">Panel de surtido</p>
                                    <h2 className="mt-2 text-2xl font-bold text-navy">Capacidad de surtido masivo</h2>
                                </div>
                                <div className="rounded-2xl bg-navy p-3">
                                    <BrandLogo className="h-8 w-8 text-white" simplified />
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-4">
                                <div className="rounded-3xl bg-coldgray p-5">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-coldgrayDark">Rotación</p>
                                    <p className="mt-3 text-3xl font-bold text-navy">A+</p>
                                    <p className="mt-2 text-sm text-coldgrayDark">Resmas, escritura premium y reposición diaria.</p>
                                </div>
                                <div className="rounded-3xl bg-navy p-5 text-white">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">Gestión</p>
                                    <p className="mt-3 text-3xl font-bold">24/7</p>
                                    <p className="mt-2 text-sm text-white/75">Seguimiento ágil de solicitudes institucionales.</p>
                                </div>
                            </div>

                            <div className="mt-4 rounded-3xl border border-slate-200 p-5">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-coldgrayDark">Mix de categorías</p>
                                        <p className="mt-2 text-lg font-semibold text-slate-900">Escritura, textos, oficina y arte</p>
                                    </div>
                                    <span className="text-sm font-semibold text-navy">REF TX-Home</span>
                                </div>
                                <div className="mt-6 flex items-end gap-3">
                                    <div className="h-24 flex-1 rounded-t-3xl bg-navy"></div>
                                    <div className="h-32 flex-1 rounded-t-3xl bg-slate-500"></div>
                                    <div className="h-20 flex-1 rounded-t-3xl bg-slate-300"></div>
                                    <div className="h-36 flex-1 rounded-t-3xl bg-slate-700"></div>
                                </div>
                                <div className="mt-4 grid grid-cols-3 gap-3 text-xs uppercase tracking-[0.16em] text-coldgrayDark">
                                    <span>Mayorista</span>
                                    <span>Institucional</span>
                                    <span>Logístico</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.section>

            <motion.section 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-white py-12 sm:py-16" 
            >
                <Categories />
            </motion.section>

            <motion.section 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="border-y border-slate-200 bg-gradient-to-br from-slate-50 to-white py-16"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="mb-12 text-center"
                    >
                        <div className="mb-5 inline-flex rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-coldgrayDark">
                            Referencias sugeridas
                        </div>
                        <h2 className="mb-4 text-4xl font-bold text-slate-900">
                            Fichas de producto con lectura técnica
                        </h2>
                        <p className="mx-auto max-w-3xl text-xl leading-8 text-coldgrayDark">
                            Tarjetas pensadas para el comprador de volumen: fotografía, descripción operativa, empaque mínimo y código de referencia.
                        </p>
                    </motion.div>
                    
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-navy"></div>
                        </div>
                    ) : (
                        <ProductList products={products} />
                    )}
                </div>
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="text-center mt-8"
                >
                    <BtnVerTienda />
                </motion.div>
            </motion.section>

            <motion.section 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.0 }}
                className="bg-white py-16"
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-8 rounded-[2rem] bg-navy px-8 py-12 text-left text-white shadow-xl lg:grid-cols-[1fr_auto] lg:items-center lg:px-12">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">Soporte institucional</p>
                            <h2 className="mt-4 text-4xl font-bold leading-tight">
                                Una interfaz sobria para decisiones de compra de alto volumen.
                            </h2>
                            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200">
                                Textos Occidente centraliza surtido, referencias y atención comercial en una experiencia limpia que prioriza confianza operativa, lectura rápida y rigor corporativo.
                            </p>
                        </div>
                        <a
                            href="https://wa.me/5841447471668"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-base font-semibold text-navy transition-all duration-300 hover:bg-coldgray"
                        >
                            Contactar equipo comercial
                        </a>
                    </div>
                </div>
            </motion.section>
        </div>
    );
};

export default Home;
