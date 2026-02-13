import React from "react";
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

function Category() {
  const { branchId, categoryId } = useParams();
  const navigate = useNavigate();

  const categoryTrend = [
    { month: "Jan", revenue: 1000 },
    { month: "Feb", revenue: 1200 },
    { month: "Mar", revenue: 1100 },
    { month: "Apr", revenue: 1600 },
    { month: "May", revenue: 1800 }
  ];

  const totalRevenue = categoryTrend.reduce((a, b) => a + b.revenue, 0);
  const riskProducts = 1;
  const surplusProducts = 2;

  const products = [
    { id: 1, name: "Product A", profit: 2000 },
    { id: 2, name: "Product B", profit: -500 },
    { id: 3, name: "Product C", profit: 1200 }
  ];

  const getCategoryName = () => {
    const names = { 1: "Electronics", 2: "Clothing", 3: "Groceries" };
    return names[categoryId] || `Category ${categoryId}`;
  };

  return (
    <>
      <div className="page-header">
        <h1>{getCategoryName()}</h1>
      </div>

      {/* Category Trend Chart */}
      <div className="chart-card">
        <h3>Category Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={categoryTrend}>
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

      {/* Product Performance */}
      <div className="performance-section">
        <h3>Product Performance</h3>
        <div className="performance-bars">
          {products.map((product) => (
            <div
              key={product.id}
              className={`performance-bar ${product.profit >= 0 ? 'profit' : 'loss'}`}
              onClick={() =>
                navigate(
                  `/dashboard/branch/${branchId}/category/${categoryId}/product/${product.id}`
                )
              }
            >
              <span>{product.name}</span>
              <span>
                {product.profit >= 0 ? "Profit" : "Loss"}: ₹{Math.abs(product.profit).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Category;