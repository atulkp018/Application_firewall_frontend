import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';

const ComparisonChart = ({ data }) => {
  const [isPaused, setIsPaused] = useState(false); // State to manage pause/resume
  const [chartData, setChartData] = useState(null); // State to store chart data
  const [pausedData, setPausedData] = useState(null); // State to store paused data

  console.log("Received Data in ComparisonChart:", data);

  // Function to reduce the frequency of data points
  const reduceDataFrequency = (dataset, step = 10) => {
    return dataset.filter((_, index) => index % step === 0);
  };

  // Initialize chart data on first render or when data changes
  useEffect(() => {
    if (data && data.normal && data.abnormal) {
      updateChartData(data);
    }
  }, [data]);

  // Update the chart data
  const updateChartData = (data) => {
    if (!data || (!data.normal.length && !data.abnormal.length)) {
      return; // No data to display
    }

    const newChartData = {
      labels: reduceDataFrequency(data.normal.map((entry) => entry.timestamp)),
      datasets: [
        {
          label: 'Normal Behavior',
          data: reduceDataFrequency(data.normal.map((entry) => entry.value)),
          fill: false, // Set to true if you want the area under the line to be filled
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 2, // Line thickness
          tension: 0.1, // Smooth line
        },
        {
          label: 'Abnormal Behavior',
          data: reduceDataFrequency(data.abnormal.map((entry) => entry.value)),
          fill: false, // Set to true if you want the area under the line to be filled
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 2, // Line thickness
          tension: 0.1, // Smooth line
        },
      ],
    };

    // If the chart is not paused, update the chart data
    if (!isPaused) {
      setChartData(newChartData); // Update state with new data
    } else {
      setPausedData(newChartData); // Save the new data for when we resume
    }
  };

  // Handle Pause/Resume functionality
  const handlePauseResume = () => {
    setIsPaused((prevState) => !prevState); // Toggle pause state

    if (!isPaused && chartData) {
      setPausedData(chartData); // Save the current chart data when pausing
    } else if (isPaused && pausedData) {
      setChartData(pausedData); // Restore the paused chart data when resuming
      setPausedData(null); // Clear paused data
    }
  };

  return (
    <div className="comparison-chart-container">
      <h2>Comparison of Normal vs. Abnormal Behavior</h2>
      {chartData ? (
        <Line
          data={chartData}
          options={{
            maintainAspectRatio: false,
            responsive: true,
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Observation Timestamp',
                  font: { size: 12 },
                },
                ticks: { font: { size: 10 } },
              },
              y: {
                title: {
                  display: true,
                  text: 'Measurement Value',
                  font: { size: 12 },
                },
                ticks: { font: { size: 10 } },
              },
            },
            plugins: {
              legend: {
                display: true,
                position: 'bottom',
                labels: {
                  font: { size: 12 },
                  color: '#333',
                  generateLabels: function (chart) {
                    const data = chart.data;
                    return data.datasets.map((dataset, i) => ({
                      text: dataset.label,
                      fillStyle: dataset.borderColor,
                      strokeStyle: dataset.borderColor,
                      lineWidth: 2,
                      hidden: !chart.isDatasetVisible(i),
                      datasetIndex: i,
                    }));
                  },
                },
              },
              tooltip: {
                callbacks: {
                  label: function (tooltipItem) {
                    return `${tooltipItem.dataset.label}: ${tooltipItem.raw}`;
                  },
                },
              },
            },
          }}
        />
      ) : (
        <p>No data available for the comparison chart.</p>
      )}
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <button onClick={handlePauseResume}>
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      </div>
    </div>
  );
};

export default ComparisonChart;
