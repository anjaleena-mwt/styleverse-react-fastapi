// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/Profile.css"; // create this file next

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // read user from localStorage
    const raw = localStorage.getItem("user");
    if (!raw) {
      // not logged in → redirect to login page
      navigate("/login");
      return;
    }
    try {
      setUser(JSON.parse(raw));
    } catch {
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  if (!user) return null; // render nothing while redirecting

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="avatar">
          {/* simple initial circle */}
          <div className="avatar-circle">{(user.username || "U")[0].toUpperCase()}</div>
        </div>

        <div className="profile-info">
          <h2>{user.username}</h2>
          <p><strong>Email:</strong> {user.user_email ?? "Not provided"}</p>
          <p><strong>Address:</strong> {user.address ?? "Not provided"}</p>
          <p><strong>Phone Number:</strong> {user.phone_number ?? "Not provided"}</p>

          <div className="profile-actions">
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
