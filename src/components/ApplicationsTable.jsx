import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; 
import PolicyForm from './PolicyForm';

const TableComponent = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Function to fetch data
    const fetchData = async () => {
      console.log('Fetching data from backend...');  // Log when the GET request is made

      try {
        // const response = await axios.get('https://context-aware-firewall-sih-2024.onrender.com/api/getConnectionsInfo');
        const response = await axios.get('http://44.204.255.126:6538/api/getConnectionsInfo'); // Correct endpoint
        console.log('Data fetched successfully:', response.data); // Log the data received from the backend

        // Parse the received data (it is a string, so we need to convert it to an array)
        const rawData = JSON.parse(response.data.data);  // Convert string to array44.204.255.126:6538
        console.log('Raw data parsed:', rawData); // Log the raw data after parsing

        // Process the data to match the table format
        const processedData = rawData.map((item) => ({
          _id: item._id["$oid"],  // Extract the _id if needed for unique identification
          endpoint: item.endpoint.replace(/-/g, '.'),  // Process the endpoint (replace '-' with '.')
          app: item.app,  // Get the app name
          status: item.status === 'ESTABLISHED' ? 'Running' : 'Stopped',  // Process the status
        }));

        setData(processedData); // Update the state with the processed data
        console.log('Processed data:', processedData);  // Log the processed data

      } catch (error) {
        console.error('Error fetching data:', error);  // Log any error that occurs during the request
      }
    };

    // Fetch data initially and then at regular intervals
    fetchData();
    const interval = setInterval(() => {
      console.log('Fetching data again after interval...');  // Log each interval fetch
      fetchData();
    }, 5000); // Adjust interval as needed

    // Cleanup the interval on component unmount
    return () => {
      console.log('Cleaning up interval...');
      clearInterval(interval);
    };
  }, []);  // Empty dependency array means this effect runs once on mount and when cleaned up

  console.log('Current data state:', data); // Log the current state of `data`


  return (
    <div className="w-full bg-transparent rounded-lg shadow-lg p-6">
      <div className="text-center mb-6 sticky top-0 bg-transparent z-20">
        <h1 className="text-2xl font-bold text-orange-500">Connection Dashboard</h1>
      </div>
      
      <div className="overflow-x-auto">
        <div className="max-h-[600px] overflow-y-auto">
          <table className="min-w-full bg-gray-800 rounded-lg table-fixed">
            <thead className="bg-blue-500 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-white font-semibold">Endpoint</th>
                <th className="px-6 py-3 text-left text-white font-semibold">App Name</th>
                <th className="px-6 py-3 text-left text-white font-semibold">Status</th>
                <th className="px-6 py-3 text-center text-white font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {data.map((item, index) => (
                <tr
                  key={item._id}
                  className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}
                >
                  <td className="px-6 py-4 text-white">{item.endpoint}</td>
                  <td className="px-6 py-4 text-white">{item.app}</td>
                  <td className={`px-6 py-4 ${
                    item.status === 'Running' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {item.status}
                  </td>
                  <td className="px-6 py-4 flex gap-2 justify-center">
                    <Link 
                      to={`/Dashboard/app/${item.endpoint.replace(/\./g, '-')}/${item.app}`}
                    >
                      <button className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded">
                        VIEW DETAILS
                      </button>
                    </Link>
                    <Link to={`/policy-form`}>
                      <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                        APPLY POLICY
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TableComponent;
