import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const UserForm = ({ initial, onClose, onSaved }) => {
  const isEditing = Boolean(initial?.id);
  const [form, setForm] = useState({
    email: initial?.email || "",
    full_name: initial?.full_name || "",
    cedula: initial?.cedula || "",
    password: "",
    role: initial?.role || "manager",
  });
  const token = localStorage.getItem("access_token") || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing ? `${API_URL}/users/${initial.id}` : `${API_URL}/users/`;
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(
          isEditing
            ? { email: form.email, full_name: form.full_name, cedula: form.cedula }
            : { email: form.email, full_name: form.full_name, cedula: form.cedula, password: form.password, role: form.role }
        ),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const data = await res.json();
      onSaved(data);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error: " + (err.message || "No se pudo guardar el usuario"));
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-6 rounded-lg w-96">
        <h3 className="text-lg font-bold mb-4">{isEditing ? "✏️ Editar Usuario Interno" : "➕ Nuevo Vendedor"}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-sm">Nombre completo</label>
          <input required value={form.full_name} onChange={(e) => setForm({...form, full_name: e.target.value})} className="w-full p-2 border rounded" />
          <label className="block text-sm">Correo</label>
          <input required type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full p-2 border rounded" />
          <label className="block text-sm">Cédula</label>
          <input required value={form.cedula} onChange={(e) => setForm({...form, cedula: e.target.value})} className="w-full p-2 border rounded" />
          {!isEditing && (
            <>
              <label className="block text-sm">Contraseña</label>
              <input required type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className="w-full p-2 border rounded" />
            </>
          )}
          {!isEditing && (
            <div className="rounded border bg-slate-50 px-3 py-2 text-sm text-slate-600">
              Rol asignado: <span className="font-medium">Vendedor</span>
            </div>
          )}

          <div className="flex justify-between mt-4">
            <button type="button" onClick={onClose} className="px-3 py-2 bg-gray-200 rounded">Cancelar</button>
            <button type="submit" className="px-3 py-2 bg-indigo-600 text-white rounded">{isEditing ? "Guardar" : "Crear"}</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const token = localStorage.getItem("access_token") || "";
  const navigate = useNavigate();
  const { logout } = useAuth();
  let currentUserEmail = "";

  try {
    currentUserEmail = (jwtDecode(token)?.sub || "").toLowerCase();
  } catch {
    currentUserEmail = "";
  }

  const getRoleLabel = (role) => {
    if (role === "admin") return "Administrador";
    if (role === "manager") return "Vendedor";
    return role || "-";
  };

  const handleUnauthorized = () => {
    setError("Tu sesion expiro o ya no es valida. Inicia sesion nuevamente.");
    logout();
    navigate("/login", { replace: true });
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/users`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (res.status === 403) {
        setError("No tienes permisos para administrar usuarios.");
        setUsers([]);
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUsers(data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const handleDelete = async (user) => {
    if (!window.confirm(`¿Eliminar usuario ${user.email}?`)) return;
    try {
      const res = await fetch(`${API_URL}/users/${user.id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (res.status === 403) {
        alert("No tienes permisos para eliminar usuarios.");
        return;
      }
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      alert("Usuario eliminado correctamente");
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar usuario: " + (err.message || ""));
    }
  };

  const filtered = users.filter(u => {
    const isVisibleInternalUser = (u.role === "manager") || ((u.role === "admin") && ((u.email || "").toLowerCase() === currentUserEmail));
    if (!isVisibleInternalUser) return false;
    if (!q) return true;
    const s = q.toLowerCase();
    return (u.email || "").toLowerCase().includes(s) || (u.full_name || "").toLowerCase().includes(s) || (u.cedula || "").toLowerCase().includes(s) || (u.role || "").toLowerCase().includes(s);
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Usuarios internos</h1>
          <p className="text-gray-600">Aqui solo se administra tu cuenta de administrador y los vendedores internos.</p>
        </div>
        <div className="flex items-center gap-3">
          <input placeholder="Buscar..." value={q} onChange={(e)=>setQ(e.target.value)} className="px-3 py-2 border rounded" />
          <button onClick={() => setEditingUser({ role: "manager" })} className="bg-indigo-600 px-3 py-2 rounded text-white">Nuevo vendedor</button>
          <button onClick={fetchUsers} className="bg-gray-200 px-3 py-2 rounded">Refrescar</button>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        Los clientes no aparecen ni se administran desde este modulo. Su gestion ocurre desde el sitio publico.
      </div>

      {loading ? (
        <div className="text-center py-20">Cargando usuarios...</div>
      ) : error ? (
        <div className="text-red-600 py-6">{error}</div>
      ) : (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Nombre</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Cédula</th>
                <th className="p-3 text-left">Tipo</th>
                <th className="p-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{u.full_name || u.name || "-"}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.cedula || "-"}</td>
                  <td className="p-3">{getRoleLabel(u.role)}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingUser(u); }} className="px-2 py-1 bg-yellow-400 text-white rounded">✏️</button>
                      {u.role === "manager" && (
                        <button onClick={() => handleDelete(u)} className="px-2 py-1 bg-red-500 text-white rounded">🗑️</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center p-6 text-gray-500">No hay usuarios internos para mostrar.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editingUser && (
        <UserForm
          initial={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={() => fetchUsers()}
        />
      )}
    </div>
  );
};

export default UsersPage;
