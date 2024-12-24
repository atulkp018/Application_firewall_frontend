// src/components/PolicyDetails.js
import React from 'react';
import '../styles/PolicyDetails.css';

const PolicyDetails = ({ policy, onEdit }) => {
  if (!policy) return <div className="no-policy">Select a policy to view details.</div>;

  return (
    <div className="policy-details">
      <h2>Policy Details</h2>
      <div className="details">
        <p><strong>ID:</strong> {policy.id}</p>
        <p><strong>Name:</strong> {policy.name}</p>
        <p><strong>Description:</strong> {policy.description}</p>
        {/* <p><strong>Priority:</strong> {policy.priority}</p> */}
      </div>
      <h3>Rules:</h3>
      <ul className="rules-list">
        {policy.rules.map((rule, index) => (
          <li key={index}>
            {rule.type} {rule.target}: {rule.value}
          </li>
        ))}
      </ul>
      {/* <h3>Time-Based Rules:</h3>
      <p>Start: {policy.timeBasedRules.startTime}</p>
      <p>End: {policy.timeBasedRules.endTime}</p> */}
      <button className="edit-btn" onClick={() => onEdit(policy)}>Edit Policy</button>
    </div>
  );
};

export default PolicyDetails;