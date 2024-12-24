import React, { useState, useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import AlertTable from './AlertTable';

// Register Chart.js components and the datalabels plugin
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const ActivityChart = ({ endpoint, app }) => {
  const [chartData, setChartData] = useState({
    labels: ['Normal', 'Abnormal'],
    datasets: [
      {
        label: 'Activity',
        data: [0.5, 0.5], // Initial values to lift the bars
        backgroundColor: ['#4CAF50', '#F44336'],
        barThickness: 40, // Adjust thickness as needed
        barPercentage: 0.5, // Reduce gaps between bars
        categoryPercentage: 0.5, // Reduce gaps between bar groups
      },
    ],
  });

  const [rawCounts, setRawCounts] = useState({ normal: 0, abnormal: 0 });
  const [updateKey, setUpdateKey] = useState(0);
  const [status, setStatus] = useState({
    loading: true,
    error: null,
    wsConnected: false, // Default to false
  });

  const maxYValue = 20;

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
          `http://44.204.255.126:6538/api/${endpoint}/${app}/alerts`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        if (result.status === 'ok') {
          const data = JSON.parse(result.data);
          const counts = data.reduce((acc, item) => {
            acc[item.severity] = (acc[item.severity] || 0) + 1;
            return acc;
          }, {});

          setRawCounts({
            normal: counts.normal || 0,
            abnormal: counts.abnormal || 0,
          });

          console.log('Initial counts:', rawCounts.normal, rawCounts.abnormal);

          // Adjust the chart data: Raise bars to 0.5 if count is 0
          setChartData(prev => ({
            ...prev,
            datasets: [{
              ...prev.datasets[0],
              data: [
                counts.normal > 0 ? counts.normal : 0.5,
                counts.abnormal > 0 ? counts.abnormal : 0.5,
              ]
            }]
          }));
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
  const wsRef = useRef(null);

  useEffect(() => {
    if (!endpoint || !app) return;

    const wsUrl = 'ws://44.204.255.126:6538/api/latestAlert'; // Use wss:// for secure connections
    if (!wsRef.current) {
      wsRef.current = new WebSocket(wsUrl);

      // WebSocket event listeners
      wsRef.current.addEventListener('open', () => {
        console.log('WebSocket connection established');
        setStatus((prev) => ({ ...prev, wsConnected: true })); // Update wsConnected to true
      });

      wsRef.current.addEventListener('message', (event) => {
        try {
          console.log('WebSocket message received:', event.data);
          const parsedData = JSON.parse(event.data);
          console.log('Parsed data:', parsedData);

          // Iterate through all endpoints in the data object
          if (parsedData?.data) {
            Object.keys(parsedData.data).forEach((currentEndpoint) => {
              const item = parsedData.data[currentEndpoint]?.fullDocument;
              if (item && item.app === app) {
                console.log('Matching item:', item); // Output the fullDocument

                // Update rawCounts based on severity
                setRawCounts((prev) => {
                  const newCounts = { ...prev };
                  if (item.severity === 'normal') {
                    newCounts.normal += 1;
                  } else if (item.severity === 'abnormal') {
                    newCounts.abnormal += 1;
                  }
                  return newCounts;
                });

                console.log('After counts:', rawCounts.normal, rawCounts.abnormal);

                // Update chart data
                setChartData((prev) => {
                  let newData = [];
                  console.log('Raw counts:', rawCounts.normal, rawCounts.abnormal);
                  if (rawCounts.normal === 0 && rawCounts.abnormal === 0) {
                    newData = [0.5, 0.5];
                  } else if (rawCounts.abnormal == 0) {
                    console.log('Normal is 0');
                    newData = [rawCounts.normal, 0.5];
                  }
                  else if (rawCounts.normal === 0) {
                    console.log('Norscsddmal is 0');
                    newData = [0.5, rawCounts.abnormal];
                  }
                  else {
                    newData = [rawCounts.normal, rawCounts.abnormal];
                  }
                  return {
                    ...prev,
                    datasets: [
                      {
                        ...prev.datasets[0],
                        data: newData,
                      },
                    ],
                  };
                });
              }
            });
          }
        } catch (error) {
          console.error('WebSocket message processing error:', error);
        }
      });

      wsRef.current.addEventListener('error', (error) => {
        console.error('WebSocket error:', error);
        setStatus((prev) => ({ ...prev, wsConnected: false })); // Set wsConnected to false on error
      });

      wsRef.current.addEventListener('close', (event) => {
        console.warn('WebSocket closed:', event.code, event.reason);
        setStatus((prev) => ({ ...prev, wsConnected: false })); // Set wsConnected to false on close
      });
    }

    // Cleanup WebSocket connection on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [endpoint, app, maxYValue]); // Dependencies for WebSocket setup


  useEffect(() => {
    // Update chartData when rawCounts change
    setChartData((prev) => {
      let newData = [];
      console.log('Raw counts:', rawCounts.normal, rawCounts.abnormal);
      if (rawCounts.normal === 0 && rawCounts.abnormal === 0) {
        newData = [0.5, 0.5];
      } else if (rawCounts.abnormal == 0) {
        console.log('Normal is 0');
        newData = [rawCounts.normal, 0.5];
      }
      else if (rawCounts.normal === 0) {
        console.log('Norscsddmal is 0');
        newData = [0.5, rawCounts.abnormal];
      }
      else {
        newData = [rawCounts.normal, rawCounts.abnormal];
      }

      return {
        ...prev,
        datasets: [
          {
            ...prev.datasets[0],
            data: newData,
          },
        ],
      };
    });
  }, [rawCounts]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: 'white' },
      },
      title: {
        display: true,
        text: 'Activity Monitor',
        color: 'white',
      },
      datalabels: {
        display: true,
        color: 'white',
        anchor: 'end',
        align: 'top',
        clip: false,
        font: {
          weight: 'bold',
          size: 14,
        },
        formatter: (value, context) => {
          const isNormal = context.dataIndex === 0;
          return isNormal ? rawCounts.normal : rawCounts.abnormal;
        },
        // Add these properties to control label positioning
        offset: (context) => {
          const value = context.dataset.data[context.dataIndex];
          // If the value is at or exceeds maxYValue, adjust the offset to keep it visible
          if (value >= maxYValue) {
            return -1; // Negative offset moves the label down from the top
          }
          return 0; // Default offset for values below maxYValue
        },
        align: (context) => {
          const value = context.dataset.data[context.dataIndex];
          // If the value is at or exceeds maxYValue, position the label inside the bar
          if (value >= maxYValue) {
            return 'top';
          }
          return 'top';
        },
        anchor: (context) => {
          const value = context.dataset.data[context.dataIndex];
          // If the value is at or exceeds maxYValue, anchor to the end (top) of the bar
          if (value >= maxYValue) {
            return 'end';
          }
          return 'end';
        },
        clamp: true, // Prevents labels from going outside the chart area
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: maxYValue,
        ticks: {
          color: 'white',
          stepSize: 1,
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.2)',
        },
        title: {
          display: true,
          text: 'Alert count',
          color: 'white',
          font: {
            weight: 'bold',
            size: 14,
          },
        },
      },
      x: {
        ticks: { color: 'white' },
        grid: {
          color: 'rgba(255, 255, 255, 0.2)',
        },
      },
    },
  };

  

  if (status.loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <svg className="animate-spin h-12 w-12 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg className="absolute inset-0 h-6 w-6 text-white m-auto" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9v8l10-12h-9z" />
            </svg>
          </div>
          <div className="text-white">Loading ...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-transparent rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#FF6600' }}>Application Details</h1>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Left Panel */}
        <div className="w-full md:w-1/3 bg-transparent p-6 rounded-lg shadow-lg">
  <h2 className="text-2xl font-bold text-yellow-400 mb-4">Details</h2>
  <p className="text-xl text-gray-300">
    <span className="font-bold text-white">Application Name:</span> {app ? app.replace(/\.\w+$/, '').replace(/^\w/, c => c.toUpperCase()) : 'N/A'}
  </p>
  <p className="text-xl text-gray-300">
    <span className="font-bold text-white">Status:</span>{' '}
    <span className={status.wsConnected ? 'text-green-500' : 'text-red-500'}>
      {status.wsConnected ? 'Connected' : 'Disconnected'}
    </span>
  </p>
  <p className="text-xl text-gray-300">
    <span className="font-bold text-white">Endpoint:</span> {endpoint ? endpoint.replace(/-/g, '.') : 'N/A'}
  </p>
</div>

        {/* Right Panel */}
        <div className="w-full md:w-1/2 ml-auto bg-gray-900 p-4 rounded-lg"> {/* Adjusted width and alignment */}
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
      <div className="w-full">
        <AlertTable endpoint={endpoint} app={app} />
      </div>
    </div>
  );
};

export default ActivityChart;
