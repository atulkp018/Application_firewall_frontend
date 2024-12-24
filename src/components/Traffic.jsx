import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { RiSignalTowerLine } from 'react-icons/ri';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

const NetworkTraffic = () => {
  const [trafficData, setTrafficData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const fetchTrafficData = async () => {
      try {
        const response = await fetch('/traffic.json');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        setTrafficData(result.networkTraffic);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrafficData();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  // Prepare chart data with separate lines for Current, Peak, and Average
  const chartData = {
    labels: ['Day 1', 'Point 2', 'Point 3', 'Point 4', 'Point 5'], // Labels corresponding to data points
    datasets: [
      {
        label: 'Current Traffic',
        data: trafficData.currentTraffic, // Use array from JSON
        borderColor: '#FF6384',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderWidth: 2,
        fill: false,
      },
      {
        label: 'Peak Traffic',
        data: trafficData.peakTraffic, // Use array from JSON
        borderColor: '#36A2EB',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderWidth: 2,
        fill: false,
      },
      {
        label: 'Average Traffic',
        data: trafficData.averageTraffic, // Use array from JSON
        borderColor: '#4BC0C0',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 2,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: !isSmallScreen,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `${tooltipItem.dataset.label}: ${tooltipItem.raw} GB`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Time (Hour)', // x-axis title
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Traffic (GB)', // y-axis title
        },
        ticks: {
          callback: function (value) {
            return `${value} GB`; // Append 'GB' to the y-axis labels
          },
        },
      },
    },
  };

  const brTags = !isSmallScreen ? Array(3).fill(null).map((_, index) => <br key={index} />) : null;

  return (
    <div className="network-traffic-box">
      <h2><RiSignalTowerLine /> Network Traffic</h2>
      {isSmallScreen ? <br />: null}
      {brTags}
      
      <Line data={chartData} options={options} />
      
    </div>
  );
};

export default NetworkTraffic;
