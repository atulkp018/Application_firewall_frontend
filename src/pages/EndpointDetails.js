import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/EndpointDetails.css';

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="relative">
      {/* Outer ring */}
      <div className="w-16 h-16 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin"></div>
      {/* Inner ring */}
      <div className="absolute top-1 left-1 w-14 h-14 rounded-full border-4 border-blue-100 border-t-blue-400 animate-spin"></div>
      <div className="mt-4 text-center text-blue-500 font-medium">Loading...</div>
    </div>
  </div>
);

const EndpointDetails = () => {
  const [fulldata, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    axios.get(`http://44.204.255.126:6538/api/endpoints/${id}`)
      .then(response => {
        console.log('API Response:', response.data);
        let parsedData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
        setData(parsedData);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!fulldata) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">Error loading data</div>;
  }

  if (fulldata._id?.$oid !== id) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">Endpoint not found</div>;
  }

  const applications = fulldata.applications || [];
  const alerts = fulldata.recentAlerts ? [
    fulldata.recentAlerts._id,
    fulldata.recentAlerts.severity,
    fulldata.recentAlerts.message,
    fulldata.recentAlerts.timestamp,
    fulldata.recentAlerts.endpoint
  ] : [];

  const handleDeployPolicy = () => {
    navigate('/policy-form');
  };

  return (
    <div className="endpoint-details-container">
      <div className="header">
        <button className="back-button" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      <h1>Endpoint Details</h1>

      <div className="main-content">
        <div className="overview">
          <div className="overview-content">
            <div className="applications">
              <h2>Applications</h2>
              <div className="info-section">
                {applications.length > 0 ? (
                  applications.map((item, index) => (
                    <p className='font-bold' key={index}>{item}</p>
                  ))
                ) : (
                  <p>No applications available</p>
                )}
              </div>
            </div>

            <div className="policies">
              <h2>Endpoint Information</h2>
              <div className="info-section">
                <h3 style={{ fontWeight: 'bold', color: 'red' }}>Details</h3>
                <p><span className='font-bold'>Endpoint ID:</span> {fulldata._id.$oid}</p>
                <p><span className='font-bold'>Endpoint Name:</span> {fulldata.name}</p>
                <p><span className='font-bold'>Endpoint IP:</span> {fulldata.endpoint.replace(/-/g, '.')}</p>
              </div>
            </div>
          </div>
        </div>

        {alerts.length > 0 && (
          <div className="recent-alerts">
            <h2>Recent Alerts</h2>
            <div className="info-section">
              <p>Alert ID: {alerts[0]}</p>
              <p>Severity: {alerts[1]}</p>
              <p>Message: {alerts[2]}</p>
              <p>Timestamp: {alerts[3]}</p>
              <p>Endpoint: {alerts[4]}</p>
            </div>
          </div>
        )}

        <div className="policy-deployment">
          <button className="deploy-policy-button" onClick={handleDeployPolicy}>
            Deploy Policy
          </button>
        </div>
      </div>
    </div>
  );
};

export default EndpointDetails;