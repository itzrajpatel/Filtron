import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/FirstPage.css";
import { Modal, Button } from "react-bootstrap";
// import TypewriterText from "./TypewriterText";

const FirstPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleCloseLoginModal = () => setShowLoginModal(false);
  const handleShowLoginModal = () => setShowLoginModal(true);

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
        setShowLogoutModal(true);
        setIsLoggedIn(false);
        // setTimeout(() => setShowLogoutModal(false), 1000);
        // navigate("/")
        setTimeout(() => {
          setShowLogoutModal(false);
          localStorage.removeItem("loginStatus");
          navigate("/");
        }, 1000);
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
        <h1 className="navbar-brand d-flex justify-content-center align-items-center text-light mb-5 flex-wrap text-center"
          style={{
            animation: "fadeSlideUp 1.5s ease-out",
            fontSize: "clamp(1.5rem, 5vw, 80px)",
            fontFamily: "Baskervville SC, serif",
            gap: "15px",
            lineHeight: "1.2"
          }}
        >
          Filtron Techniques
        </h1>
        {/* <TypewriterText /> */}
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          width: "100%", 
          height: "auto",
          padding: "1rem"
        }}>
          <img 
            src="/logo.png" 
            alt="Logo" 
            style={{ 
              width: "clamp(80px, 20vw, 150px)", 
              maxWidth: "100%", 
              height: "auto" 
            }} 
          />
        </div>
        <div className="row mt-5">
            <div className="col-12 col-md-6 mb-5" style={{ animation: "fadeSlideUp 1.5s ease-out" }}>
              <button
              className="btn w-100 glow-buttons"
              onClick={async () => {
                const isLoggedIn = await checkLoginStatus();
                if (isLoggedIn) {
                  navigate("/company");
                } else {
                  handleShowLoginModal();
                }
              }}
              style={buttonStyle}
              >
                Company Details
              </button>
            </div>
            <div className="col-12 col-md-6 mb-5" style={{ animation: "fadeSlideUp 1.5s ease-out" }}>
              <button
              className="btn w-100 glow-buttons"
              onClick={async () => {
                const isLoggedIn = await checkLoginStatus();
                if (isLoggedIn) {
                  navigate("/invoice");
                } else {
                  handleShowLoginModal();
                }
              }}
              style={buttonStyle}
              >
                Invoice Details
              </button>
            </div>
            <div className="col-12 col-md-6 mb-5" style={{ animation: "fadeSlideUp 1.5s ease-out" }}>
              <button
              className="btn w-100 glow-buttons"
              onClick={async () => {
                const isLoggedIn = await checkLoginStatus();
                if (isLoggedIn) {
                  navigate("/purchase");
                } else {
                  handleShowLoginModal();
                }
              }}
              style={buttonStyle}
              >
                Purchase Details
              </button>
            </div>
            <div className="col-12 col-md-6 mb-5" style={{ animation: "fadeSlideUp 1.5s ease-out" }}>
              <button
              className="btn w-100 glow-buttons"
              onClick={async () => {
                const isLoggedIn = await checkLoginStatus();
                if (isLoggedIn) {
                  navigate("/growth");
                } else {
                  handleShowLoginModal();
                }
              }}
              style={buttonStyle}
              >
                Reports
              </button>
            </div>
            <div className="col-12 mb-5 d-flex justify-content-center justify-content-lg-center">
              <div className="col-12 col-lg-6" style={{ animation: "fadeSlideUp 1.5s ease-out" }}>
                {isLoggedIn ? (
                  <button
                    className="btn w-100 glow-buttons"
                    onClick={handleLogout}
                    style={buttonStyle}
                  >
                    Logout
                  </button>
                ) : (
                  <button
                    className="btn w-100 glow-buttons"
                    onClick={() => navigate("/")}
                    style={buttonStyle}
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
        </div>

        {/* Login Modal */}
        <Modal show={showLoginModal} onHide={handleCloseLoginModal} centered style={{ borderRadius: "12px" }}>
          <Modal.Header closeButton className="bg-danger text-white">
            <Modal.Title style={{ width: "100%", textAlign: "center" }}>Login to access data!</Modal.Title>
          </Modal.Header>
          <Modal.Footer className="bg-danger">
            <Button variant="primary" onClick={handleCloseLoginModal} style={{ width: "100%", textAlign: "center" }}>
              OK
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Logout Modal */}
        <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)} centered>
          <Modal.Body className="bg-success text-white">
            <Modal.Title style={{ width: "100%", textAlign: "center" }}>Logged out successfully!!!</Modal.Title>
          </Modal.Body>
        </Modal>
    </div>
  );
};

export default FirstPage;
