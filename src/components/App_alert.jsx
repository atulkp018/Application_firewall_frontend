import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import AlertTable from './AlertTable2';

const App_alert = () => {
  const { endpoint, app } = useParams(); // Get endpoint and app from URL params
  const [chartData, setChartData] = useState([]);
  const [status, setStatus] = useState({
    loading: true,
    error: null,
  });

  const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', 
    '#8884D8', '#FF6384', '#36A2EB', '#FFCE56'
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!endpoint || !app) {
        setStatus(prev => ({
          ...prev,
          error: 'Endpoint and app name are required',
          loading: false,
        }));
        return;
      }

      try {
        const response = await fetch(`http://44.204.255.126:6538/api/app_attack/${endpoint}/${app}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log('API Response:', result);

        const formattedData = result.attacks.map((attack, index) => ({
          name: attack.type,
          value: attack.count,
          color: COLORS[index % COLORS.length],
        }));
        console.log('Formatted Data for Chart:', formattedData);

        setChartData(formattedData);
        setStatus(prev => ({ ...prev, loading: false }));
      } catch (error) {
        console.error('Fetch Error:', error.message);
        setStatus(prev => ({
          ...prev,
          error: error.message,
          loading: false,
        }));
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 10000);
    return () => clearInterval(intervalId);
  }, [endpoint, app]);

  return (
    <div className="p-6 bg-transparent rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#FF6600' }}>
          Application Details
        </h1>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/3 bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-lg shadow-lg border-2 border-gray-700 ml-auto">
          <div className="border-b-2 border-yellow-400 pb-4 mb-4 text-center">
            <h2 className="text-2xl font-bold text-yellow-400">Details</h2>
          </div>
          <div className="border-2 border-blue-500 p-4 rounded-md mb-4">
            <p className="text-xl bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text text-center">
              <span className="font-bold text-white">Application Name:</span>{' '}
              {app ? app.replace(/\.\w+$/, '').replace(/^\w/, c => c.toUpperCase()) : 'N/A'}
            </p>
          </div>
          <div className="border-2 border-green-500 p-4 rounded-md">
            <p className="text-xl text-gray-300 text-center">
              <span className="font-bold text-white">Endpoint:</span>{' '}
              {endpoint ? endpoint.replace(/-/g, '.') : 'N/A'}
            </p>
          </div>
        </div>
        <div className="w-full md:w-1/2 ml-auto bg-gray-900 p-4 rounded-lg">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-yellow-400">Attack Graph</h2>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            {chartData.length > 0 ? (
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#f9f9f9',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            ) : (
              <div className="text-center text-gray-500">No data available to display</div>
            )}
          </ResponsiveContainer>
        </div>
      </div>
      <div className="w-full">
        <AlertTable endpoint={endpoint} app={app} />
      </div>
    </div>
  );
};

export default App_alert;
