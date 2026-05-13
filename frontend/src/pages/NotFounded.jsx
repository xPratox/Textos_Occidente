import { Link } from 'react-router-dom';

const Error404 = () => {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="space-y-4">
        <h1 className="text-9xl font-bold text-indigo-500 animate-bounce">404</h1>
        <h2 className="text-4xl font-semibold text-gray-800">¡Ups! Página no encontrada</h2>
        <p className="text-xl text-gray-600 max-w-2xl mb-8">
          La página que estás buscando podría haber sido eliminada, cambiado de nombre o no está disponible temporalmente.
        </p>
        <Link 
          to="/" 
          className="inline-block px-8 py-3 bg-indigo-600 text-white font-medium text-sm leading-tight uppercase rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-300 ease-in-out"
        >
          Volver al Inicio
        </Link>
      </div>
      
    </div>
  );
};

export default Error404;