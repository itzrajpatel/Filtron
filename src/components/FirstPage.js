import React from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/FirstPage.css";
import TypewriterText from "./TypewriterText"

const FirstPage = () => {
  const navigate = useNavigate();

  const buttonStyle = {
    backgroundColor: "transparent",
    color: "#fff",
    padding: "12px 24px",
    fontWeight: "600",
    fontSize: "16px",
    cursor: "pointer"
  };

  return (
    <div className="container mt-3">
        <Link className="navbar-brand d-flex justify-content-center align-items-center text-light mb-5 flex-wrap text-center" to="/first"
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
              onClick={() => navigate("/company")}
              style={buttonStyle}
              >
                Company Details
              </button>
            </div>
            <div className="col-12 col-md-6 mb-5" style={{ animation: "fadeSlideUp 1.5s ease-out" }}>
              <button
              className="btn btn-primary w-100 glow-buttons"
              onClick={() => navigate("/invoice")}
              style={buttonStyle}
              >
                Invoice Details
              </button>
            </div>
            {/* <div className="col-12 col-md-6 mb-5" style={{ animation: "fadeSlideUp 1.5s ease-out" }}>
              <button
              className="btn btn-primary w-100 glow-buttons"
              onClick={() => navigate("/add-company")}
              style={buttonStyle}
              >
                + Add Company
              </button>
            </div>
            <div className="col-12 col-md-6 mb-5" style={{ animation: "fadeSlideUp 1.5s ease-out" }}>
              <button
              className="btn btn-primary w-100 glow-buttons"
              onClick={() => navigate("/invoice/add-invoice")}
              style={buttonStyle}
              >
                + Add Invoice
              </button>
            </div> */}
            <div className="col-12 col-md-6 mb-5" style={{ animation: "fadeSlideUp 1.5s ease-out" }}>
              <button
              className="btn btn-primary w-100 glow-buttons"
              onClick={() => navigate("/purchase")}
              style={buttonStyle}
              >
                Purchase Details
              </button>
            </div>
            <div className="col-12 col-md-6 mb-5" style={{ animation: "fadeSlideUp 1.5s ease-out" }}>
              <button
              className="btn btn-primary w-100 glow-buttons"
              onClick={() => navigate("/growth")}
              style={buttonStyle}
              >
                Growth
              </button>
            </div>
        </div>
    </div>
  );
};

export default FirstPage;
