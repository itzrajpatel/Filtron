import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/AddCompany.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
  
    if (username === "FtIndia" && password === "Krishvirus@5729") {
      try {
        const response = await fetch("http://localhost:5000/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ username })
        });
  
        if (response.ok) {
          alert("Login Successful!!!");
          navigate("/");
        } else {
          alert("Login failed to update status in database.");
        }
      } catch (err) {
        console.error("Login error:", err);
        alert("Server error occurred.");
      }
    } else {
      alert("Invalid username or password");
    }
  };

  return (
    <div className="container mt-5">
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

      {/* <form onSubmit={handleLogin} className="p-4 rounded text-light glow-table" style={{ animation: "fadeSlideUp 1.5s ease-out" }}>
        <div className="form-group mb-3">
          <label>Username</label>
            <input
              type="text"
              className="form-control mt-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
        </div>

        <div className="form-group mb-3">
          <label>Password</label>
          <input
            type="password"
            className="form-control mt-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Login
        </button>
      </form> */}
      <div className="d-flex justify-content-center align-items-center" style={{ marginTop: "160px" }}>
        <div className="w-100" style={{ maxWidth: "500px" }}>
          <form onSubmit={handleLogin} className="p-4 rounded text-light glow-table" style={{ animation: "fadeSlideUp 1.5s ease-out" }}>
            <div className="form-group mb-3">
              <label>Username</label>
              <input
                type="text"
                className="form-control mt-2"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group mb-3">
              <label>Password</label>
              <input
                type="password"
                className="form-control mt-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
