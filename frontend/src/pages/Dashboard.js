import React from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function Dashboard() {
  const navigate = useNavigate();
  
  const revenueTrend = [
    { month: "Jan", revenue: 4000 },
    { month: "Feb", revenue: 4500 },
    { month: "Mar", revenue: 4200 },
    { month: "Apr", revenue: 5000 },
    { month: "May", revenue: 5300 }
  ];

  const branches = [
    { id: 1, name: "Mumbai", profit: 12000 },
    { id: 2, name: "Delhi", profit: -4000 },
    { id: 3, name: "Bangalore", profit: 8000 }
  ];

  return (
    <>
      <div className="page-header">
        <h1>Company Overview</h1>
      </div>

      {/* Revenue Trend Chart */}
      <div className="chart-card">
        <h3>Company Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={revenueTrend}>
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

      {/* Branch Performance */}
      <div className="performance-section">
        <h3>Branch Performance</h3>
        <div className="performance-bars">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className={`performance-bar ${branch.profit >= 0 ? 'profit' : 'loss'}`}
              onClick={() => navigate(`/dashboard/branch/${branch.id}`)}
            >
              <span>{branch.name}</span>
              <span>
                {branch.profit >= 0 ? "Profit" : "Loss"}: ₹
                {Math.abs(branch.profit).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Dashboard;