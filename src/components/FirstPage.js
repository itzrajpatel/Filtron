import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/FirstPage.css";
import TypewriterText from "./TypewriterText"

const FirstPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const buttonStyle = {
    backgroundColor: "transparent",
    color: "#fff",
    padding: "12px 24px",
    fontWeight: "600",
    fontSize: "16px",
    cursor: "pointer"
  };

  const checkLoginStatus = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/login-status");
      const data = await res.json();
      return data.logged_in === true;
    } catch (err) {
      console.error("Login status check failed:", err);
      return false;
    }
  };

  useEffect(() => {
    const fetchLoginStatus = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/login-status");
        const data = await res.json();
        setIsLoggedIn(data.logged_in === true);
      } catch (err) {
        console.error("Login status check failed:", err);
      }
    };
  
    fetchLoginStatus();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/logout", {
        method: "POST"
      });
      if (res.ok) {
        alert("Logged out successfully!");
        setIsLoggedIn(false);
      } else {
        alert("Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
      alert("Server error during logout");
    }
  };  

  return (
    <div className="container mt-3">
        <Link className="navbar-brand d-flex justify-content-center align-items-center text-light mb-5 flex-wrap text-center" to="/"
          style={{
            animation: "fadeSlideUp 1.5s ease-out",
            fontSize: "clamp(1.5rem, 5vw, 80px)",
            fontFamily: "Baskervville SC, serif",
            gap: "15px",
            lineHeight: "1.2"
          }}
        >
          <img
            src="/logo.png"
            alt="Logo"
            style={{
              width: "clamp(40px, 12vw, 70px)",
              height: "clamp(40px, 12vw, 70px)",
            }}
          />
          Filtron Techniques
        </Link>
        <TypewriterText />
        <div className="row mt-5">
            <div className="col-12 col-md-6 mb-5" style={{ animation: "fadeSlideUp 1.5s ease-out" }}>
              <button
              className="btn btn-primary w-100 glow-buttons"
              onClick={async () => {
                const isLoggedIn = await checkLoginStatus();
                if (isLoggedIn) {
                  navigate("/company");
                } else {
                  alert("Login to access data!");
                }
              }}
              style={buttonStyle}
              >
                Company Details
              </button>
            </div>
            <div className="col-12 col-md-6 mb-5" style={{ animation: "fadeSlideUp 1.5s ease-out" }}>
              <button
              className="btn btn-primary w-100 glow-buttons"
              onClick={async () => {
                const isLoggedIn = await checkLoginStatus();
                if (isLoggedIn) {
                  navigate("/invoice");
                } else {
                  alert("Login to access data!");
                }
              }}
              style={buttonStyle}
              >
                Invoice Details
              </button>
            </div>
            <div className="col-12 col-md-6 mb-5" style={{ animation: "fadeSlideUp 1.5s ease-out" }}>
              <button
              className="btn btn-primary w-100 glow-buttons"
              onClick={async () => {
                const isLoggedIn = await checkLoginStatus();
                if (isLoggedIn) {
                  navigate("/purchase");
                } else {
                  alert("Login to access data!");
                }
              }}
              style={buttonStyle}
              >
                Purchase Details
              </button>
            </div>
            <div className="col-12 col-md-6 mb-5" style={{ animation: "fadeSlideUp 1.5s ease-out" }}>
              <button
              className="btn btn-primary w-100 glow-buttons"
              onClick={async () => {
                const isLoggedIn = await checkLoginStatus();
                if (isLoggedIn) {
                  navigate("/growth");
                } else {
                  alert("Login to access data!");
                }
              }}
              style={buttonStyle}
              >
                Growth
              </button>
            </div>
            <div className="col-12 col-md-6 mb-5" style={{ animation: "fadeSlideUp 1.5s ease-out" }}>
              {isLoggedIn ? (
                <button
                  className="btn btn-danger w-100 glow-buttons"
                  onClick={handleLogout}
                  style={buttonStyle}
                >
                  Logout
                </button>
              ) : (
                <button
                  className="btn btn-primary w-100 glow-buttons"
                  onClick={() => navigate("/login")}
                  style={buttonStyle}
                >
                  Login
                </button>
              )}
            </div>
        </div>
    </div>
  );
};

export default FirstPage;
