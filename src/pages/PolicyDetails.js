import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import './../styles/PolicyDetails.css';

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
    <p className="text-xl text-gray-600 font-medium">Loading policy details...</p>
  </div>
);

const PolicyDetails = () => {
  const [policyData, setPolicyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { name, endpoint } = location.state || {};

  useEffect(() => {
    const fetchPolicyDetails = async () => {
      try {
        const response = await axios.get(`http://44.204.255.126:6538/api/${endpoint}/getAllPolicies`);
        if (typeof response.data.policies === 'string') {
          const parsedPolicies = JSON.parse(response.data.policies);
          const matchingPolicy = parsedPolicies.find(policy => policy.name === name);
          setPolicyData(matchingPolicy);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching policy details:', error);
        setLoading(false);
      }
    };

    if (endpoint && name) {
      fetchPolicyDetails();
    }
  }, [endpoint, name]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!policyData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600 font-medium bg-gray-100 p-6 rounded-lg shadow-sm">
          No policy data found
        </div>
      </div>
    );
  }

  return (
    <div className="policy-details-container">
      <h1>Policy Information</h1>
      <div className="policy-info">
        <h2>{policyData.name}</h2>
        <div className='info-section'>
          <h3>Description:</h3>
          <p className="description">{policyData.description}</p>
        </div>
        
        <div className="info-section">
          <h3>Domains:</h3>
          <p>{policyData.domains.join(', ')}</p>
        </div>

        <div className="info-section">
          <h3>IP:</h3>
          <p>{policyData.ip.join(', ')}</p>
        </div>

        <div className="info-section">
          <h3>Ports:</h3>
          {policyData.ports.map((portInfo, index) => (
            <p key={index}>
              {portInfo.port} ({portInfo.protocol.join(', ')})
            </p>
          ))}
        </div>

        <div className="info-section">
          <h3>Purpose:</h3>
          <p>{policyData.purpose}</p>
        </div>

        <div className="info-section">
          <h3>Endpoint:</h3>
          <p>{policyData.endpoint.replace(/-/g, '.')}</p>
        </div>
      </div>
    </div>
  );
};

export default PolicyDetails;