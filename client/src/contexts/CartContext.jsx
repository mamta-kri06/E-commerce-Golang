import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingProductIndex = state.findIndex(item => item.id === action.payload.id);
      if (existingProductIndex !== -1) {
        const updatedCart = [...state];
        updatedCart[existingProductIndex].quantity += action.payload.quantity;
        return updatedCart;
      } else {
        return [...state, action.payload];
      }
    case 'REMOVE_FROM_CART':
      return state.filter(item => item.id !== action.payload.id);
    case 'UPDATE_QUANTITY':
      return state.map(item =>
        item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
      );
    case 'CLEAR_CART':
      return [];
    case 'SET_CART':
      return action.payload;
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, dispatch] = useReducer(cartReducer, [], () => {
    const localData = localStorage.getItem('cart');
    return localData ? JSON.parse(localData) : [];
  });

  // Sync with local storage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Load and sync cart from backend on mount or auth change
  useEffect(() => {
    if (isAuthenticated) {
      const syncCart = async () => {
        try {
          // 1. Get current backend cart
          const backendItems = await cartService.getCart();
          
          if (backendItems.length === 0 && cart.length > 0) {
            // 2. If backend is empty but local has items, push local to backend
            for (const item of cart) {
              await cartService.addToCart(item.id, item.quantity);
            }
          } else {
            // 3. Otherwise, use backend as source of truth
            const formattedItems = backendItems.map(item => ({
              ...item.product,
              id: item.product.id, // Ensure ID is mapped correctly
              quantity: item.quantity
            }));
            dispatch({ type: 'SET_CART', payload: formattedItems });
          }
        } catch (error) {
          console.error('Failed to sync cart with backend:', error);
        }
      };
      syncCart();
    }
  }, [isAuthenticated]);

  const addToCart = async (product, quantity = 1) => {
    dispatch({ type: 'ADD_TO_CART', payload: { ...product, quantity } });
    if (isAuthenticated) {
      try {
        await cartService.addToCart(product.id, quantity);
      } catch (error) {
        console.error('Failed to sync add to cart:', error);
      }
    }
  };

  const removeFromCart = async (id) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { id } });
    if (isAuthenticated) {
      try {
        await cartService.removeFromCart(id);
      } catch (error) {
        console.error('Failed to sync remove from cart:', error);
      }
    }
  };

  const updateQuantity = async (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
      if (isAuthenticated) {
        try {
          await cartService.updateQuantity(id, quantity);
        } catch (error) {
          console.error('Failed to sync update quantity:', error);
        }
      }
    }
  };

  const clearCart = async () => {
    dispatch({ type: 'CLEAR_CART' });
    if (isAuthenticated) {
      try {
        await cartService.clearCart();
      } catch (error) {
        console.error('Failed to sync clear cart:', error);
      }
    }
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount: cart.reduce((count, item) => count + item.quantity, 0),
    cartTotal: cart.reduce((total, item) => total + item.pricePaise * item.quantity, 0),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
