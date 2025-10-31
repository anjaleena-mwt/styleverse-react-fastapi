// src/pages/AdminProducts.jsx
import React, { useEffect, useState } from "react";
import axios from "axios"; //axios is a library to make HTTP requests (talk to your backend API)

export default function AdminProducts() {
  const [grouped, setGrouped] = useState({ dresses: [], bags: [], jewellery: [] });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ product_id: "", title: "", img: "", price: "", category: "dresses" });
  const [editingId, setEditingId] = useState(null);

  const API = "http://127.0.0.1:8000";
  const PLACEHOLDER = "/assets/images/placeholder.png";

  // Fetch products on page load
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/products`);
      setGrouped(res.data || { dresses: [], bags: [], jewellery: [] });
      setMessage("");
    } catch (err) {
      console.error(err);
      setMessage("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value })); //setForm(f => ({ ...f, [name]: value })) copies the previous form and replaces only the changed field. This keeps the other fields intact.

  const handleAddOrUpdate = async (e) => {
    e.preventDefault(); //stops the form from doing a full page reload (default browser behavior).
    setMessage(""); //clear any prior message

    if (!form.product_id || !form.title || !form.price) {
      setMessage("product_id, title, and price are required");
      return;
    }

    try {
      const payload = { ...form, price: Number(form.price) };
      if (editingId) {
        await axios.put(`${API}/admin/products/${encodeURIComponent(editingId)}`, payload);
        setMessage("Product updated");
        setEditingId(null);
      } else {
        await axios.post(`${API}/admin/products`, payload);
        setMessage("Product added");
      }
      setForm({ product_id: "", title: "", img: "", price: "", category: "dresses" });
      await fetchProducts();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.detail || "Operation failed");
    }
  };

  const startEdit = (p) => {
    setEditingId(p.product_id);
    setForm({ ...p });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (product_id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`${API}/admin/products/${encodeURIComponent(product_id)}`);
      setMessage("Deleted");
      await fetchProducts();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.detail || "Failed to delete");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ product_id: "", title: "", img: "", price: "", category: "dresses" });
    setMessage("");
  };

  // Image with fallback
  const Img = ({ src, alt, style }) => {
    const [err, setErr] = useState(false);
    return (
      <img
        src={!src || err ? PLACEHOLDER : src}
        alt={alt || "product image"}
        onError={() => setErr(true)}
        style={style}
      />
    );
  };

  // --- Styles ---
  const containerStyle = { padding: 20, fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Arial" };
  const formGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 };
  const cardGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12, marginTop: 12 };
  const cardStyle = { display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", padding: 12, borderRadius: 12, background: "#fff", border: "1px solid #eef2f6", boxShadow: "0 6px 18px rgba(2,6,23,0.04)", transition: "transform .12s ease, box-shadow .12s ease" };
  const cardLeft = { display: "flex", gap: 12, alignItems: "center", maxWidth: "70%" };
  const thumbBox = { width: 120, height: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "#fafafa", borderRadius: 8, overflow: "hidden", border: "1px solid #f3f6f9" };
  const thumbImg = { width: "100%", height: "100%", objectFit: "contain", display: "block" };

  return (
    <div style={containerStyle}>
      <h2>Admin — Products</h2>
      <p style={{ color: "#4b5563", marginTop: 6, marginBottom: 12 }}>Manage products — add, edit or delete.</p>

      {message && <div style={{ marginBottom: 12, color: "#046b56" }}>{message}</div>}

      {/* Add/Edit Form */}
      <form onSubmit={handleAddOrUpdate} style={{ marginBottom: 18, padding: 12, borderRadius: 8, background: "#fbfdff", border: "1px solid #eef2f6" }}>
        <h3>{editingId ? "Edit product" : "Add new product"}</h3>
        <div style={formGrid}>
          <div>
            <label>Product ID</label>
            <input name="product_id" value={form.product_id} onChange={handleChange} disabled={!!editingId} placeholder="ef1 or bag1" style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #e6eef6" }} />
          </div>
          <div>
            <label>Title</label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="Title" style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #e6eef6" }} />
          </div>
          <div>
            <label>Image URL</label>
            <input name="img" value={form.img} onChange={handleChange} placeholder="/assets/images/ef1.jpg" style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #e6eef6" }} />
            <small style={{ display: "block", marginTop: 6, color: "#6b7280" }}>Tip: place images in <code>public/assets/images/</code></small>
          </div>
          <div>
            <label>Price</label>
            <input name="price" value={form.price} onChange={handleChange} type="number" placeholder="200" style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #e6eef6" }} />
          </div>
          <div>
            <label>Category</label>
            <select name="category" value={form.category} onChange={handleChange} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #e6eef6" }}>
              <option value="dresses">dresses</option>
              <option value="bags">bags</option>
              <option value="jewellery">jewellery</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <button type="submit" style={{ padding: "8px 12px", borderRadius: 8, background: "#0ea5a4", color: "#fff", border: "none", cursor: "pointer" }}>
              {editingId ? "Save changes" : "Add product"}
            </button>
            {editingId && <button type="button" onClick={cancelEdit} style={{ padding: "8px 12px", borderRadius: 8, background: "#eef2ff", border: "1px solid #e6eef6", cursor: "pointer" }}>Cancel</button>}
          </div>
        </div>

        {/* Live preview */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 12 }}>
          <div style={thumbBox}><Img src={form.img} alt={form.title} style={thumbImg} /></div>
          <div>
            <div style={{ fontWeight: 700 }}>{form.title || "Preview title"}</div>
            <div style={{ color: "#6b7280", marginTop: 6 }}>{form.category} • {form.price ? `₹${form.price}` : "₹0"}</div>
          </div>
        </div>
      </form>

      {/* Products List */}
      {loading ? <div>Loading...</div> : (
        <>
          {["dresses", "bags", "jewellery"].map(category => (
            <div key={category}>
              <h4 style={{ marginTop: category === "dresses" ? 0 : 18, marginBottom: 6 }}>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
              <div style={cardGrid}>
                {grouped[category].map(p => (
                  <div key={p.product_id} style={cardStyle} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-6px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                    <div style={cardLeft}>
                      <div style={thumbBox}><Img src={p.img} alt={p.title} style={thumbImg} /></div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</div>
                        <div style={{ color: "#6b7280", marginTop: 6 }}>{p.product_id} • {p.category}</div>
                        <div style={{ marginTop: 8, fontWeight: 700 }}>₹{p.price}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <button onClick={() => startEdit(p)} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #e6eef6", background: "#fff", cursor: "pointer" }}>Edit</button>
                      <button onClick={() => handleDelete(p.product_id)} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #fee2e2", background: "#fff", color: "#b91c1c", cursor: "pointer" }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
