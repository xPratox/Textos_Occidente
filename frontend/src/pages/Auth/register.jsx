import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate para la redirección

const RegisterForm = () => {
  const API_URL = import.meta.env.VITE_API_URL; // Nueva constante para la URL de la API
  const navigate = useNavigate(); // Hook para la navegación programática

  // Estados para cada campo del formulario
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');

  // Estados para mensajes de feedback al usuario
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); 
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault(); // Previene el recargado de la página por defecto

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Los nombres de las claves deben coincidir con tu esquema UserCreate en FastAPI
        body: JSON.stringify({
          email,
          full_name: fullName, // Asegúrate que el nombre de la clave sea 'full_name' para tu backend
          cedula,
          password,
          // NOTA: No enviamos 'role' aquí, tu backend lo establecerá por defecto a 'client'.
        }),
      });

      if (!response.ok) {
        // Si la respuesta no es OK (ej. 400, 409, 500), parseamos el error
        const errorData = await response.json();
        // Accedemos a la propiedad 'detail' que es donde FastAPI pone los mensajes de error
        throw new Error(errorData.detail || 'Error desconocido al registrar usuario.');
      }

      const data = await response.json();
      console.log('Registro exitoso:', data);
      setSuccess('¡Registro exitoso! Redirigiendo a la página de inicio de sesión...');
      
      // Redirige al usuario a la página de inicio de sesión o a donde consideres
      setTimeout(() => {
        navigate('/login'); // Ajusta esta ruta a la URL de tu página de login
      }, 2000); // Espera 2 segundos antes de redirigir

    } catch (err) {
      console.error('Error durante el registro:', err);
      // 'err' es un objeto Error, su mensaje está en 'err.message'
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Registrarse</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="tu@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="fullName" className="block text-gray-700 text-sm font-semibold mb-2">
              Nombre Completo
            </label>
            <input
              type="text"
              id="fullName"
              name="full_name"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="cedula" className="block text-gray-700 text-sm font-semibold mb-2">
              Cédula
            </label>
            <input
              type="text"
              id="cedula"
              name="cedula"
              placeholder="1234567890"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Mensajes de feedback */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">¡Éxito!</strong>
              <span className="block sm:inline"> {success}</span>
            </div>
          )}

          <button
            type="submit"
            className={`w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;