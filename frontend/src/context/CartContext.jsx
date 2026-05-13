import { createContext, useState, useContext } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children, initialProducts }) => {
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState(initialProducts || []); // ✅ Productos de la BD
  const [confirmation, setConfirmation] = useState(null);

  const addToCart = (product, quantity, variantId) => {
    // Buscar la variante completa
    const variant = product.variantes.find((v) => v.id === variantId);
    
    if (!product || !variant) {
      console.error("Error: Producto o variante inválida");
      return;
    }
  
    const newItem = {
      id: variant.id,  // Usar el variant_id como identificador único
      variant_id: variant.id,  // Campo necesario para el endpoint
      product_id: product.id,
      name: product.name,
      precio: product.precio,
      image: product.image_url,
      quantity,
      talla: variant.talla,
      color: variant.color,
    };
  
    setCartItems((prev) => {
      const exists = prev.find((item) => item.id === newItem.id);
      return exists
        ? prev.map((item) =>
            item.id === newItem.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        : [...prev, newItem];
    });
  };
  
  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        addToCart, 
        clearCart, // ✅ Añadir esta función
        confirmation, 
        products, 
        setProducts 
      }}
    >
      {children}
    </CartContext.Provider>
  );
 
};
