import { Navigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, userRole, loading } = useAuth(); 


    if (loading) {
        return <div>Cargando autenticación...</div>; // O un componente de spinner
    }

    console.log('✅ ProtectedRoute:');
    console.log('  isAuthenticated:', isAuthenticated);
    console.log('  userRole:', userRole);
    console.log('  loading:', loading);
    console.log('  allowedRoles:', allowedRoles);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    
    if (allowedRoles && allowedRoles.length > 0) {
        if (!userRole || !allowedRoles.includes(userRole)) {
        console.warn(`Acceso denegado: Usuario con rol '${userRole}' intentó acceder a ruta para roles [${allowedRoles.join(', ')}]`);
        
        
        if (userRole === 'client') {
            return <Navigate to="/" replace />;
        } 
        else if (userRole === 'admin' || userRole === 'manager') {
            return <Navigate to="/admin" replace />;
        }
        return <Navigate to="/unauthorized" replace />; 
        }
    }

    return children;
};

export default ProtectedRoute;