import React, { createContext, useContext, useReducer, useCallback } from 'react';

const CartContext = createContext(null);

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.menuItemId === action.payload.menuItemId);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.menuItemId === action.payload.menuItemId
              ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.price }
              : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1, subtotal: action.payload.price }],
      };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.menuItemId !== action.payload) };
    case 'UPDATE_QUANTITY': {
      const { menuItemId, quantity } = action.payload;
      if (quantity <= 0) return { ...state, items: state.items.filter((i) => i.menuItemId !== menuItemId) };
      return {
        ...state,
        items: state.items.map((i) =>
          i.menuItemId === menuItemId ? { ...i, quantity, subtotal: quantity * i.price } : i
        ),
      };
    }
    case 'UPDATE_NOTE':
      return {
        ...state,
        items: state.items.map((i) =>
          i.menuItemId === action.payload.menuItemId ? { ...i, specialInstructions: action.payload.note } : i
        ),
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'SET_TABLE':
      return { ...state, tableNumber: action.payload };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [], tableNumber: null });

  const addItem = useCallback((item) => dispatch({ type: 'ADD_ITEM', payload: item }), []);
  const removeItem = useCallback((id) => dispatch({ type: 'REMOVE_ITEM', payload: id }), []);
  const updateQuantity = useCallback((menuItemId, quantity) =>
    dispatch({ type: 'UPDATE_QUANTITY', payload: { menuItemId, quantity } }), []);
  const updateNote = useCallback((menuItemId, note) =>
    dispatch({ type: 'UPDATE_NOTE', payload: { menuItemId, note } }), []);
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), []);
  const setTable = useCallback((num) => dispatch({ type: 'SET_TABLE', payload: num }), []);

  const subtotal = state.items.reduce((sum, i) => sum + i.subtotal, 0);
  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <CartContext.Provider value={{
      items: state.items, tableNumber: state.tableNumber,
      addItem, removeItem, updateQuantity, updateNote, clearCart, setTable,
      subtotal, tax, total, itemCount,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
