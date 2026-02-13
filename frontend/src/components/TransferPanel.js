import React from "react";

function TransferPanel({ transfers }) {
  return (
    <div className="chart-card">
      <h3>Transfer Recommendations</h3>
      {transfers.map((t, index) => (
        <div key={index} className="transfer" style={{
          padding: '15px',
          marginBottom: '10px',
          background: '#f5f5f5',
          borderRadius: '8px',
          borderLeft: '4px solid #619EDF'
        }}>
          Transfer <strong>{t.quantity}</strong> units of <strong>{t.product}</strong>  
          from Branch {t.from} → Branch {t.to}
        </div>
      ))}
    </div>
  );
}

export default TransferPanel;