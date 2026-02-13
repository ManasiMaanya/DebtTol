import React from "react";

function BranchSelector({ branch, setBranch }) {
  return (
    <div className="card">
      <h3>Select Branch</h3>
      <select value={branch} onChange={(e) => setBranch(e.target.value)}>
        <option value="1">Branch 1</option>
        <option value="2">Branch 2</option>
        <option value="3">Branch 3</option>
      </select>
    </div>
  );
}

export default BranchSelector;