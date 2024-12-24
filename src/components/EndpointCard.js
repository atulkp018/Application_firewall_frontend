import React from 'react';
import { useNavigate } from "react-router-dom";
import EndpointDetails from '../pages/EndpointDetails';
import EndpointAttackChart from './Dpi_attack_graph';

function EndpointCard({ data }) {
    const navigate = useNavigate();
    const endpoint = data.endpoint;

    return (
    <div className="w-full sm:w-[calc(50%-8px)] p-2">
        <div>
            <div className="flex border border-gray-300 shadow-xl rounded-lg bg-indigo-200 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 h-[500px]">
                <div className="flex flex-col w-[24%] justify-between p-2 rounded-t-lg">
                    <div className="mb-4">
                        <h2 className="text-lg font-bold text-black mt-6">IP Address</h2>
                        <p className="text-sm font-bold text-red-800">{data.endpoint}</p>
                    </div>
                    <div className="mb-4">
                        <h2 className="text-lg font-bold text-black">Network Usage</h2>
                        <p className="text-sm font-bold text-green-500">{data.network_usage}</p>
                    </div>
                    <div className="p-4 ml-1">
                    <button
                        onClick={() => navigate(`/Appdatacards/${endpoint}`)}
                        className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-3  ml-1 mb-6 rounded-lg shadow-md hover:shadow-lg hover:from-green-500 hover:to-blue-500 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50"
                    >
                        View Apps
                    </button>
                    </div>
            </div>
             {/* Graph Section */}
             <div className="flex-grow w-[76%] bg-gray-100 p-4 rounded-b-lg">
                    <div className="font-bold text-lg text-black">Graph:</div>
                    <EndpointAttackChart endpoint={endpoint}/>
                </div>
           
           

                </div>
                
                {/* Button Section */}
                
            </div>
        </div>
    );
}

export default EndpointCard;
