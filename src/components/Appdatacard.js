import React from 'react';
import { useNavigate } from "react-router-dom";

function Appdatacard({ data }) {
  const navigate = useNavigate();

  return (
    <div className="p-4">
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 shadow-xl rounded-lg overflow-hidden transition-transform transform hover:scale-105">
        <div className="p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {data.application_name}
          </h2>
          <p className="text-sm text-gray-700 mb-2">
            <span className="font-bold">Endpoint ID:</span> {data.endpoint_id}
          </p>
          <p className="text-sm text-gray-700 mb-6">
            <span className="font-bold">Endpoint Name:</span> {data.endpoint_name}
          </p>
          <button
            onClick={() =>
              navigate(
                `/App_alert/${data.application_name}/${data.endpoint_id.replace(/\./g, '-')}`
              )
            }
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-all"
          >
            View Alerts
          </button>
        </div>
      </div>
    </div>
  );
}

export default Appdatacard;
