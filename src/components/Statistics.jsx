import React, { useEffect, useState } from 'react';


const Statistics = () => {
  const [endpointsData, setEndpointsData] = useState(null);
  const [networkData, setNetworkData] = useState(null);
  const [trafficData, setTrafficData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpointsResponse = await fetch('/endpoints.json');
        const networkResponse = await fetch('/networkData.json');
        const trafficResponse = await fetch('/traffic.json');

        if (!endpointsResponse.ok || !networkResponse.ok || !trafficResponse.ok) {
          throw new Error('One or more network responses were not ok');
        }

        const endpointsResult = await endpointsResponse.json();
        const networkResult = await networkResponse.json();
        const trafficResult = await trafficResponse.json();

        setEndpointsData(endpointsResult);
        setNetworkData(networkResult);
        setTrafficData(trafficResult);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const totalEndpoints = endpointsData?.total || 0;
  const activeEndpoints = endpointsData?.active || 0;
  const offlineEndpoints = endpointsData?.offline || 0;

  const totalDataUsed = networkData?.totalDataUsed || 0;
  const currentTraffic = trafficData?.currentTraffic || 0;

  return (
    <>
      
      
        <div className='endpoints'>
        <h3 className='totale'>Total Endpoints</h3>
        <p>{totalEndpoints}</p>
        <h3 className='activee'>Active Endpoints</h3>
        <p>{endpointsData.active}</p>
        
        <h3>Offline Endpoints</h3>
        <p>{endpointsData.offline}</p>
        </div>
        <div className='statistics'>
        <h3 className='usee'>Total Data Used</h3>
        <p>{networkData.networkUsage.totalDataUsed[0]} GB</p>
        <h3 className='traff'>Current Traffic</h3>
        <p>{trafficData.networkTraffic.currentTraffic[0]} GB</p>
        </div>
        
    </>
  );
};

export default Statistics;
