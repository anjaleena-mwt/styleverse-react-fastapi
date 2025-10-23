import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import "./css/ProductCard.css";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { state, addToWishlist, removeFromWishlist, addToCart, removeFromCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isInCart, setIsInCart] = useState(false);

  // --- Normalize product fields to ensure they're always defined ---
  const safeProduct = {
    id: product?.id,
    title: product?.title || product?.name || "Unnamed Product",
    img: product?.img || product?.image || "/assets/images/default.jpg",
    price: Number(product?.price) || 0,
    rating: product?.rating || "★★★★☆",
    // reviews removed
  };

  // --- Update icon states based on context ---
  useEffect(() => {
    const userId = state.userId || JSON.parse(localStorage.getItem("user") || "{}")?.user_id || null;
    if (!userId) {
      setIsWishlisted(false);
      setIsInCart(false);
      return;
    }

    const wishExists = state.wishlist?.some((it) => it.id === safeProduct.id);
    const cartExists = state.cart?.some((it) => it.id === safeProduct.id);

    setIsWishlisted(Boolean(wishExists));
    setIsInCart(Boolean(cartExists));
  }, [state.wishlist, state.cart, safeProduct.id, state.userId]);

  // --- Ensure login before modifying cart/wishlist ---
  const ensureLogin = () => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      navigate("/login");
      return null;
    }
    try {
      return JSON.parse(raw);
    } catch {
      localStorage.removeItem("user");
      navigate("/login");
      return null;
    }
  };

  // --- Handlers ---
  const handleWishlistClick = () => {
    const user = ensureLogin();
    if (!user) return;
    if (isWishlisted) {
      removeFromWishlist(safeProduct.id);
      setIsWishlisted(false);
    } else {
      addToWishlist(safeProduct);
      setIsWishlisted(true);
    }
  };

  const handleCartClick = () => {
    const user = ensureLogin();
    if (!user) return;
    if (isInCart) {
      removeFromCart(safeProduct.id);
      setIsInCart(false);
    } else {
      addToCart(safeProduct, 1);
      setIsInCart(true);
    }
  };

  return (
    <div className="product-card" style={{ width: 240, margin: 12 }}>
      <div className="product-image" style={{ position: "relative" }}>
        <img
          src={safeProduct.img}
          alt={safeProduct.title}
          loading="lazy"
          style={{ width: "100%", borderRadius: "8px" }}
        />

        <div
          className="icon-container"
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <button
            className="icon-btn"
            aria-label="wishlist"
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            onClick={handleWishlistClick}
          >
            <i
              className={isWishlisted ? "fa-solid fa-heart" : "fa-regular fa-heart"}
              style={{ color: isWishlisted ? "#e74c3c" : "black", fontSize: 20 }}
            />
          </button>

          <button
            className="icon-btn"
            aria-label="cart"
            title={isInCart ? "Remove from Cart" : "Add to Cart"}
            onClick={handleCartClick}
          >
            <i
              className="fa-solid fa-cart-shopping"
              style={{ color: isInCart ? "#2ecc71" : "black", fontSize: 20 }}
            />
          </button>
        </div>
      </div>

      <h4 style={{ margin: "8px 0 4px" }}>{safeProduct.title}</h4>
      <div className="rating">
        {safeProduct.rating}
        {/* reviews removed, so no "(N)" display */}
      </div>
      <p className="price">
        <strong>${safeProduct.price.toFixed(2)}</strong>
      </p>
    </div>
  );
}
