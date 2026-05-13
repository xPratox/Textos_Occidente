import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import download from "downloadjs";
import { 
  User, 
  Mail, 
  CreditCard, 
  ShoppingBag, 
  Download, 
  Calendar, 
  DollarSign,
  Package,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
 
const UserProfile = () => {
  const { cedula, userData } = useAuth(); // obtenemos también userData (si está disponible)
  const [ventas, setVentas] = useState([]);
  const [cliente, setCliente] = useState(null);
  const [editOpen, setEditOpen] = useState(false); // nuevo: controlar modal edición
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    email: "",
    direccion: "",
    password: "",
    confirm_password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
 
  const API_URL = import.meta.env.VITE_API_URL; // Nueva constante para la URL de la API

  // Sincronizar formulario con cliente cuando se cargue
  useEffect(() => {
    if (cliente) {
      setProfileForm({
        full_name: cliente.full_name || cliente.name || "",
        email: cliente.email || "",
        direccion: cliente.direccion || cliente.address || "",
        password: "",
        confirm_password: ""
      });
    }
  }, [cliente]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenEdit = () => {
    // Si no tenemos cliente pero existe userData, prellenar con userData
    if (!cliente && userData) {
      setProfileForm({
        full_name: userData.full_name || userData.name || "",
        email: userData.email || "",
        direccion: userData.direccion || userData.address || ""
      });
    }
    setEditOpen(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    // validar campos mínimos
    if (!profileForm.full_name.trim() || !profileForm.email.trim()) {
      alert("Nombre y correo son obligatorios.");
      return;
    }

    // Si se intenta cambiar contraseña, validar mínimos
    if (profileForm.password || profileForm.confirm_password) {
      if (profileForm.password.length < 6) {
        alert("La contraseña debe tener al menos 6 caracteres.");
        return;
      }
      if (profileForm.password !== profileForm.confirm_password) {
        alert("La nueva contraseña y la confirmación no coinciden.");
        return;
      }
    }

    try {
      const token = localStorage.getItem("access_token");
      const payload = {
        full_name: profileForm.full_name,
        email: profileForm.email
      };
      if (profileForm.direccion) payload.direccion = profileForm.direccion;
      if (profileForm.password) payload.password = profileForm.password;

      const res = await fetch(`${API_URL}/users/me/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}) //
        },
        body: JSON.stringify(payload)
      });

      // manejar situaciones específicas de respuesta
      if (res.status === 403) {
        // el backend denegó por permisos (aunque ahora debería permitirse)
        const errBody = await res.json().catch(() => null);
        const detail = errBody?.detail || "No tienes permisos para actualizar este perfil.";
        alert(detail);
        return;
      }

      const data = await (res.ok ? res.json() : res.json().catch(() => null));
      if (!res.ok) {
        const detail = data?.detail || data || `HTTP ${res.status}`;
        throw new Error(detail);
      }

      // Actualizar UI local y localStorage si corresponde
      setCliente(data);
      try {
        const stored = localStorage.getItem("userData");
        if (stored) {
          const parsed = JSON.parse(stored);
          const merged = { ...parsed, ...data };
          localStorage.setItem("userData", JSON.stringify(merged));
        }
      } catch (err) {
        // ignore localStorage update errors
      }

      alert("Perfil actualizado correctamente.");
      setEditOpen(false);
    } catch (err) {
      console.error("Error actualizando perfil:", err);
      alert("No se pudo actualizar el perfil: " + (err.message || "error desconocido"));
    }
  };
 
  useEffect(() => {
    if (!cedula) return;
 
    const fetchVentas = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(
          `${API_URL}/sales/by-cedula/${cedula}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Error al cargar las ventas");
        const data = await response.json();
        setVentas(data);
        if (data.length > 0) {
          setCliente(data[0].cliente);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVentas();
  }, [cedula]);

  const handleGeneratePDF = async (venta) => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 700]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;
    let y = 680;

    const drawText = (text, x = 50, size = fontSize) => {
      page.drawText(text, {
        x,
        y,
        size,
        font,
        color: rgb(0, 0, 0),
      });
      y -= size + 6;
    };

    drawText("Textos Occidente", 50, 18);
    drawText(`Fecha: ${new Date(venta.fecha_creacion).toLocaleString()}`);
    drawText(`Código: #${venta.codigo}`);
    drawText(`Cliente: ${venta.cliente.full_name}`);
    drawText(`Cédula: ${venta.cliente.cedula}`);
    drawText("");

    drawText("Productos:");
    drawText("--------------------------------------------------");

    venta.detalles.forEach((detalle) => {
      const nombre = detalle.variante.producto.nombre
        .substring(0, 20)
        .padEnd(20);
      const talla = detalle.variante.talla.padEnd(5);
      const color = detalle.variante.color.padEnd(7);
      const cantidad = String(detalle.cantidad).padEnd(5);
      const precio = `$${detalle.precio_unitario.toFixed(2)}`.padEnd(8);
      const totalItem = `$${(detalle.precio_unitario * detalle.cantidad).toFixed(
        2
      )}`;
      drawText(
        `${nombre} T:${talla} C:${color} Cant:${cantidad} P.Unit:${precio} Total:${totalItem}`
      );
    });

    drawText("--------------------------------------------------");
    drawText(`TOTAL: $${venta.total.toFixed(2)}`, 50, 14);
    drawText("Gracias por su compra.");
    drawText("Presentar este recibo para cambios.");

    const pdfBytes = await pdfDoc.save();
    download(pdfBytes, `Recibo_${venta.codigo}.pdf`, "application/pdf");
  };

  const getStatusIcon = (estado) => {
    switch (estado.toLowerCase()) {
      case 'completado':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pendiente':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'cancelado':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (estado) => {
    switch (estado.toLowerCase()) {
      case 'completado':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!cedula) {
    return (
      <div className="min-h-screen bg-white pt-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md mx-auto mt-20 p-8"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-6">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso Restringido</h2>
            <p className="text-gray-600 mb-8">
              No estás registrado. Por favor, inicia sesión para continuar.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                to="/login" 
                className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
              >
                <span>Iniciar Sesión</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white pt-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md mx-auto mt-20 p-8"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-6">😞</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error al cargar perfil</h2>
            <p className="text-gray-600 mb-8">{error}</p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                to="/" 
                className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver al Inicio</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Mi Perfil
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Gestiona tu información personal y revisa tu historial de compras
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Info Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-24">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Información Personal</h2>
              </div>
 
               {cliente ? (
                 <div className="space-y-6">
                  <div className="flex justify-end">
                    <button
                      onClick={handleOpenEdit}
                      className="text-sm px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100"
                    >
                      ✏️ Editar perfil
                    </button>
                  </div>
                   <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                     <User className="w-5 h-5 text-indigo-600" />
                     <div>
                       <p className="text-sm text-gray-500">Nombre completo</p>
                       <p className="font-semibold text-gray-900">{cliente.full_name}</p>
                     </div>
                   </div>
 
                   <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                     <Mail className="w-5 h-5 text-indigo-600" />
                     <div>
                       <p className="text-sm text-gray-500">Correo electrónico</p>
                       <p className="font-semibold text-gray-900">{cliente.email}</p>
                     </div>
                   </div>
 
                   <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                     <CreditCard className="w-5 h-5 text-indigo-600" />
                     <div>
                       <p className="text-sm text-gray-500">Cédula</p>
                       <p className="font-semibold text-gray-900">{cliente.cedula}</p>
                     </div>
                   </div>
 
                   <div className="pt-6 border-t border-gray-200">
                     <div className="grid grid-cols-2 gap-4 text-center">
                       <div className="p-4 bg-indigo-50 rounded-lg">
                         <ShoppingBag className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                         <p className="text-2xl font-bold text-indigo-600">{ventas.length}</p>
                         <p className="text-sm text-gray-600">Compras</p>
                       </div>
                       <div className="p-4 bg-green-50 rounded-lg">
                         <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
                         <p className="text-2xl font-bold text-green-600">
                           ${ventas.reduce((sum, v) => sum + v.total, 0).toFixed(0)}
                         </p>
                         <p className="text-sm text-gray-600">Total gastado</p>
                       </div>
                     </div>
                   </div>
                 </div>
               ) : (
                 <div className="text-center py-8">
                   <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                   <p className="text-gray-600">No hay datos de usuario disponibles</p>
                 </div>
               )}
             </div>
           </motion.div>
 
          {/* Sales History */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-8">
                <ShoppingBag className="w-8 h-8 text-indigo-600" />
                <h2 className="text-3xl font-bold text-gray-900">Historial de Compras</h2>
              </div>

              {ventas.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay compras registradas</h3>
                  <p className="text-gray-600 mb-8">Cuando realices tu primera compra, aparecerá aquí</p>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link 
                      to="/products" 
                      className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                    >
                      <span>Explorar Productos</span>
                    </Link>
                  </motion.div>
                </div>
              ) : (
                <div className="space-y-6">
                  <AnimatePresence>
                    {ventas.map((venta, index) => (
                      <motion.div
                        key={venta.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                      >
                        {/* Sale Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <h3 className="text-xl font-bold text-gray-900">Compra #{venta.codigo}</h3>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(venta.estado)}`}>
                                {venta.estado}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(venta.fecha_creacion).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                            <div className="text-right">
                              <p className="text-2xl font-bold text-indigo-600">${venta.total.toFixed(2)}</p>
                              <p className="text-sm text-gray-500">Total</p>
                            </div>
                            <motion.button
                              onClick={() => handleGeneratePDF(venta)}
                              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Download className="w-4 h-4" />
                              <span>PDF</span>
                            </motion.button>
                          </div>
                        </div>

                        {/* Products List */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                            <Package className="w-5 h-5" />
                            <span>Productos ({venta.detalles.length})</span>
                          </h4>
                          <div className="grid gap-3">
                            {venta.detalles.map((detalle) => (
                              <div key={detalle.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">{detalle.variante.producto.nombre}</p>
                                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                    <span>Talla: {detalle.variante.talla}</span>
                                    <span>Color: {detalle.variante.color}</span>
                                    <span>Cantidad: {detalle.cantidad}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-gray-900">${detalle.precio_unitario.toFixed(2)}</p>
                                  <p className="text-sm text-gray-500">c/u</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
 
      {/* Modal de edición de perfil */}
      {editOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">✏️ Editar Perfil</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-3">
              <label className="block text-sm">Nombre completo</label>
              <input name="full_name" value={profileForm.full_name} onChange={handleProfileChange} className="w-full p-2 border rounded" required />
 
              <label className="block text-sm">Correo</label>
              <input name="email" type="email" value={profileForm.email} onChange={handleProfileChange} className="w-full p-2 border rounded" required />
 
              <label className="block text-sm">Dirección</label>
              <input name="direccion" value={profileForm.direccion} onChange={handleProfileChange} className="w-full p-2 border rounded" />
 
              <label className="block text-sm">Nueva contraseña (opcional)</label>
              <input name="password" type="password" value={profileForm.password} onChange={handleProfileChange} className="w-full p-2 border rounded" />
 
              <label className="block text-sm">Confirmar contraseña (opcional)</label>
              <input name="confirm_password" type="password" value={profileForm.confirm_password} onChange={handleProfileChange} className="w-full p-2 border rounded" />
 
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setEditOpen(false)} className="px-3 py-2 bg-gray-200 rounded">Cancelar</button>
                <button type="submit" className="px-3 py-2 bg-indigo-600 text-white rounded">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
     </div>
   );
 };
 
 export default UserProfile;
