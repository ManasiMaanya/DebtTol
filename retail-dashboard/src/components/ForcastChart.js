import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function ForecastChart({ forecast }) {
  const data = forecast.map((value, index) => ({
    day: `Day ${index + 1}`,
    demand: value,
  }));

  return (
    <div className="card">
      <h3>Demand Forecast</h3>
      <LineChart width={600} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="demand" stroke="#8884d8" />
      </LineChart>
    </div>
  );
}

export default ForecastChart;