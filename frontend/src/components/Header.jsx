import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Header() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      try { setUser(JSON.parse(raw)); } catch { localStorage.removeItem("user"); }
    } else {
      setUser(null);
    }
  }, []);
  
  return (
    <div>
      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg">
        <a className="navbar-brand" href="/">
          <span className="text-pink">Style</span>
          <span className="text-black">Verse</span>
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarSupportedContent"
        >
          <span className="navbar-toggler-icon">
            <i className="fas fa-bars"></i>
          </span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav mr-auto cinzel-font">
            <li className="nav-item active">
              <a className="nav-link" href="/about">
                About <span className="sr-only">(current)</span>
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/executivewear">
                Executive Wear
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/designerbags">
                Designer Bags
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/jewellery">
                Jewellery
              </a>
            </li>
          </ul>

          {/* Search Bar */}
          <div className="search-container d-flex align-items-center">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              className="search-input"
              placeholder="Search for products and brands"
            />
          </div>

          {/* Icons */}
          {user ? (
            <Link to="/profile" className="nav-icon mx-2" title="Profile">
              <i className="fa-solid fa-user"></i>
            
            </Link>
          ) : (
            <Link to="/login" className="nav-icon mx-2" title="Login">
              <i className="fa-solid fa-right-to-bracket"></i>
            </Link>
          )}

          <Link to="/wishlist" className="nav-icon mx-2" title="Wishlist">
            <i className="far fa-heart"></i>
          </Link>
          <Link to="/cart" className="nav-icon mx-2" title="Cart">
            <i className="fas fa-shopping-cart"></i>
          </Link>
        </div>
      </nav>
    </div>
  );
}


export default Header;
