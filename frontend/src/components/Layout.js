import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../App.css";

function Layout({ children }) {
  const navigate = useNavigate();
  const params = useParams();
  const { branchId, categoryId, productId } = params;

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  const getCategoryName = () => {
    const names = { 
      1: "Electronics", 
      2: "Clothing", 
      3: "Groceries" 
    };
    return names[categoryId] || `Category ${categoryId}`;
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-top">
          <h2 className="logo">Retail AI</h2>

          <div className="nav-links">
            <p
              className={`nav-link ${!branchId ? "active-link" : ""}`}
              onClick={() => navigate("/dashboard")}
            >
              Overview
            </p>

            {branchId && (
              <p
                className={`nav-link ${branchId && !categoryId ? "active-link" : ""}`}
                onClick={() => navigate(`/dashboard/branch/${branchId}`)}
              >
                Branch {branchId}
              </p>
            )}

            {categoryId && (
              <p
                className={`nav-link ${categoryId && !productId ? "active-link" : ""}`}
                onClick={() => navigate(`/dashboard/branch/${branchId}/category/${categoryId}`)}
              >
                {getCategoryName()}
              </p>
            )}
          </div>
        </div>

        <div className="logout-container">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {children}
      </div>
    </div>
  );
}

export default Layout;