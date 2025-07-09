import React from "react";
import { Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "../styles/Navbar.css";

const Navbar = () => {
  const closeNavbar = () => {
    const navbarCollapse = document.getElementById("navbarNav");
    if (navbarCollapse) {
      navbarCollapse.classList.remove("show");
    }
  };
  return (
    // <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
    <nav className="navbar navbar-expand-lg navbar-dark rounded mt-3" style={{ borderRadius: '1rem', animation: "fadeSlideUp 1.5s ease-out" }}>
      <div className="container floating-navbar">
        {/* Left Side - Brand Name */}
        <Link className="navbar-brand d-flex justify-content-start align-items-center" to="/home">
          <img 
            src="/logo.png" 
            alt="Logo" 
            style={{ width: '40px', height: '40px', marginRight: '20px' }} 
          />
          Filtron Techniques
        </Link>

        {/* Toggle Button for Mobile View */}
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Right Side - Navigation Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/home" onClick={closeNavbar}>Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/company" onClick={closeNavbar}>Company</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/invoice" onClick={closeNavbar}>Invoice</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/purchase" onClick={closeNavbar}>Purchase</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/purchase-payment" onClick={closeNavbar}>Purchase Payment</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/payment" onClick={closeNavbar}>Payment</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
