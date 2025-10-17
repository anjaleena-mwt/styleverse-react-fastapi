import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/Register.css";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmpass: "",
    address: "",
    phone_number: "",
  });

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmpass: "",
    address: "",
    phone_number: "",
  });

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  function isValidPassword(password) {
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$&*]).{8,}$/;
    return passwordPattern.test(password);
  }

  function showError(inputId, message) {
    setErrors((prev) => ({ ...prev, [inputId]: message }));
  }

  function clearError(inputId) {
    setErrors((prev) => ({ ...prev, [inputId]: "" }));
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function submitToApi(formData) {
    try {
      setLoading(true);
      setApiError(null);

      const res = await fetch("http://127.0.0.1:8000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          user_email: formData.email,
          password: formData.password,
          confirm_password: formData.confirmpass,
          address: formData.address,
          phone_number: formData.phone_number,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message = json.detail || json.message || "Registration failed";
        setApiError(message);
        return false;
      }

      return true;
    } catch (err) {
      console.error("Register failed:", err);
      setApiError("Could not reach backend. Start the server.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError(null);

    const username = form.username.trim();
    const email = form.email.trim();
    const password = form.password.trim();
    const confirmpass = form.confirmpass.trim();
    const address = form.address.trim();
    const phone_number = form.phone_number.trim();

    let valid = true;

    if (username === "") {
      showError("username", "⚠️Username is required.");
      valid = false;
    } else {
      clearError("username");
    }

    if (email === "") {
      showError("email", "⚠️Email is required.");
      valid = false;
    } else if (!isValidEmail(email)) {
      showError(
        "email",
        "⚠️Please enter a valid email address (e.g., user@gmail.com)."
      );
      valid = false;
    } else {
      clearError("email");
    }

    if (password === "") {
      showError("password", "⚠️Password is required.");
      valid = false;
    } else if (!isValidPassword(password)) {
      showError(
        "password",
        "⚠️Password must be at least 8 characters, include lowercase, uppercase, number and one special symbol (@, #, $, &, *)."
      );
      valid = false;
    } else {
      clearError("password");
    }

    if (confirmpass === "") {
      showError("confirmpass", "⚠️Please confirm your password.");
      valid = false;
    } else if (password !== confirmpass) {
      showError("confirmpass", "⚠️Passwords do not match. Try again.");
      valid = false;
    } else {
      clearError("confirmpass");
    }

    if (address === "") {
      showError("address", "⚠️Address is required.");
      valid = false;
    } else {
      clearError("address");
    }

    if (phone_number === "") {
      showError("phone_number", "⚠️Phone number is required.");
      valid = false;
    } else if (!/^\+?\d{10,15}$/.test(phone_number)) {
      showError(
        "phone_number",
        "⚠️Enter a valid phone number (10-15 digits, optional + at start)."
      );
      valid = false;
    } else {
      clearError("phone_number");
    }

    if (!valid) return;

    const ok = await submitToApi({ username, email, password, confirmpass, address, phone_number });
    if (ok) {
      // Save all user info to localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({ username, user_email: email, address, phone_number })
      );
      // Redirect to login page
      navigate("/login");
    }
  }

  return (
    <div className="container">
      <form id="registerForm" onSubmit={handleSubmit}>
        <h1>REGISTRATION</h1>

        <div className="input-control">
          <label htmlFor="username">Enter Username :</label>
          <input
            type="text"
            id="username"
            name="username"
            value={form.username}
            onChange={handleChange}
            autoComplete="username"
          />
          <span className="error">{errors.username}</span>
        </div>

        <div>
          <label htmlFor="email">Enter Email :</label>
          <input
            type="text"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />
          <span className="error">{errors.email}</span>
        </div>

        <div>
          <label htmlFor="password">Enter Password :</label>
          <input
            type="password"
            id="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
          />
          <span className="error">{errors.password}</span>
        </div>

        <div>
          <label htmlFor="confirmpass">Confirm Password :</label>
          <input
            type="password"
            id="confirmpass"
            name="confirmpass"
            value={form.confirmpass}
            onChange={handleChange}
            autoComplete="new-password"
          />
          <span className="error">{errors.confirmpass}</span>
        </div>

        <div>
          <label htmlFor="address">Enter Address :</label>
          <input
            type="text"
            id="address"
            name="address"
            value={form.address}
            onChange={handleChange}
          />
          <span className="error">{errors.address}</span>
        </div>

        <div>
          <label htmlFor="phone_number">Enter Phone Number :</label>
          <input
            type="text"
            id="phone_number"
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
          />
          <span className="error">{errors.phone_number}</span>
        </div>

        {apiError && <div style={{ color: "red", marginBottom: 8 }}>{apiError}</div>}

        <div>
          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "SUBMIT"}
          </button>
        </div>

        <div style={{ textAlign: "center" }}>
          Already registered? <a href="/login">Login</a>
        </div>
      </form>
    </div>
  );
}
