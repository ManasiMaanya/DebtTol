import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../background.png";
import "../App.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (username && password) {
      localStorage.setItem("authToken", "demo-token");
      navigate("/dashboard");
    } else {
      alert("Please enter credentials");
    }
  };

  return (
    <div className="login-page" style={{
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      <div className="login-card">
        <h2>Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
        />
        <button className="login-primary-btn" onClick={handleLogin}>
          Login
        </button>
        <button className="login-secondary-btn" onClick={() => navigate("/")}>
          Sign Up
        </button>
        <p className="create-account-text">Create a new account?</p>
      </div>
    </div>
  );
}

export default Login;