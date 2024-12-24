import React, { useEffect, useState, useRef } from 'react';
import { Server, Activity, WifiOff } from 'lucide-react';
import axios from 'axios';


const ACTIVE_THRESHOLD = 15000; // 15 seconds threshold for active status

const globalStore = {
  serverData: {},
  activeEndpoints: new Map(),
  lastDataReceived: null,
  totalUniqueEndpoints: parseInt(localStorage.getItem('totalUniqueEndpoints')) || 0,
  knownEndpoints: new Set(JSON.parse(localStorage.getItem('knownEndpoints')) || [])
};

// Custom Card Component
const Card = ({ children, className = "" }) => {
  return (
    <div className={`rounded-lg shadow bg-white ${className}`}>
      {children}
    </div>
  );
};

const CardContent = ({ children, className = "" }) => {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
};

const ServerTable = () => {
  const [serverData, setServerData] = useState(globalStore.serverData);
  const [lastDataReceived, setLastDataReceived] = useState(globalStore.lastDataReceived);
  const [stats, setStats] = useState({
    totalUniqueEndpoints: globalStore.totalUniqueEndpoints, // Change this to totalUniqueEndpoints
    active: 0,
    offline: globalStore.totalUniqueEndpoints
  });
  
  const activeEndpoints = useRef(globalStore.activeEndpoints);
  const knownEndpoints = useRef(globalStore.knownEndpoints);

  const updateTotalUniqueEndpoints = (endpoint) => {
    if (!knownEndpoints.current.has(endpoint)) {
      knownEndpoints.current.add(endpoint);
      globalStore.knownEndpoints = knownEndpoints.current;
      globalStore.totalUniqueEndpoints = knownEndpoints.current.size;
      
      // Update localStorage
      localStorage.setItem('totalUniqueEndpoints', globalStore.totalUniqueEndpoints);
      localStorage.setItem('knownEndpoints', JSON.stringify([...knownEndpoints.current]));
      
      setStats(prevStats => ({
        ...prevStats,
        totalUniqueEndpoints: globalStore.totalUniqueEndpoints,
        offline: globalStore.totalUniqueEndpoints - prevStats.active
      }));
    }
  };

  const fetchData = async () => {
    console.log('Fetching data from backend...');  // Log when the GET request is made
  
    try {
      // Fetch data from the backend
      const response = await axios.get('http://44.204.255.126:6538/api/getConnectionsInfo'); // Correct endpoint
      console.log('Data fetched successfully:', response.data); // Log the data received from the backend
  
      // Parse the received data (it is a string, so we need to convert it to an array)
      const rawData = JSON.parse(response.data.data);  // Convert string to array
      console.log('Raw data parsed:', rawData); // Log the raw data after parsing
  
      // Regular expression to check if the endpoint is in 'x-x-x-x' format (with dashes)
      const dashFormatRegex = /^(\d{1,3}-){3}\d{1,3}$/;
  
      // Process the data to match the table format and validate endpoints
      const processedData = rawData
        .map((item) => {
          let endpoint = item.endpoint;
          if (typeof endpoint === 'string' && dashFormatRegex.test(endpoint)) {
            endpoint = endpoint.replace(/-/g, '.').trim();
            updateTotalUniqueEndpoints(endpoint);
            return { endpoint };
          }
          return null;
        })
        .filter(Boolean);// Filter out any invalid or null endpoints
  
      console.log('Processed data:', processedData);  // Log the processed data
  
      // Calculate total number of unique endpoints
      const uniqueEndpoints = new Set(processedData.map(item => item.endpoint));  // Extract all endpoint values
      globalStore.totalUniqueEndpoints = uniqueEndpoints.size;
      
      

      // Update stats with the totalUniqueEndpoints
      setStats((prevStats) => ({
        ...prevStats,
        totalUniqueEndpoints: globalStore.totalUniqueEndpoints,
        offline: globalStore.totalUniqueEndpoints // Update with the newly calculated unique endpoints
      }));
  
    } catch (error) {
      console.error('Error fetching data:', error);  // Log any error that occurs during the request
    }
  };
  
  // Call the fetchData function initially
  useEffect(() => {
    fetchData();
    
    // Cleanup function
    return () => {
      // Save final state to localStorage before unmounting
      localStorage.setItem('totalUniqueEndpoints', globalStore.totalUniqueEndpoints);
      localStorage.setItem('knownEndpoints', JSON.stringify([...knownEndpoints.current]));
    };
  }, []);

  useEffect(() => {
    const activeThreshold = 5000; // 5 seconds threshold
    
    const checkActiveStatus = setInterval(() => {
      const currentTime = Date.now();
      
      // Clean up inactive endpoints
      let activeCount = 0;
      activeEndpoints.current.forEach((timestamp, endpoint) => {
        if (currentTime - timestamp <= ACTIVE_THRESHOLD) {
          activeCount++;
        } else {
          activeEndpoints.current.delete(endpoint);
        }
      });

      // Update stats
       setStats(prevStats => ({
        ...prevStats,
        active: activeCount,
        offline: globalStore.totalUniqueEndpoints - activeCount,
      
      }));
      
      // Update both global store and state
      
      
    }, 1000);

    return () => clearInterval(checkActiveStatus);
  }, []);

  // useEffect(() => {
  //   const websocketTimeout = 5000; // 5 seconds timeout
    
  //   // Check WebSocket connection status periodically
  //   const checkConnection = setInterval(() => {
  //     const currentTime = Date.now();
      
  //     if (!lastDataReceived || (currentTime - lastDataReceived) > websocketTimeout) {
  //       // No data received within timeout period, set active to 0
  //       setStats(prevStats => ({
  //         ...prevStats,
  //         active: 0,
  //         offline: prevStats.totalUniqueEndpoints
  //       }));
  //     }
  //   }, 1000); // Check every second

  //   return () => clearInterval(checkConnection);
  // }, [lastDataReceived]);

  const ws = useRef(null);

  useEffect(() => {
    // Initialize WebSocket connection once when the component mounts
    if (!ws.current) {
      // ws.current = new WebSocket('ws://localhost:5000'); // Or your other WebSocket URL
      ws.current = new WebSocket('ws://44.204.255.126:6538/api/latestGraphNetworkUsage');
      ws.current.onopen = () => {
        console.log('WebSocket connected');
        
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        
      };
    }

    // Cleanup function to close the WebSocket when the component unmounts
    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, []);  // Empty dependency array ensures this effect runs only once

  useEffect(() => {
    // Handle WebSocket messages, but only when it's not paused
    if (ws.current) {
      ws.current.onmessage = (event) => {
        try {
          const item = JSON.parse(event.data);
          const endpoint = Object.keys(item.data)[0];
          const data = item.data[endpoint].fullDocument;

          const currentTime = Date.now();
          globalStore.lastDataReceived = currentTime;
          setLastDataReceived(currentTime);
          
          // Update active endpoints map
          activeEndpoints.current.set(endpoint, currentTime);
          globalStore.activeEndpoints = activeEndpoints.current;
          updateTotalUniqueEndpoints(endpoint);
          
          setServerData((prevData) => {
            const updatedData = { ...prevData };
            if (updatedData[endpoint]) {
              updatedData[endpoint].network_usage += data.network_usage;
              updatedData[endpoint].last_time_stamp = data.last_time_stamp;
            } else {
              updatedData[endpoint] = { ...data };
              
             
            }

            
            console.log("Global Unique", globalStore.totalUniqueEndpoints);
            // Recalculate totalUniqueEndpoints whenever the data changes
            

            // Recalculate stats
            globalStore.serverData = updatedData;
            return updatedData;
          });

        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        }
      };
    }
  }, [serverData]);  

  const formatNetworkUsage = (usage) => {
    if (usage < 1024) return `${usage.toFixed(2)} B`;
    if (usage < 1024 * 1024) return `${(usage / 1024).toFixed(2)} KB`;
    return `${(usage / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6 p-4">
  {/* Server Table */}
  {Object.keys(serverData).length > 0 && ( // Check if serverData has any data
    <div className="p-4">
      <div className="max-h-96 overflow-y-auto">
        <table className="min-w-full border border-gray-200 bg-transparent">
          <thead className="sticky top-0">
            <tr>
              <th className="py-2 px-4 border-b border-r border-gray-200 bg-blue-500 text-left text-sm font-semibold text-white">
                Server
              </th>
              <th className="py-2 px-4 border-b border-gray-200 bg-blue-500 text-left text-sm font-semibold text-white">
                Network Usage
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.values(serverData).map((server) => (
              <tr key={server.documentId} className="hover:bg-gray-100 hover:bg-opacity-50">
                <td className="py-2 px-4 border-b border-r border-gray-200">
                  {server.endpoint ? server.endpoint.replace(/-/g, '.') : 'N/A'}
                </td>
                <td className="py-2 px-4 border-b border-gray-200">
                  {server.network_usage ? server.network_usage.toFixed(2) : '0.00'} Bytes
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )}

  {/* Statistics Cards */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Card className="bg-opacity-90 backdrop-blur-sm transform transition-all duration-300 hover:scale-105">
      <CardContent className="flex items-center p-1">
        <div className="rounded-full bg-blue-100 p-2">
          <Server className="h-6 w-6 text-blue-600" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">Total Endpoints</p>
          <p className="text-2xl font-semibold text-gray-900">{stats.totalUniqueEndpoints}</p>
        </div>
      </CardContent>
    </Card>

    <Card className="bg-opacity-90 backdrop-blur-sm transform transition-all duration-300 hover:scale-105">
      <CardContent className="flex items-center p-1">
        <div className="rounded-full bg-green-100 p-2">
          <Activity className="h-6 w-6 text-green-600" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">Active Endpoints</p>
          <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
        </div>
      </CardContent>
    </Card>

    <Card className="bg-opacity-90 backdrop-blur-sm transform transition-all duration-300 hover:scale-105">
      <CardContent className="flex items-center p-1">
        <div className="rounded-full bg-red-100 p-2">
          <WifiOff className="h-6 w-6 text-red-600" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">Offline Endpoints</p>
          <p className="text-2xl font-semibold text-gray-900">{stats.offline}</p>
        </div>
      </CardContent>
    </Card>
  </div>
</div>
  );
};

export default ServerTable;