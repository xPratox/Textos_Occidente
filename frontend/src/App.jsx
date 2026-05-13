// App.jsx
import AppRouter from "./routes/AppRouter";
import { CartProvider } from "./context/CartContext";

function App() {
  return (
    <CartProvider> {/* Ahora está dentro de BrowserRouter */}
      <AppRouter />
    </CartProvider>
  )
}

export default App;