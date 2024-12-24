import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Appdatacard from './Appdatacard';
import { useParams } from "react-router-dom";

function Appdatacards() {
  const [apidata, setData] = useState(null);
  const { endpoint } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://44.204.255.126:6538/api/appCardsData/${endpoint}`);
        setData(response.data.data);
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [endpoint]);

  if (!apidata) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-gray-700 animate-pulse">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="px-4 py-8">
      {/* Styled Heading */}
      <h1 className="text-center text-4xl font-extrabold mb-6 text-gray-800 tracking-wide">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
          Application Cards
        </span>
      </h1>
      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {apidata.map((card, index) => (
          <Appdatacard key={index} data={card} />
        ))}
      </div>
    </div>
  );
}

export default Appdatacards;
