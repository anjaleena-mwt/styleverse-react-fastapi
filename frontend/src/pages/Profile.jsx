import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editingAddress, setEditingAddress] = useState(false);
  const [address, setAddress] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      navigate("/login");
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setUser(parsed);
      setAddress(parsed.address || "");
    } catch {
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  if (!user) return null;

  const saveAddress = () => {
    setEditingAddress(false);
    const updatedUser = { ...user, address };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="avatar">
          <div className="avatar-circle">{(user.username || "U")[0].toUpperCase()}</div>
        </div>

        <div className="profile-info">
          <h2>{user.username}</h2>
          <p><strong>Email:</strong> {user.user_email ?? "Not provided"}</p>
          <p><strong>Phone Number:</strong> {user.phone_number ?? "Not provided"}</p>

          {/* Address Section */}
          <div className="address-section">
            <strong>Address:</strong>
            {editingAddress ? (
              <div className="address-edit">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your address"
                />
                <button className="btn-save" onClick={saveAddress}>Save</button>
              </div>
            ) : (
              <p className="address-view" onClick={() => setEditingAddress(true)}>
                {address || "Click to add address"}
              </p>
            )}

            
          </div>


          {/* Actions */}
          <div className="profile-actions">
            <button onClick={() => navigate("/orders")} className="btn btn-primary">Orders</button>
            <button onClick={() => navigate("/wishlist")} className="btn btn-primary">Wishlist</button>
            <button
              className="btn btn-logout"
              onClick={() => {
                localStorage.removeItem("user");
                navigate("/login");
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
