// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./css/Login.css";

function Login() {
  const navigate = useNavigate();

  // controlled inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Clear inputs when page first loads
  useEffect(() => {
    setEmail("");
    setPassword("");
  }, []);

  // submit handler that calls backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const userEmail = email.trim();
    const userPassword = password;

    if (!userEmail || !userPassword) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_email: userEmail, password: userPassword }),
      });

      // Safely parse JSON (if parse fails we fall back to empty object)
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        // server returned an error object like { detail: "..." }
        setError(json.detail || "Login failed. Check credentials.");
        setLoading(false);
        return;
      }

      // success — store minimal user info in localStorage
      const userObj = {
        username: json.username,
        user_id: json.user_id,
        user_email: json.user_email, 
        address: json.address,
        phone_number: json.phone_number,
      };
      localStorage.setItem("user", JSON.stringify(userObj));

      // navigate to profile page after successful login
      navigate("/profile");
    } catch (err) {
      console.error("Login failed:", err);
      setError("Could not reach backend. Start your server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form id="loginForm" onSubmit={handleSubmit}>
        <h1>LOGIN</h1>

        <div>
          <label htmlFor="email">Enter Email :</label>
          <input
            type="text"
            id="email"
            name="email"
            placeholder="username@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="pass">Enter Password :</label>
          <input
            type="password"
            id="pass"
            name="pass"
            placeholder="Use Strong Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="error" style={{ color: "red" }}>{error}</p>}

        <div>
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "SUBMIT"}
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: 12 }}>
          New User? <a href="/register">Register</a>
        </div>
      </form>
    </div>
  );
}

export default Login;
