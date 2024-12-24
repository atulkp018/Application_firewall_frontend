// NetworkUsageChart.jsx
import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import '../styles/NetworkUsageChart.css'; // Ensure you include the CSS

// Register all necessary components of Chart.js
Chart.register(...registerables);

const NetworkUsageChart = ({ data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (data && data.timestamps && data.usageData) {
      const ctx = chartRef.current.getContext('2d');

      new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.timestamps,
          datasets: [
            {
              label: 'Network Usage',
              data: data.usageData,
              borderColor: '#3498db',
              backgroundColor: 'rgba(255, 255, 255, 0)', // Transparent background for the line chart
              borderWidth: 2,
              tension: 0.1,
              pointRadius: 3,
              pointHoverRadius: 5,
            },
          ],
        },
        options: {
          scales: {
            x: {
              beginAtZero: false,
              title: {
                display: true,
                text: 'Time',
              },
              ticks: {
                autoSkip: true,
                maxTicksLimit: 10,
              },
            },
            y: {
              beginAtZero: false,
              title: {
                display: true,
                text: 'Usage',
              },
              ticks: {
                callback: function(value) {
                  return value.toFixed(2); // Format values to two decimal places
                },
              },
            },
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: function (tooltipItem) {
                  return `Usage: ${tooltipItem.raw.toFixed(2)}`; // Format tooltip to two decimal places
                },
              },
            },
            // Ensure the chart background is white
            backgroundColor: 'rgba(255, 255, 255, 1)',
          },
        },
      });

      return () => {
        if (chartRef.current) {
          const chartInstance = Chart.getChart(chartRef.current);
          if (chartInstance) {
            chartInstance.destroy();
          }
        }
      };
    }
  }, [data]);

  return (
    <div className="chart-container">
      <h2>Network Usage Over Time</h2>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default NetworkUsageChart;
