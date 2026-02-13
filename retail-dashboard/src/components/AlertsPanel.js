import React from "react";

function AlertsPanel({ data }) {
  return (
    <div className="card">
      <h3>Inventory Alerts</h3>

      <div className="alert shortage">
        <strong>Shortage:</strong> {data.shortage.join(", ")}
      </div>

      <div className="alert surplus">
        <strong>Surplus:</strong> {data.surplus.join(", ")}
      </div>
    </div>
  );
}

export default AlertsPanel;