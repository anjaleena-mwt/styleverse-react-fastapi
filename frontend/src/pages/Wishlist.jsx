import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import "./css/Wishlist.css";

export default function Wishlist() {
  const navigate = useNavigate();
  const { state, removeFromWishlist, addToCart, removeFromCart } = useCart();

  // --- Track which products are in cart ---
  const [inCartIds, setInCartIds] = useState([]);

  useEffect(() => {
    const ids = state.cart.map((item) => item.id);
    setInCartIds(ids);
  }, [state.cart]);

  // --- Redirect if not logged in ---
  useEffect(() => {
    if (!state.userId) navigate("/login");
  }, [state.userId, navigate]);

  const items = state.wishlist || [];

  return (
    <div className="wishlist-page">
      <h1>WISHLIST - STYLEVERSE</h1>

      {items.length === 0 ? (
        <p className="empty-msg">Your wishlist is empty.</p>
      ) : (
        <div className="wishlist-grid">
          {items.map((item) => {
            const isInCart = inCartIds.includes(item.id);

            const handleCartToggle = () => {
              if (isInCart) {
                removeFromCart(item.id);
              } else {
                addToCart(item, 1);
              }
            };

            return (
              <div className="wishlist-card" key={item.id}>
                <img
                  src={item.img || "/assets/images/default.jpg"}
                  alt={item.title}
                  className="wishlist-img"
                />
                <div className="wishlist-card-info">
                  <h4>{item.title}</h4>
                  <p className="price">${item.price}</p>
                  <div className="wishlist-actions">
                    <button
                      className="remove-btn"
                      onClick={() => removeFromWishlist(item.id)}
                    >
                      Remove
                    </button>
                    <button
                      className={`add-cart-btn ${isInCart ? "added" : ""}`}
                      onClick={handleCartToggle}
                    >
                      {isInCart ? "Added to Cart" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
