import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./css/Payment.css";

export default function Payment() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const total = state?.total || 0;

  const [method, setMethod] = useState("");
  const [upiId, setUpiId] = useState("");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", save: false });
  const [errors, setErrors] = useState({ upi: "", number: "", expiry: "", cvv: "" });
  const [message, setMessage] = useState("");

  // Validation functions
  const validateUPI = (v) => {
    v = v.trim();
    if (!v) return "UPI ID is required";
    // basic UPI pattern like name@bank or name@upi
    if (!/^[\w.-]+@[\w.-]+$/.test(v)) return "Enter a valid UPI ID (example@upi)";
    console.log("✅ Valid UPI:", v);
    return "";
  };

  const validateNumber = (v) => {
    if (!v) return "Card number is required";
    if (!/^\d+$/.test(v)) return "Card number must contain only digits";
    if (v.length !== 16) return "Card number must be 16 digits";
    return "";
  };

  const validateExpiry = (v) => {
  if (!v) return "Expiry is required";
  if (!/^\d{2}\/\d{2}$/.test(v)) return "Expiry must be MM/YY";

  const [mmStr, yyStr] = v.split("/");
  const mm = Number(mmStr);
  const yy = Number(yyStr);

  if (Number.isNaN(mm) || Number.isNaN(yy)) return "Invalid expiry format";
  if (mm < 1 || mm > 12) return "Invalid month";

  // convert two-digit year to full year (assume 2000-2099)
  const fullYear = 2000 + yy;

  // build a date at the end of expiry month
  const expiryDate = new Date(fullYear, mm, 0, 23, 59, 59); // last day of month
  const now = new Date();

  if (expiryDate < now) return "Card has expired";

  return "";
};


  const validateCvv = (v) => {
    if (!v) return "CVV is required";
    if (!/^\d{3}$/.test(v)) return "CVV must be 3 digits";
    return "";
  };

  // Live validation on field changes
  useEffect(() => {
    if (method === "upi") {
      setErrors((prev) => ({ ...prev, upi: validateUPI(upiId) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upiId, method]);

  useEffect(() => {
    if (method === "card") {
      setErrors((prev) => ({
        ...prev,
        number: validateNumber(card.number),
        expiry: validateExpiry(card.expiry),
        cvv: validateCvv(card.cvv),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card, method]);

  // auto-format expiry: allow only digits and insert '/' after 2 digits
  const onExpiryChange = (raw) => {
    const digits = raw.replace(/\D/g, "").slice(0, 4); // allow 4 digits max (MMYY)
    let formatted = digits;
    if (digits.length >= 3) {
      formatted = digits.slice(0, 2) + "/" + digits.slice(2);
    } else if (digits.length >= 1 && digits.length <= 2) {
      formatted = digits;
    }
    setCard((c) => ({ ...c, expiry: formatted }));
  };

  // card number change: keep only digits (max 16)
  const onNumberChange = (raw) => {
    const digits = raw.replace(/\D/g, "").slice(0, 16);
    setCard((c) => ({ ...c, number: digits }));
  };

  // cvv change: only digits max 3
  const onCvvChange = (raw) => {
    const digits = raw.replace(/\D/g, "").slice(0, 3);
    setCard((c) => ({ ...c, cvv: digits }));
  };

  // Determine if Pay button should be enabled
  const isPayEnabled = () => {
    if (!method) return false;
    if (method === "cod") return true;
    if (method === "upi") return !errors.upi && upiId.length > 0;
    if (method === "card")
      return !errors.number && !errors.expiry && !errors.cvv && card.number && card.expiry && card.cvv;
    return false;
  };

  const handlePay = () => {
    // final validation before processing
    let newErrors = { ...errors };

    if (method === "upi") {
      newErrors.upi = validateUPI(upiId);
    }
    if (method === "card") {
      newErrors.number = validateNumber(card.number);
      newErrors.expiry = validateExpiry(card.expiry);
      newErrors.cvv = validateCvv(card.cvv);
    }

    setErrors(newErrors);

    if (Object.values(newErrors).some((m) => m)) return; // stop if any error

    // simulate successful payment
    setMessage(`✅ Order of $${total.toFixed(2)} placed successfully!`);
    // optionally clear cart here (call context or backend)
    setTimeout(() => navigate("/"), 2500);
  };

  return (
    <div className="payment-container">
      <h1>Payment</h1>
      <h3 className="total-text">Total Amount: <span className="total-amount">${total.toFixed(2)}</span></h3>

      <div className="payment-options">
        <button
          className={`opt-btn ${method === "upi" ? "active" : ""}`}
          onClick={() => setMethod("upi")}
          type="button"
        >
          UPI
        </button>
        <button
          className={`opt-btn ${method === "card" ? "active" : ""}`}
          onClick={() => setMethod("card")}
          type="button"
        >
          Credit / Debit Card
        </button>
        <button
          className={`opt-btn ${method === "cod" ? "active" : ""}`}
          onClick={() => setMethod("cod")}
          type="button"
        >
          Cash on Delivery
        </button>
      </div>

      {/* UPI */}
      {method === "upi" && (
        <div className="payment-box">
          <label className="field-label">UPI ID</label>
          <input
            className={`field-input ${errors.upi ? "has-error" : ""}`}
            type="text"
            placeholder="username@upi"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value.trim())}
          />
          {errors.upi && <div className="error-text">{errors.upi}</div>}

          <button
            className={`pay-btn ${!isPayEnabled() ? "disabled" : ""}`}
            onClick={handlePay}
            disabled={!isPayEnabled()}
          >
            Pay ${total.toFixed(2)}
          </button>
        </div>
      )}

      {/* CARD */}
      {method === "card" && (
        <div className="payment-box">
          <label className="field-label">Card Number</label>
          <input
            className={`field-input ${errors.number ? "has-error" : ""}`}
            type="text"
            inputMode="numeric"
            placeholder="1234-1234-1234-1234"
            value={card.number}
            onChange={(e) => onNumberChange(e.target.value)}
            maxLength={16}
          />
          {errors.number && <div className="error-text">{errors.number}</div>}

          <div style={{ display: "flex", gap: 12, width: "100%", justifyContent: "center" }}>
            <div style={{ flex: 1, maxWidth: 180 }}>
              <label className="field-label">Expiry (MM/YY)</label>
              <input
                className={`field-input ${errors.expiry ? "has-error" : ""}`}
                type="text"
                placeholder="MM/YY"
                value={card.expiry}
                onChange={(e) => onExpiryChange(e.target.value)}
                maxLength={5}
              />
              {errors.expiry && <div className="error-text">{errors.expiry}</div>}
            </div>

            <div style={{ flex: 1, maxWidth: 120 }}>
              <label className="field-label">CVV</label>
              <input
                className={`field-input ${errors.cvv ? "has-error" : ""}`}
                type="password"
                inputMode="numeric"
                placeholder="123"
                value={card.cvv}
                onChange={(e) => onCvvChange(e.target.value)}
                maxLength={3}
              />
              {errors.cvv && <div className="error-text">{errors.cvv}</div>}
            </div>
          </div>

          <label className="save-row">
            <input
              type="checkbox"
              checked={card.save}
              onChange={(e) => setCard((c) => ({ ...c, save: e.target.checked }))}
            />
            <span style={{ marginLeft: 8 }}>Save this card for future use</span>
          </label>

          <button
            className={`pay-btn ${!isPayEnabled() ? "disabled" : ""}`}
            onClick={handlePay}
            disabled={!isPayEnabled()}
          >
            Pay ${total.toFixed(2)}
          </button>
        </div>
      )}

      {/* COD */}
      {method === "cod" && (
        <div className="payment-box">
          <h4>Cash on Delivery</h4>
          <button className="pay-btn" onClick={handlePay}>
            Confirm Order
          </button>
        </div>
      )}

      {message && <div className="success-msg">{message}</div>}
    </div>
  );
}
