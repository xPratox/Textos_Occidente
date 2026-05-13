import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Home, Box, BarChart2, Users, Tag, Truck, ShieldCheck } from "lucide-react";
import LogoutButton from "../components/LogoutBtn";

const AdminSidebar = () => {
  // obtener posibles fuentes de información del usuario
  const auth = useAuth() || {};
  const { userData, user } = auth;

  // intenta leer userData desde localStorage si no hay en el context
  const tryLocalStorageUser = () => {
    try {
      const raw = localStorage.getItem("userData") || localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  };

  const parseJwt = (token) => {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      return decoded;
    } catch (e) {
      return null;
    }
  };

  const normalize = (v) => (v ? String(v).trim().toLowerCase() : "");

  const isAdminFromObject = (obj) => {
    if (!obj) return false;
    // direct role string
    const roleStr = normalize(obj.role || obj.tipo || obj.rol || obj.role_name || obj.nombre_rol);
    if (roleStr === "admin" || roleStr === "administrator") return true;
    if (obj.is_admin === true) return true;
    // roles array (strings or objects)
    if (Array.isArray(obj.roles)) {
      return obj.roles.some(r => {
        if (!r) return false;
        if (typeof r === "string") return normalize(r) === "admin";
        return normalize(r.name || r.role || r.rol) === "admin";
      });
    }
    // permissions array
    if (Array.isArray(obj.permissions)) {
      return obj.permissions.some(p => normalize(p).includes("admin") || normalize(p).includes("users"));
    }
    return false;
  };

  // check token claims if present
  const token = localStorage.getItem("access_token");
  let tokenClaims = null;
  if (token) tokenClaims = parseJwt(token);

  const isAdmin = (
    isAdminFromObject(userData) ||
    isAdminFromObject(user) ||
    isAdminFromObject(tryLocalStorageUser()) ||
    // token claim checks
    (tokenClaims && (
      (normalize(tokenClaims.role) === "admin") ||
      (Array.isArray(tokenClaims.roles) && tokenClaims.roles.some(r => normalize(r) === "admin")) ||
      (tokenClaims.realm_access && Array.isArray(tokenClaims.realm_access.roles) && tokenClaims.realm_access.roles.some(r => normalize(r) === "admin")) ||
      tokenClaims.is_admin === true
    ))
  );

  const baseLink = "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-400/40";
  const activeLink = "bg-white text-slate-950 shadow-[0_12px_30px_rgba(15,23,42,0.16)] ring-1 ring-white/80";
  const inactiveLink = "text-slate-300 hover:bg-white/6 hover:text-white";
  const iconWrap = "flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-200";

  return (
    <aside className="w-full border-b border-slate-800 bg-[linear-gradient(180deg,#050816_0%,#060b1d_100%)] px-4 py-5 text-white lg:min-h-screen lg:w-[320px] lg:border-b-0 lg:border-r lg:px-6 lg:py-8">
      <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5 shadow-[0_20px_45px_rgba(0,0,0,0.28)] backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-500/12 text-sky-300 ring-1 ring-sky-400/20">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="min-w-0 w-full px-2">
            <h2 className="mx-auto max-w-[220px] text-center text-[24px] font-semibold leading-none tracking-[0.04em] text-white">ADMINISTRADOR</h2>
          </div>
        </div>

        <div className="mt-5 [&_button]:w-full [&_button]:justify-center [&_button]:rounded-2xl [&_button]:border [&_button]:border-white/10 [&_button]:bg-white/[0.04] [&_button]:px-4 [&_button]:py-3 [&_button]:text-sm [&_button]:font-medium [&_button]:text-slate-100 [&_button]:transition-colors [&_button]:hover:bg-white/[0.08]">
          <LogoutButton />
        </div>
      </div>

      <nav className="mt-8 rounded-[28px] border border-white/8 bg-white/[0.02] p-3 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Modulos</p>
        <ul className="space-y-2">
          <li>
            <NavLink to="/admin" className={({ isActive }) => `${baseLink} ${isActive ? activeLink : inactiveLink}`}>
              {({ isActive }) => (
                <>
                  <span className={`${iconWrap} ${isActive ? "bg-slate-100 text-slate-950" : "bg-white/5 text-slate-300 group-hover:bg-white/10 group-hover:text-white"}`}>
                    <Home className="h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <span className="flex-1 text-left">Dashboard</span>
                </>
              )}
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/products" className={({ isActive }) => `${baseLink} ${isActive ? activeLink : inactiveLink}`}>
              {({ isActive }) => (
                <>
                  <span className={`${iconWrap} ${isActive ? "bg-slate-100 text-slate-950" : "bg-white/5 text-slate-300 group-hover:bg-white/10 group-hover:text-white"}`}>
                    <Box className="h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <span className="flex-1 text-left">Productos</span>
                </>
              )}
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/sales" className={({ isActive }) => `${baseLink} ${isActive ? activeLink : inactiveLink}`}>
              {({ isActive }) => (
                <>
                  <span className={`${iconWrap} ${isActive ? "bg-slate-100 text-slate-950" : "bg-white/5 text-slate-300 group-hover:bg-white/10 group-hover:text-white"}`}>
                    <BarChart2 className="h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <span className="flex-1 text-left">Ventas</span>
                </>
              )}
            </NavLink>
          </li>
          {isAdmin && (
            <li>
              <NavLink to="/admin/users" className={({ isActive }) => `${baseLink} ${isActive ? activeLink : inactiveLink}`}>
                {({ isActive }) => (
                  <>
                    <span className={`${iconWrap} ${isActive ? "bg-slate-100 text-slate-950" : "bg-white/5 text-slate-300 group-hover:bg-white/10 group-hover:text-white"}`}>
                      <Users className="h-4.5 w-4.5" aria-hidden="true" />
                    </span>
                    <span className="flex-1 text-left">Usuarios</span>
                  </>
                )}
              </NavLink>
            </li>
          )}
          <li>
            <NavLink to="/admin/categories" className={({ isActive }) => `${baseLink} ${isActive ? activeLink : inactiveLink}`}>
              {({ isActive }) => (
                <>
                  <span className={`${iconWrap} ${isActive ? "bg-slate-100 text-slate-950" : "bg-white/5 text-slate-300 group-hover:bg-white/10 group-hover:text-white"}`}>
                    <Tag className="h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <span className="flex-1 text-left">Categorias</span>
                </>
              )}
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/proveedores" className={({ isActive }) => `${baseLink} ${isActive ? activeLink : inactiveLink}`}>
              {({ isActive }) => (
                <>
                  <span className={`${iconWrap} ${isActive ? "bg-slate-100 text-slate-950" : "bg-white/5 text-slate-300 group-hover:bg-white/10 group-hover:text-white"}`}>
                    <Truck className="h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <span className="flex-1 text-left">Proveedores</span>
                </>
              )}
            </NavLink>
          </li>
        </ul>
      </nav>

    </aside>
  );
};

export default AdminSidebar;
