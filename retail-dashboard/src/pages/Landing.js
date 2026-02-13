import React from "react";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../background.png";
import "../App.css";

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-page" style={{
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      <div className="landing-card">
        <h1>InvenTree</h1>
        <p>Smart Demand Forecasting & Optimization</p>
        <button className="landing-login-btn" onClick={() => navigate("/login")}>
          Login
        </button>
      </div>
    </div>
  );
}

export default Landing;