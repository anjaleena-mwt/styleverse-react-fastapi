// src/pages/AdminDashboard.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome, admin. Use the links below to manage the site.</p>
      <ul><b>
        <li><Link to="/admin/products">Manage Products</Link></li>
      </b></ul>
    </div>
  );
}
