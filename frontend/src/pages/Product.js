import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { useParams } from "react-router-dom";
import "../App.css";

function Product() {
  const { branchId, categoryId, productId } = useParams();

  const originalForecast = [
    { month: "Jan", demand: 300 },
    { month: "Feb", demand: 350 },
    { month: "Mar", demand: 330 },
    { month: "Apr", demand: 420 },
    { month: "May", demand: 480 }
  ];

  const [demandForecast, setDemandForecast] = useState(originalForecast);
  const [isSimulated, setIsSimulated] = useState(false);

  const totalDemand = demandForecast.reduce((sum, item) => sum + item.demand, 0);
  const avgDemand = Math.round(totalDemand / demandForecast.length);
  const stockRisk = avgDemand > 400 ? "High" : "Moderate";

  const runSimulation = () => {
    // Boost forecast by 10-25% randomly
    const boosted = originalForecast.map(item => ({
      ...item,
      demand: Math.round(item.demand * (1.1 + Math.random() * 0.15))
    }));
    setDemandForecast(boosted);
    setIsSimulated(true);
  };

  const revertToOriginal = () => {
    setDemandForecast(originalForecast);
    setIsSimulated(false);
  };

  const getProductName = () => {
    const names = { 1: "Product A", 2: "Product B", 3: "Product C" };
    return names[productId] || `Product ${productId}`;
  };

  const getCategoryName = () => {
    const names = { 1: "Electronics", 2: "Clothing", 3: "Groceries" };
    return names[categoryId] || `Category ${categoryId}`;
  };

  return (
    <>
      <div className="page-header">
        <h1>Product - {getCategoryName()}</h1>
        <button className="simulation-btn" onClick={runSimulation}>
          Simulation
        </button>
      </div>

      {isSimulated && (
        <div className="success-message">
          ✓ AI Simulation completed! Demand forecast has been updated with optimized predictions.
          <div className="action-buttons">
            <button className="btn-back" onClick={revertToOriginal}>
              ← Back to Original Forecast
            </button>
          </div>
        </div>
      )}

      {/* Demand Forecast Chart */}
      <div className="chart-card">
        <h3>Product Demand Forecast</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={demandForecast}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="month" stroke="#2C3F70" />
            <YAxis stroke="#2C3F70" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="demand"
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
          <p>₹{totalDemand.toLocaleString()}</p>
        </div>
        <div className="kpi-card">
          <h4>Risk</h4>
          <p style={{ color: stockRisk === 'High' ? '#D86D6D' : '#6DD87D' }}>
            {stockRisk}
          </p>
        </div>
        <div className="kpi-card">
          <h4>Surplus</h4>
          <p>{avgDemand.toLocaleString()}</p>
        </div>
      </div>

      {/* Product Performance */}
      <div className="performance-section">
        <h3>Product Performance</h3>
        <div className="performance-bars">
          <div className="performance-bar loss">
            <span>{getProductName()} - Q1</span>
            <span>Loss: ₹2,500</span>
          </div>
          <div className="performance-bar profit">
            <span>{getProductName()} - Q2</span>
            <span>Profit: ₹4,200</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Product;