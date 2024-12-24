import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const EndpointAttackChart = ({ endpoint }) => {
  const [chartData, setChartData] = useState([]);
  const [status, setStatus] = useState({
    loading: true,
    error: null,
  });

  const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
    '#8884D8', '#FF6384', '#36A2EB', '#FFCE56',
  ];

  // Fetch data for the specific endpoint
  const fetchData = async () => {
    if (!endpoint) {
      setStatus({ loading: false, error: 'Endpoint is required' });
      return;
    }

    try {
      const response = await fetch(`http://44.204.255.126:6538/api/endpoint_attack/${endpoint}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log('API Response:', result);

      // Group attacks by type and count
      const attackCounts = result.attacks.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + item.count;
        return acc;
      }, {});

      // Transform to chart data format
      const formattedData = Object.entries(attackCounts).map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length],
      }));

      console.log('Formatted Data:', formattedData);

      setChartData(formattedData);
      setStatus({ loading: false, error: null });
    } catch (error) {
      console.error('Fetch Error:', error.message);
      setStatus({ loading: false, error: error.message });
    }
  };

  useEffect(() => {
    fetchData(); // Initial fetch

    // Set up an interval to fetch data every minute
    const interval = setInterval(() => {
      console.log('Refreshing data...');
      fetchData();
    }, 10000); // 60000 ms = 1 minute

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, [endpoint]);

  return (
    <div className="p-1 bg-transparent rounded-lg shadow-lg">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full  bg-gray-900 p-1 rounded-lg">
          <ResponsiveContainer width="100%" height={400}>
            {chartData.length > 0 ? (
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius="70%"
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value})`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#f9f9f9',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                  }}
                />
              </PieChart>
            ) : status.loading ? (
              <div className="text-center text-gray-500">Loading data...</div>
            ) : (
              <div className="text-center text-red-500">{status.error || 'No data available'}</div>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default EndpointAttackChart;
