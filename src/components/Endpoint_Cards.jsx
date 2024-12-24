// Endpoint_Cards.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EndpointCard from './EndpointCard';

function Endpoint_Cards() {
    const [apidata, setData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("https://context-aware-firewall-sih-2024.onrender.com/api/fetchEndpoints");
                const parsedData = JSON.parse(response.data.data);
                setData(parsedData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    if (!apidata) {
        return (
            <div className="text-center py-20">
                <h1 className="text-2xl font-bold text-gray-700 animate-pulse">Loading...</h1>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent mt-0 mb-0">
            <h1 className="text-center text-lg font-bold text-red-800 mb-0 mt-0">DPI Endpoints</h1>
            <div className="flex flex-wrap gap-2 justify-center">
                {apidata.map((card, index) => (
                    <EndpointCard key={index} data={card} />
                ))}
            </div>
        </div>
    );
}

export default Endpoint_Cards;
