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

function ForecastChart({ forecast }) {
  const data = forecast.map((value, index) => ({
    day: `Day ${index + 1}`,
    demand: value,
  }));

  return (
    <div className="chart-card">
      <h3>Demand Forecast</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="day" stroke="#2C3F70" />
          <YAxis stroke="#2C3F70" />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="demand" 
            stroke="#2C3F70" 
            strokeWidth={3}
            dot={{ fill: '#619EDF', strokeWidth: 2, r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ForecastChart;