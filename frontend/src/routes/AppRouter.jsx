import { Routes, Route, Outlet } from "react-router-dom";
import Home from "../pages/Home";
import Products from "../pages/Products";
import Cart from "../pages/Cart";
import ProductPage from "../pages/ProductPage";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AdminPrincipal from "../pages/AdminPrincipal";
import AdminProducts from "../pages/AdminProducts";
import AdminUsers from "../pages/AdminUsers";
import AdminSales from "../pages/AdminSales";
import Error404 from "../pages/NotFounded"; 
import CategoryManagerr from "../pages/AdminCategories";
import ProveedoresManager from "../pages/AdminProveedores";
import RegisterForm from "../pages/Auth/register";
import LoginForm from "../pages/Auth/login";
import ProtectedRoute from "../routes/ProtectedRouter"; // Asegúrate que la ruta sea correcta
import UserProfile from "../pages/UserProfile";

const AppRouter = () => {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <>
                        <Navbar />
                        <Outlet />
                        <Footer />
                    </>
                }
            >
                <Route index element={<Home />} />
                <Route path="products" element={<Products />} />
                <Route path="cart" element={<Cart />} />
                <Route path="product/:productId" element={<ProductPage />} />
                <Route path="register" element={<RegisterForm/>} />
                <Route path="login" element={<LoginForm/>} />
                <Route path="perfil" element={<UserProfile/>} />
                {/* <Route 
                    path="my-account" 
                    element={
                        <ProtectedRoute allowedRoles={['client', 'admin', 'manager']}>
                            <MyAccountPage /> 
                        </ProtectedRoute>
                    } 
                /> */}
            </Route>

            <Route
                path="/admin"

                element={
                    <ProtectedRoute allowedRoles={['admin', 'manager']}>
                        <Outlet /> 
                    </ProtectedRoute>
                }
            >
                {/* Todas estas subrutas ahora están protegidas por el componente padre */}
                <Route index element={<AdminPrincipal />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="sales" element={<AdminSales />} />
                <Route path="categories" element={<CategoryManagerr />} />
                <Route path="proveedores" element={<ProveedoresManager/>} />
            </Route>

            <Route path="/unauthorized" element={
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <h2>Acceso Denegado</h2>
                    <p>No tienes los permisos necesarios para ver esta página.</p>
                    <a href="/">Ir a la página principal</a>
                </div>
            } />
            <Route path="*" element={<Error404 />} />
        </Routes>
    );
};

export default AppRouter;