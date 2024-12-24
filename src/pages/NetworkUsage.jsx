import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    TimeScale
} from 'chart.js';
import 'chartjs-adapter-luxon';
import { Activity, Package, Database, Network, Wifi, Pause, Play } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    TimeScale
);

const globalStore = {
    endpointData: new Map(),
    lastReceivedTime: new Map(),
    chartDatasets: [],
    endpoints: new Set()
};

const NetworkUsageChart = () => {
    const MAX_DATA_POINTS = 5;
    const Y_AXIS_MAX = 10;
    const UPDATE_INTERVAL = 1000;
    const OFFLINE_THRESHOLD = 15 * UPDATE_INTERVAL;
    const endpointData = useRef(globalStore.endpointData);
    const lastReceivedTime = useRef(globalStore.lastReceivedTime);
    const [endpoints, setEndpoints] = useState(globalStore.endpoints);
    const updateTimeout = useRef(null);
    const lastUpdateTime = useRef(Date.now());
    const [offlineEndpoints, setOfflineEndpoints] = useState(new Set());
    const ws = useRef(null);

    const colorPalette = [
        '#FF6600', // ISRO Orange
        '#0061F2', // ISRO Blue
        '#FFCC00', // Yellow
        '#4CAF50', // Green
        '#800080', // Purple
        '#F44336', // Red
        '#2196F3', // Light Blue
        '#9C27B0', // Pink
        '#FFC107', // Amber
        '#009688'  // Teal
    ];

    const getColorForEndpoint = (index) => {
        return colorPalette[index % colorPalette.length];
    };

    const [isPaused, setIsPaused] = useState(false);

    const handlePauseResume = () => {
        setIsPaused((prev) => !prev);
    };

    const [chartData, setChartData] = useState({ 
        datasets: globalStore.chartDatasets 
    });
    const prevDataRef = useRef({ datasets: globalStore.chartDatasets });

    const [networkStats, setNetworkStats] = useState({
        currentUsage: 0,
        totalPackets: 0,
        averagePacketSize: 0,
        totalData: 0,
        activeEndpoints: 0
    });
    const [status, setStatus] = useState('Connecting...');
    const [maxYValue, setMaxYValue] = useState(Y_AXIS_MAX);

    const formatBytes = (bytes, decimals = 2) => {
        if (!bytes || isNaN(bytes)) return '0 B';
        if (bytes === 0) return '0 B';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const validateDataPoint = (dataPoint) => {
        if (!dataPoint || typeof dataPoint !== 'object') return false;
        if (typeof dataPoint.network_usage !== 'number') return false;
        if (isNaN(dataPoint.network_usage)) return false;
        return true;
    };

    

    const processBufferedData = useCallback(() => {
        if (isPaused) return; // Do not process data if paused

        setChartData(prevDataRef => {
            const currentTime = Date.now();
            const newDatasets = [];
            const newOfflineEndpoints = new Set();
            let endpointIndex = 0;
            let newMaxYValue = maxYValue;

            endpoints.forEach((endpoint) => {
                const endpointInfo = endpointData.current.get(endpoint);
                const lastTime = lastReceivedTime.current.get(endpoint);

                if (!endpointInfo || !validateDataPoint(endpointInfo)) {
                    newOfflineEndpoints.add(endpoint);
                    return;
                }

                if (currentTime - lastTime > OFFLINE_THRESHOLD) {
                    newOfflineEndpoints.add(endpoint);
                    return;
                }

                const existingDataset = prevDataRef.datasets.find(ds => ds.label === endpoint);
                let newData = [...(existingDataset?.data || [])];

                // Ensure we have valid data
                if (newData.length > 0) {
                    const lastPoint = newData[newData.length - 1];
                    if (lastPoint.x === currentTime) {
                        newData = newData.slice(0, -1);
                    }
                }

                // Add new data point
                const networkUsage = Number(endpointInfo.network_usage.toFixed(2));
                newData.push({
                    x: currentTime,
                    y: networkUsage
                });

                 if (networkUsage > newMaxYValue) {
                    newMaxYValue = networkUsage;
                }


                // Keep only MAX_DATA_POINTS
                if (newData.length > MAX_DATA_POINTS) {
                    newData = newData.slice(-MAX_DATA_POINTS);
                }

                const color = getColorForEndpoint(endpointIndex);
                newDatasets.push({
                    label: endpoint,
                    data: newData,
                    fill: false, // Changed to false for better visibility
                    borderColor: color,
                    backgroundColor: color,
                    tension: 0.1, // Reduced for more precise lines
                    borderWidth: 3, // Increased for better visibility
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: 'white',
                    pointBorderColor: color,
                    pointBorderWidth: 2,
                    segment: {
                        borderColor: ctx => color
                    }
                });
                endpointIndex++;
            });

            globalStore.chartDatasets = newDatasets;
            prevDataRef.current = { datasets: newDatasets }; 

            if (newMaxYValue !== maxYValue) {
                setMaxYValue(newMaxYValue); // Update state for max Y value
            }


            // Calculate stats only if we have valid datasets
            if (newDatasets.length > 0) {
                const totalStats = Array.from(endpointData.current.values()).reduce(
                    (acc, curr) => ({
                        currentUsage: acc.currentUsage + (validateDataPoint(curr) ? curr.network_usage : 0),
                        totalPackets: acc.totalPackets + (curr.total_packets_processed || 0),
                        averagePacketSize: acc.averagePacketSize + (curr.average_packet_size || 0),
                        totalData: acc.totalData + (curr.total_data || 0),
                        activeEndpoints: endpoints.size
                    }),
                    {
                        currentUsage: 0,
                        totalPackets: 0,
                        averagePacketSize: 0,
                        totalData: 0,
                        activeEndpoints: 0
                    }
                );

                setNetworkStats(totalStats);
            }
            setOfflineEndpoints(newOfflineEndpoints);
            return { datasets: newDatasets };
        });
    }, [endpoints, isPaused, maxYValue]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (isPaused) return; // Skip updates if paused
    
            const currentTime = Date.now();
            const newOfflineEndpoints = new Set();
    
            // Check if each endpoint is offline
            endpoints.forEach((endpoint) => {
                const lastTime = lastReceivedTime.current.get(endpoint);
                if (!lastTime || currentTime - lastTime > OFFLINE_THRESHOLD) {
                    newOfflineEndpoints.add(endpoint);
                }
            });
    
            setOfflineEndpoints(newOfflineEndpoints);
    
            // Trigger chart updates to reflect the offline status
            processBufferedData();
        }, UPDATE_INTERVAL);
    
        return () => clearInterval(interval); // Cleanup on unmount
    }, [endpoints, isPaused, processBufferedData]);

    const handleNewDataPoint = useCallback((newData) => {
        if (isPaused) return; // Do not handle new data if paused

        try {
            // Destructure the received data based on the new backend format
            const data = newData.data; // Assuming the newData is like the JSON format you shared

            // Loop through each endpoint in the received data object
            Object.keys(data).forEach(endpoint => {
                const endpointInfo = data[endpoint].fullDocument; // Access the fullDocument for each endpoint

                // Validate and check if the endpoint data is correct
                if (!endpoint || isNaN(endpointInfo.network_usage)) {
                    console.warn('Invalid data received for endpoint:', endpoint, endpointInfo);
                    return;
                }

                // Add endpoint to the set of endpoints (for displaying data on the chart)
                const newEndpoints = new Set(globalStore.endpoints).add(endpoint);
                globalStore.endpoints = newEndpoints;
                setEndpoints(newEndpoints);

                // Update the endpoint data map with the new information
                globalStore.endpointData.set(endpoint, {
                    network_usage: Number(endpointInfo.network_usage),
                    total_packets_processed: Number(endpointInfo.total_packets_processed),
                    average_packet_size: Number(endpointInfo.average_packet_size),
                    total_data: Number(endpointInfo.total_data),
                    last_time_stamp: new Date(endpointInfo.last_time_stamp),
                });

                globalStore.lastReceivedTime.set(endpoint, Date.now());
                endpointData.current = globalStore.endpointData;
                lastReceivedTime.current = globalStore.lastReceivedTime;
                
                const currentTime = Date.now();
                const timeDiff = currentTime - lastUpdateTime.current;

                // If enough time has passed since the last update, process the buffered data
                if (timeDiff >= UPDATE_INTERVAL) {
                    processBufferedData();
                    lastUpdateTime.current = currentTime;
                } else if (!updateTimeout.current) {
                    // If not enough time has passed, buffer the data for the next cycle
                    updateTimeout.current = setTimeout(() => {
                        processBufferedData();
                        updateTimeout.current = null;
                        lastUpdateTime.current = Date.now();
                    }, UPDATE_INTERVAL - timeDiff);
                }
            });
        } catch (error) {
            console.error('Error processing new data point:', error);
        }
    }, [processBufferedData, isPaused]);

    useEffect(() => {
        // Only create WebSocket once when the component mounts


        
        if (!ws.current) {
            ws.current = new WebSocket('ws://44.204.255.126:6538/api/latestGraphNetworkUsage');
            // ws.current = new WebSocket('ws://localhost:5000');
            
            ws.current.onopen = () => {
                console.log('WebSocket connected');
                setStatus('Connected');
            };
    
            ws.current.onerror = (error) => {
                console.error('WebSocket error:', error);
                setStatus('Error');
            };
    
            ws.current.onclose = () => {
                console.log('WebSocket disconnected');
                setStatus('Disconnected');
            };
        }
    
        // Cleanup function - this will run when the component unmounts
        return () => {
            if (ws.current) {
                ws.current.close();
                ws.current = null;
            }
        };
    }, []);  // Empty dependency array ensures this effect runs only once
    
    useEffect(() => {
        // Check if WebSocket exists before assigning onmessage handler
        if (ws.current) {
            // When isPaused changes, we can update the onmessage logic
            ws.current.onmessage = (event) => {
                try {
                    const newData = JSON.parse(event.data);
                    
                    if (!isPaused) {
                        handleNewDataPoint(newData);  // Only process data if not paused
                    }
                } catch (error) {
                    console.error("Error processing WebSocket data:", error);
                }
            };
        }
    }, [handleNewDataPoint, isPaused]);

    console.log('Offline Endpoints:', offlineEndpoints);

    const roundUpToNextThreshold = (value) => {
        const thresholds = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 100000, 1000000, 10000000]; // Custom thresholds
    
        for (let i = 0; i < thresholds.length; i++) {
            if (value < thresholds[i]) {
                console.log("value", value);
                console.log("valsdjfsdv", thresholds[i]);
                return thresholds[i];
            }
        }
    
        // If value exceeds all thresholds, round up to the nearest 10000
        return Math.ceil(value / 10000) * 10000;
    };

    const shouldShowGrid = () => {
        return !((!chartData.datasets.length || 
            (offlineEndpoints.size === endpoints.size && endpoints.size > 0)));
    };

    

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'second',
                    displayFormats: {
                        second: 'HH:mm:ss'
                    }
                },
                grid: {
                    display: true,
                    color: 'rgba(255, 255, 255, 1)',
                },
                ticks: {
                    source: 'data',
                    autoSkip: true,
                    maxTicksLimit: 5,
                    font: {
                        size: 11
                    },
                    color: 'white'
                },
                title: {
                    display: true,
                    text: 'Time',
                    color: 'white',
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                }
            },
            y: {
                beginAtZero: true,
                min: 0,
                max:  roundUpToNextThreshold(maxYValue), // Dynamically set max Y value
                grid: {
                    display: shouldShowGrid(),
                    color: 'rgba(255, 255, 255, 1)',
                },
                ticks: {
                    callback: (value) => formatBytes(value * 1024),
                    font: {
                        size: 11
                    },
                    color: 'white'
                },
                title: {
                    display: true,
                    text: 'Network Usage',
                    color: 'white',
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                }
            },
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 16,
                    font: {
                        size: 12,
                        weight: '700'
                    }
                }
            },
            tooltip: {
                enabled: true,
            },
            datalabels: {
                display: false
            },
            annotation: {
                annotations: {
                    placeholder: {
                        type: 'label',
                        position: 'center',
                        content: () => offlineEndpoints.size == 0  ? 
                            'No Data to Display' : '',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        color: 'rgba(255, 255, 255, 1)',
                    }
                }
            }
        },
    };

    const plugins = [
        {
            id: 'noData',
            beforeDraw: (chart) => {
                const { ctx, data, chartArea, scales } = chart;
                
                // Check if there's no data or all endpoints are offline
                if (!data.datasets.length || 
                    (offlineEndpoints.size === endpoints.size && endpoints.size > 0)) {
                    
                    // Set background
                    ctx.save();
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                    ctx.fillRect(0, 0, chart.width, chart.height);
                    
                    // Configure text
                    ctx.fillStyle = 'white';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.font = 'bold 20px Arial';
                    
                    // Main message
                    ctx.fillText(
                        'No Data to Display',
                        chart.width / 2,
                        chart.height / 2 - 15
                    );
                    
                    // Sub message
                    ctx.font = '14px Arial';
                    const subText = endpoints.size === 0 
                        ? 'No endpoints connected'
                        : 'Waiting for network data...';
                    ctx.fillText(
                        subText,
                        chart.width / 2,
                        chart.height / 2 + 15
                    );
                    
                    ctx.restore();
                }
            }
        }
    ];
    
    return (
        <>
            <div className="w-full md:w-3/4 lg:w-full mx-auto">
                <div className="w-full h-[400px] bg-transparent">
                    <Line data={chartData} 
                    options={chartOptions} 
                    plugins={plugins} />
                </div>
                <div className="mt-4 text-center text-sm font-medium text-gray-500">
                    Status: <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${status === 'Connected' ? 'bg-green-100 text-green-700' :
                        status === 'Error' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                        }`}>{status}</span>
                </div>
                <div className="text-center mt-4">
                    <button
                        className={`px-4 py-2 rounded-full text-white ${isPaused ? 'bg-green-500 hover:bg-blue-500' : 'bg-red-500 hover:bg-blue-500'}`}
                        onClick={handlePauseResume}
                    >
                        {isPaused ? 'Resume' : 'Pause'}
                    </button>
                </div>
            </div>
        </>
    );
};

export default React.memo(NetworkUsageChart);