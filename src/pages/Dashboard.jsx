import React, { useEffect, useState, useCallback, useRef } from 'react';
import { FaNetworkWired, FaChartBar } from 'react-icons/fa';
import ApexCharts from 'react-apexcharts';
import ServerTable from '../components/Table';
import TableComponent from '../components/ApplicationsTable';
import NetworkUsageChart from './NetworkUsage';
import ActivityChart from '../components/ActivityChart';
import { Link } from 'react-router-dom'; 

const Dashboard = () => {

  const [showActivityChart, setShowActivityChart] = useState(false);

  const handleButtonClick = () => {
    setShowActivityChart(!showActivityChart);
  };


  // const [applications, setApplications] = useState([]);
  // const [isPaused, setIsPaused] = useState(false);

  // const chartRef = useRef(null);

  // const MAX_DATA_POINTS = 10;
  // const UPDATE_INTERVAL = 1000;

  // const updateChartData = useCallback(() => {
  //   if (!isPaused) {
  //     setData((prevData) => {
  //       const now = new Date();
  //       const newTimestamp = now.getTime();

  //       const updatedData = prevData.map(serverData => {
  //         const newValue = Math.random() * 90;
  //         const newData = [...serverData.data, { x: newTimestamp, y: newValue }];

  //         if (newData.length > MAX_DATA_POINTS) {
  //           newData.shift();
  //         }

  //         return { ...serverData, data: newData };
  //       });

  //       return updatedData;
  //     });
  //   }
  // }, [isPaused]);

  // const updateApplicationData = useCallback((receivedData) => {
  //   const newApplications = receivedData.applications.flatMap(({ serverId, applications }) =>
  //     applications.map(app => ({
  //       server: serverId,
  //       name: app.name,
  //       endpoint: app.endpoint,
  //       status: app.status,
  //       lastAccessed: app.lastAccessed,
  //     }))
  //   );
  //   setApplications(newApplications);
  // }, []);

  // useEffect(() => {
  //   const interval = setInterval(updateChartData, UPDATE_INTERVAL);
  //   return () => clearInterval(interval);
  // }, [updateChartData]);

  // useEffect(() => {
  //   const ws = new WebSocket("ws://localhost:5000");

  //   ws.onmessage = (event) => {
  //     try {
  //       const receivedData = JSON.parse(event.data);
  //       console.log("Received data:", receivedData);

  //       if (receivedData.networkUsage && receivedData.applications) {
  //         updateApplicationData(receivedData);
  //       } else {
  //         console.error("Invalid data format:", receivedData);
  //       }
  //     } catch (error) {
  //       console.error("Failed to parse WebSocket message:", error);
  //     }
  //   };

  //   return () => ws.close();
  // }, [updateApplicationData]);

  return (
    <>
      <div className='flex flex-wrap'>

        <div className='w-full md:w-2/3 lg:w-5/12 ml-0 mx-auto'>

        <div className='text-xl font-extrabold text-white text-center bg-gradient-to-r from-orange-500 via-blue-500 to-blue-700 py-2 rounded-lg shadow-xl transform transition-all duration-300 hover:scale-105'>
            <h2 className='flex justify-center items-center text-yellow-300'>
              <FaChartBar style={{ marginRight: '8px' }} /> Network Traffic
            </h2>
          </div>

          <div className=' p-2 w-full'>
            <NetworkUsageChart />
          </div>

        </div>

        <div className='w-full md:w-2/3 lg:w-5/12 ml-0 mx-auto'>
          <div className='text-xl font-extrabold text-white text-center bg-gradient-to-r from-orange-500 via-blue-500 to-blue-700 py-2 rounded-lg shadow-xl transform transition-all duration-300 hover:scale-105'>
            <h2 className='flex justify-center items-center text-yellow-300'>
              <FaChartBar style={{ marginRight: '8px' }} /> Network Statistics
            </h2>
          </div>
          <div className='p-4 w-full'>
            <ServerTable />
          </div>
        </div>
      </div>

      

      <div className="w-full max-h-96">
        <TableComponent />
      </div>


   
    </>
  );
};

export default Dashboard;
