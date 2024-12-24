import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import NetworkUsageChart from '../components/NetworkUsageChart.jsx';
import ComparisonChart from '../components/ComparisonChart.jsx'; // Import the ComparisonChart component
import AlertTable from '../components/AlertTable.jsx'; // Import the AlertTable component
import '../styles/ApplicationsDetails.css'; // Ensure the correct path
import '../styles/NetworkUsageChart.css'; // Ensure the correct path
import '../styles/AlertTable.css'; // Ensure the correct path
import '../styles/ComparisonChart.css'; // Ensure the correct path

const ApplicationDetails = () => {
  
  const { appName } = useParams();
  const [networkUsageData, setNetworkUsageData] = useState({
    timestamps: [],
    usageData: [],
  });
  const [appDetails, setAppDetails] = useState({});
  const [serverId, setServerId] = useState('');
  const [alerts, setAlerts] = useState([]); // State for alerts
  const [comparisonData, setComparisonData] = useState({
    normal: [],
    abnormal: [],
  }); // State for comparison chart data

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:5000');
  
    ws.onopen = () => {
      console.log('WebSocket connection opened.');
    };
  
    ws.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);
      const { networkUsage, applications, alerts, comparison } = parsedData;
  
      console.log("Full data received from server:", parsedData); // Log the entire payload
      console.log("Comparison data from server:", comparison); // Log comparison data specifically
  
      // Find server and application details
      const serverData = applications.find((server) =>
        server.applications.some((app) => app.name === appName)
      );
  
      if (serverData) {
        const appData = serverData.applications.find((app) => app.name === appName);
        setAppDetails(appData);
        setServerId(serverData.serverId);
  
        // Set network usage data for the chart
        const usageData = networkUsage[serverData.serverId];
  
        if (usageData && appName) {
          setNetworkUsageData({
            timestamps: Object.keys(usageData).map(() => new Date().toLocaleTimeString()), // Mock timestamps
            usageData: Object.keys(usageData).map((key) => usageData[key] || 0),
          });
        }
      } else {
        console.error("No server data found for application:", appName);
      }
  
      setAlerts(alerts); // Update alerts
  
      // Verify comparison data format
      const formatComparisonData = (dataArray) =>
        (dataArray || [])
          .filter((item) => item && item.timestamp && item.value !== undefined) // Filter out invalid entries
          .map((item) => {
            const date = new Date(item.timestamp);
            return {
              timestamp: !isNaN(date) ? date.toLocaleTimeString() : 'Invalid Date', // Convert to readable time or mark as invalid
              value: item.value,
            };
          });
  
      const formattedNormalData = formatComparisonData(comparison?.normal);
      const formattedAbnormalData = formatComparisonData(comparison?.abnormal);
  
      // Log if any data has zero values or is invalid
      formattedNormalData.forEach((data, index) => {
        if (data.value === 0) {
          console.warn(`Zero value found in normal data at index ${index}:`, data);
        }
      });
  
      formattedAbnormalData.forEach((data, index) => {
        if (data.value === 0) {
          console.warn(`Zero value found in abnormal data at index ${index}:`, data);
        }
      });
  
      // Set comparison data
      setComparisonData({
        normal: formattedNormalData,
        abnormal: formattedAbnormalData,
      });
    };
  
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  
    ws.onclose = () => {
      console.log('WebSocket connection closed.');
    };
  
    return () => {
      ws.close();
    };
  }, [appName]);
  
  

  console.log("Formatted Comparison Data State:", comparisonData); // Debugging the formatted state data

  return (
    <>
    
      <h1 className="heading">Application Details Panel</h1>
      <div className='cont'>
      <div className="details-box">
        <div className="detail-item">
          <p>
            <strong>Application Name:</strong> {appDetails.name || 'N/A'}
          </p>
        </div>
        <div className="detail-item">
          <p>
            <strong>IP Address:</strong> {appDetails.endpoint || 'N/A'}
          </p>
        </div>
        <div className="detail-item">
          <p>
            <strong>Status:</strong> {appDetails.status || 'N/A'}
          </p>
        </div>
        <div className="detail-item">
          <p>
            <strong>Server ID:</strong> {serverId}
          </p>
        </div>
      </div>
      
      <div className='usage'>
      {networkUsageData.usageData.length > 0 && (
        <NetworkUsageChart data={networkUsageData} />
      )}
      </div>
      <div className='vd'>
        
        {comparisonData.normal.length > 0 || comparisonData.abnormal.length > 0 ? (
          <ComparisonChart data={comparisonData} />
        ) : (
          <p>No comparison data available.</p>
        )}
      </div>
      </div>
      <AlertTable /> 
    </>
  );
};

export default ApplicationDetails;
