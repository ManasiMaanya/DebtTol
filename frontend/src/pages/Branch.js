import React, { useState, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { useParams, useNavigate } from "react-router-dom";
import "../App.css";

function Branch() {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [branchCode, setBranchCode] = useState("");
  const [pendingFile, setPendingFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const branchTrend = [
    { month: "Jan", revenue: 2000 },
    { month: "Feb", revenue: 2400 },
    { month: "Mar", revenue: 2100 },
    { month: "Apr", revenue: 3000 },
    { month: "May", revenue: 3500 }
  ];

  const totalRevenue = branchTrend.reduce((a, b) => a + b.revenue, 0);
  const riskProducts = 3;
  const surplusProducts = 2;

  const categories = [
    { id: 1, name: "Electronics", profit: 8000 },
    { id: 2, name: "Clothing", profit: -2000 },
    { id: 3, name: "Groceries", profit: 4000 }
  ];

  const getBranchName = () => {
    const names = { 1: "Mumbai", 2: "Delhi", 3: "Bangalore" };
    return names[branchId] || `Branch ${branchId}`;
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPendingFile(file);
      setShowAuthModal(true);
    }
  };

  const handleAuthSubmit = () => {
    // Simple validation: check if branch code matches
    if (branchCode === `branch${branchId}`) {
      setUploadSuccess(true);
      setShowAuthModal(false);
      setBranchCode("");
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setUploadSuccess(false);
        setPendingFile(null);
      }, 5000);
    } else {
      alert(`Invalid branch code. Please use: branch${branchId}`);
    }
  };

  const handleAuthCancel = () => {
    setShowAuthModal(false);
    setBranchCode("");
    setPendingFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>Branch {branchId} - {getBranchName()} Dashboard</h1>
        <button className="upload-btn" onClick={handleUploadClick}>
          Upload
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {uploadSuccess && (
        <div className="success-message">
          ✓ File "{pendingFile?.name}" uploaded successfully! Authentication verified.
        </div>
      )}

      {/* Branch Revenue Chart */}
      <div className="chart-card">
        <h3>Branch Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={branchTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="month" stroke="#2C3F70" />
            <YAxis stroke="#2C3F70" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#2C3F70"
              strokeWidth={3}
              dot={{ fill: '#619EDF', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* KPI Cards */}
      <div className="kpi-container">
        <div className="kpi-card">
          <h4>Total Revenue</h4>
          <p>₹{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="kpi-card">
          <h4>Risk</h4>
          <p>{riskProducts}</p>
        </div>
        <div className="kpi-card">
          <h4>Surplus</h4>
          <p>{surplusProducts}</p>
        </div>
      </div>

      {/* Category Performance */}
      <div className="performance-section">
        <h3>Category Performance</h3>
        <div className="performance-bars">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`performance-bar ${cat.profit >= 0 ? 'profit' : 'loss'}`}
              onClick={() => navigate(`/dashboard/branch/${branchId}/category/${cat.id}`)}
            >
              <span>{cat.name}</span>
              <span>
                {cat.profit >= 0 ? "Profit" : "Loss"}: ₹{Math.abs(cat.profit).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Authentication Modal */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={handleAuthCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Branch Authentication Required</h3>
            <p>Please enter the branch code to verify your upload permission:</p>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
              Selected file: <strong>{pendingFile?.name}</strong>
            </p>
            <input
              type="password"
              placeholder="Enter Branch Code"
              value={branchCode}
              onChange={(e) => setBranchCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAuthSubmit()}
              autoFocus
            />
            <p style={{ fontSize: '13px', color: '#999', marginTop: '5px' }}>
              Hint: branch{branchId}
            </p>
            <div className="modal-buttons">
              <button className="modal-btn secondary" onClick={handleAuthCancel}>
                Cancel
              </button>
              <button className="modal-btn primary" onClick={handleAuthSubmit}>
                Verify & Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Branch;