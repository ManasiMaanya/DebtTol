import React from "react";

function TransferPanel({ transfers }) {
  return (
    <div className="card">
      <h3>Transfer Recommendations</h3>
      {transfers.map((t, index) => (
        <div key={index} className="transfer">
          Transfer {t.quantity} units of {t.product}  
          from Branch {t.from} → Branch {t.to}
        </div>
      ))}
    </div>
  );
}

export default TransferPanel;