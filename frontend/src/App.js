import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';

import Home from './pages/Home';
import About from './pages/About';
import ExecutiveWear from './pages/ExecutiveWear';
import DesignerBags from './pages/DesignerBags';
import Jewellery from './pages/Jewellery';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';

function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/executivewear" element={<ExecutiveWear />} />
        <Route path="/designerbags" element={<DesignerBags />} />
        <Route path="/jewellery" element={<Jewellery />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
