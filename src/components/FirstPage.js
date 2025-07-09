import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/FirstPage.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import TypewriterText from "./TypewriterText";

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
        setIsLoggedIn(false);
        toast.success("Logout successful");
        setTimeout(() => {
          localStorage.removeItem("loginStatus");
          navigate("/");
        }, 1000);
      } else {
        toast.error("Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Server error during logout");
    }
  };  

  return (
    <div className="container mt-3">
      <ToastContainer />
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
                  toast.error("Login to access data")
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
                  toast.error("Login to access data")
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
                  toast.error("Login to access data")
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
                  navigate("/purchase-payment");
                } else {
                  toast.error("Login to access data")
                }
              }}
              style={buttonStyle}
              >
                Purchase Payments
              </button>
            </div>
            <div className="col-12 col-md-6 mb-5" style={{ animation: "fadeSlideUp 1.5s ease-out" }}>
              <button
              className="btn w-100 glow-buttons"
              onClick={async () => {
                const isLoggedIn = await checkLoginStatus();
                if (isLoggedIn) {
                  navigate("/payment");
                } else {
                  toast.error("Login to access data")
                }
              }}
              style={buttonStyle}
              >
                Payment Details
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
                  toast.error("Login to access data")
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
    </div>
  );
};

export default FirstPage;
