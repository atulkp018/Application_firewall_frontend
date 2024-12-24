import React, { useState, useEffect } from 'react';

const AlertTable = ({ endpoint, app }) => {
  const [alerts, setAlerts] = useState([]);
  const [status, setStatus] = useState({
    loading: true,
    error: null,
    wsConnected: false
  });
  const [selectedAlert, setSelectedAlert] = useState(null); // State for selected alert for modal
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility

  // Fetch initial data from REST API
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!endpoint || !app) {
        setStatus(prev => ({ 
          ...prev, 
          error: "Endpoint and app name are required",
          loading: false 
        }));
        return;
      }

      try {
        const response = await fetch(
          // `https://context-aware-firewall-sih-2024.onrender.com/api/${endpoint}/${app}/alerts`
          `http://44.204.255.126:6538/api/${endpoint}/${app}/alerts`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        if (result.status === 'ok') {
          const data = JSON.parse(result.data);
          // Add ID to each alert
          const alertsWithIds = data.map((alert, index) => ({
            ...alert,
            alertId: `Alert ${index + 1}`
          }));
          setAlerts(alertsWithIds);
        }
      } catch (error) {
        setStatus(prev => ({ ...prev, error: error.message }));
      } finally {
        setStatus(prev => ({ ...prev, loading: false }));
      }
    };

    fetchInitialData();
  }, [endpoint, app]);

  // WebSocket connection
  useEffect(() => {
    if (!endpoint || !app) return;

    // const wsUrl = 'wss://context-aware-firewall-sih-2024.onrender.com/api/latestAlert';
    const wsUrl = 'ws://44.204.255.126:6538/api/latestAlert';
    const ws = new WebSocket(wsUrl);

    ws.addEventListener('open', () => {
      setStatus(prev => ({ ...prev, wsConnected: true }));
    });

    ws.addEventListener('message', (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        
        if (parsedData?.data && parsedData.data[endpoint]) {
          const newAlert = parsedData.data[endpoint].fullDocument;
          
          if (newAlert.app === app) {
            setAlerts(prevAlerts => {
              const newAlertWithId = {
                ...newAlert,
                alertId: `Alert ${prevAlerts.length + 1}`
              };
              return [...prevAlerts, newAlertWithId];
            });
          }
        }
      } catch (error) {
        console.error('WebSocket message processing error:', error);
      }
    });

    ws.addEventListener('error', () => {
      setStatus(prev => ({ ...prev, wsConnected: false }));
    });

    ws.addEventListener('close', () => {
      setStatus(prev => ({ ...prev, wsConnected: false }));
    });

    return () => {
      ws.close();
    };
  }, [endpoint, app]);

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'text-red-600';   // Bright red
      case 'medium':
        return 'text-orange-500'; // Vibrant orange
      case 'low':
        return 'text-green-600';  // Fresh green
      default:
        return 'text-gray-400';   // Light grey for unknown severity
    }
  };
  

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const openModal = (alert) => {
    setSelectedAlert(alert);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAlert(null);
  };

  if (status.loading) {
    return <div className="text-white">Loading alerts...</div>;
  }

  if (status.error) {
    return <div className="text-red-500">Error: {status.error}</div>;
  }

  return (
    <div className="w-full bg-transparent rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-orange-500">Alert Dashboard</h1>
      </div>
      
      <div className="overflow-x-auto">
        <div className="max-h-[600px] overflow-y-auto">
          <table className="min-w-full bg-gray-800 rounded-lg">
            {/* Make the table header sticky */}
            <thead className="bg-blue-500 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-white font-semibold">
                  ALERT ID
                </th>
                <th className="px-6 py-3 text-left text-white font-semibold">
                  DESCRIPTION
                </th>
                <th className="px-6 py-3 text-left text-white font-semibold">
                  SEVERITY
                </th>
                <th className="px-6 py-3 text-left text-white font-semibold">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {alerts.map((alert, index) => (
                <tr 
                  key={index}
                  className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}
                >
                  <td className="px-6 py-4 text-white">
                    {alert.alertId}
                  </td>
                  <td className="px-6 py-4 text-white">
                    {alert.message}
                  </td>
                  <td className={`px-6 py-4 ${getSeverityColor(alert.severity)}`}>
                    {alert.severity}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded"
                      onClick={() => openModal(alert)}
                    >
                      VIEW DETAILS
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg w-96">
            <h2 className="text-2xl text-orange-500 font-bold mb-4">Alert Details</h2>
            <p className="text-white"><strong>Alert ID:</strong> {selectedAlert.alertId}</p>
            <p className="text-white"><strong>Description:</strong> {selectedAlert.message}</p>
            <p className={`text-white ${getSeverityColor(selectedAlert.severity)}`}>
              <strong>Severity:</strong> {selectedAlert.severity}
            </p>
           
            <div className="mt-4 flex justify-end">
              <button 
                className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertTable;
