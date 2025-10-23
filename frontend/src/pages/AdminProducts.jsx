import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";

export default function AdminProducts() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState({ dresses: [], bags: [], jewellery: [] });
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // form state for add/edit — no reviews field
  const emptyForm = { id: "", category: "dresses", title: "", img: "/assets/images/default.jpg", price: "" };
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user?.is_admin) {
      navigate("/login");
      return;
    }
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/products`);
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const json = await res.json();
      setProducts(json);
    } catch (err) {
      console.error(err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditing(false);
    setMessage(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const payload = {
        ...form,
        price: form.price ? Number(form.price) : 0,
      };
      const res = await fetch(`${API_BASE}/admin/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.detail || `Add failed: ${res.status}`);
      }
      setMessage("Product added");
      resetForm();
      await fetchProducts();
    } catch (err) {
      console.error(err);
      setError(err.message || "Add failed");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (cat, p) => {
    console.log("startEdit called with:", cat, p);
    setEditing(true);
    setForm({
      id: p.id,
      category: cat,
      title: p.title || "",
      img: p.img || "/assets/images/default.jpg",
      price: p.price !== undefined && p.price !== null ? String(p.price) : "",
    });
    setMessage(null);
    setError(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (editing && !form.id) {
      setError("No product selected for update — please click Edit on a product first.");
      return;
    }

    console.log("handleUpdate with form:", form);
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const payload = {
        title: form.title || "",
        img: form.img || "/assets/images/default.jpg",
        price: form.price ? Number(form.price) : 0,
      };

      const res = await fetch(`${API_BASE}/admin/products/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.detail || `Update failed: ${res.status}`);
      }
      setMessage("Product updated");
      resetForm();
      await fetchProducts();
    } catch (err) {
      console.error(err);
      setError(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      console.log("Deleting product id:", id);
      const res = await fetch(`${API_BASE}/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.detail || `Delete failed: ${res.status}`);
      }
      setMessage("Product deleted");
      await fetchProducts();
    } catch (err) {
      console.error(err);
      setError(err.message || "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading admin products...</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1 className="admin-heading"><b>Admin — Product Management</b></h1>

      {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}
      {message && <div style={{ color: "green", marginBottom: 12 }}>{message}</div>}

      <section style={{ marginBottom: 24 }}>
        <h2>{editing ? "Edit Product" : "Add Product"}</h2>
        <form onSubmit={editing ? handleUpdate : handleAdd} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <select name="category" value={form.category} onChange={handleChange}>
            <option value="dresses">Dresses</option>
            <option value="bags">Bags</option>
            <option value="jewellery">Jewellery</option>
          </select>

          <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
          <input name="img" placeholder="Image URL" value={form.img} onChange={handleChange} />
          <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} required />

          <button type="submit" disabled={saving}>{saving ? (editing ? "Updating..." : "Adding...") : (editing ? "Update" : "Add Product")}</button>

          {editing && (
            <button
              type="button"
              onClick={() => {
                resetForm();
              }}
              disabled={saving}
            >
              Cancel
            </button>
          )}
        </form>
      </section>

      <section style={{ display: "grid", gap: 20 }}>
        {Object.keys(products).map((cat) => (
          <div key={cat} style={{ border: "1px solid #ddd", padding: 12 }}>
            <h3 style={{ textTransform: "capitalize" }}>{cat}</h3>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {(products[cat] || []).map((p) => (
                <div key={p.id} style={{ width: 220, border: "1px solid #eee", padding: 8 }}>
                  <img src={p.img} alt={p.title} style={{ width: "100%", height: 300, objectFit: "cover" }} />
                  <h4>{p.title}</h4>
                  <div>Price: ${p.price}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button onClick={() => startEdit(cat, p)} disabled={saving}>Edit</button>
                    <button onClick={() => handleDelete(p.id)} disabled={saving}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
