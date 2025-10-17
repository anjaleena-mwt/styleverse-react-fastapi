// src/contexts/CartContext.jsx
import React, { createContext, useContext, useEffect, useReducer } from "react";

const CartContext = createContext(null);

const initialState = {
  userId: null, // "guest" for non-logged-in users
  wishlist: [],
  cart: [],
};

function reducer(state, action) {
  switch (action.type) {
    case "INIT_USER":
      return { ...state, ...action.payload };

    case "ADD_TO_WISHLIST":
      if (state.wishlist.some((it) => it.id === action.payload.id)) return state;
      return { ...state, wishlist: [...state.wishlist, action.payload] };

    case "REMOVE_FROM_WISHLIST":
      return { ...state, wishlist: state.wishlist.filter((it) => it.id !== action.payload) };

    case "ADD_TO_CART": {
      const product = action.payload;
      const idx = state.cart.findIndex((it) => it.id === product.id);

      const newCart =
        idx >= 0
          ? state.cart.map((c) =>
              c.id === product.id
                ? { ...c, qty: (c.qty || 1) + (product.qty || 1) }
                : c
            )
          : [...state.cart, { ...product, qty: product.qty || 1 }];

      return { ...state, cart: newCart };
    }

    case "REMOVE_FROM_CART":
      return { ...state, cart: state.cart.filter((it) => it.id !== action.payload) };

    case "UPDATE_QTY":
      const { id, qty } = action.payload;
      if (qty < 1) return state;
      return {
        ...state,
        cart: state.cart.map((it) => (it.id === id ? { ...it, qty } : it)),
      };

    case "CLEAR_USER":
      return { ...initialState };

    default:
      return state;
  }
}

// --- LocalStorage helpers ---
const readStored = (userId) => {
  try {
    const rawW = localStorage.getItem(`wishlist_${userId}`);
    const rawC = localStorage.getItem(`cart_${userId}`);
    const wishlist = rawW ? JSON.parse(rawW) : [];
    const cart = rawC ? JSON.parse(rawC) : [];
    return { wishlist, cart };
  } catch {
    return { wishlist: [], cart: [] };
  }
};

const writeStored = (userId, wishlist, cart) => {
  try {
    localStorage.setItem(
      `wishlist_${userId}`,
      JSON.stringify(
        wishlist.map(({ id, title, img, price }) => ({ id, title, img, price }))
      )
    );
    localStorage.setItem(
      `cart_${userId}`,
      JSON.stringify(
        cart.map(({ id, qty, title, img, price }) => ({ id, qty, title, img, price }))
      )
    );
  } catch {}
};

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Initialize user/cart on mount
  useEffect(() => {
    const raw = localStorage.getItem("user");
    const userId = raw ? JSON.parse(raw)?.user_id : "guest"; // use guest if no login
    const stored = readStored(userId);
    dispatch({ type: "INIT_USER", payload: { userId, wishlist: stored.wishlist, cart: stored.cart } });

    const onStorage = (e) => {
      if (e.key === "user") {
        const uid = JSON.parse(localStorage.getItem("user") || "{}")?.user_id || "guest";
        const storedData = readStored(uid);
        dispatch({ type: "INIT_USER", payload: { userId: uid, wishlist: storedData.wishlist, cart: storedData.cart } });
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Persist cart/wishlist whenever they change
  useEffect(() => {
    if (!state.userId) return;
    writeStored(state.userId, state.wishlist, state.cart);
  }, [state.userId, state.wishlist, state.cart]);

  // API for components
  const api = {
    state,
    dispatch,
    addToWishlist: (product) => dispatch({ type: "ADD_TO_WISHLIST", payload: product }),
    removeFromWishlist: (id) => dispatch({ type: "REMOVE_FROM_WISHLIST", payload: id }),
    addToCart: (product, qty = 1) => dispatch({ type: "ADD_TO_CART", payload: { ...product, qty } }),
    removeFromCart: (id) => dispatch({ type: "REMOVE_FROM_CART", payload: id }),
    updateQty: (id, qty) => dispatch({ type: "UPDATE_QTY", payload: { id, qty } }),
    clearUser: () => dispatch({ type: "CLEAR_USER" }),
  };

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
