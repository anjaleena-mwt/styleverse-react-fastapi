import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import "./css/Cart.css";

export default function Cart() {
  const navigate = useNavigate();
  const { state, updateQty, removeFromCart } = useCart();
  const { cart, userId } = state;

  // redirect if not logged in
  React.useEffect(() => {
    if (!userId) navigate("/login");
  }, [userId, navigate]);

  // --- Totals ---
  const subtotal = cart.reduce(
    (sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 0),
    0
  );
  const TAX_RATE = 0.2;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  if (!cart.length) {
    return (
      <div className="empty-cart" style={{ textAlign: "center", padding: 40 }}>
        <h2>Your cart is empty 🛒</h2>
        <button onClick={() => navigate("/")} className="btn btn-primary">
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <>
      <h1 style={{ textAlign: "center" }}>
        <b>CART - STYLEVERSE</b>
      </h1>

      <div className="small-container cart-page" style={{ padding: 20 }}>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th style={{ textAlign: "right" }}>Subtotal</th>
            </tr>
          </thead>

          <tbody>
            {cart.map((item) => {
              const price = Number(item.price) || 0;
              const qty = Number(item.qty) || 0;

              return (
                <tr key={item.id}>
                  <td>
                    <div
                      className="cart-info"
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      <img
                        src={item.img || "/assets/images/default.jpg"}
                        alt={item.title || "Product"}
                        style={{ width: 80, marginRight: 12 }}
                      />
                      <div>
                        <p style={{ margin: 0 }}>{item.title}</p>
                        <small>Price: ${price.toFixed(2)}</small>
                        <br />
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => removeFromCart(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </td>

                  <td>
                    <input
                      type="number"
                      value={qty}
                      min="1"
                      onChange={(e) =>
                        updateQty(item.id, Math.max(1, Number(e.target.value) || 1))
                      }
                      style={{ width: 60 }}
                    />
                  </td>

                  <td style={{ textAlign: "right" }}>
                    ${(price * qty).toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div
          className="total-price"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: 20,
          }}
        >
          <table style={{ maxWidth: 400 }}>
            <tbody>
              <tr>
                <td>Subtotal:</td>
                <td style={{ textAlign: "right" }}>${subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Tax:</td>
                <td style={{ textAlign: "right" }}>${tax.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Total:</td>
                <td style={{ textAlign: "right" }}>${total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
