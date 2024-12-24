import React, { useState } from 'react';
import axios from 'axios';
import { Plus, X, Server, Link2 } from 'lucide-react';

const Policy_form_app = () => {
  const [formData, setFormData] = useState({
    appName: '',
    purpose: '',
    ipInputs: ['', '', '', ''],
    ip: [],
    endpointInput: ['', '', '', ''],
    endpoint: ''
  });

  // Handle input changes for text fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for IP inputs
    if (name.startsWith('ipInput_')) {
      const index = parseInt(name.split('_')[1]);
      const newIpInputs = [...formData.ipInputs];
      newIpInputs[index] = value;
      
      // Auto-focus to next input if max length reached
      if (value.length === 3 && index < 3) {
        document.getElementById(`ip_${index + 1}`).focus();
      }
      
      setFormData(prev => ({
        ...prev,
        ipInputs: newIpInputs
      }));
      return;
    }

    // Special handling for Endpoint inputs
    if (name.startsWith('endpointInput_')) {
      const index = parseInt(name.split('_')[1]);
      const newEndpointInputs = [...formData.endpointInput];
      newEndpointInputs[index] = value;
      
      // Auto-focus to next input if max length reached
      if (value.length === 3 && index < 3) {
        document.getElementById(`endpoint_${index + 1}`).focus();
      }
      
      setFormData(prev => ({
        ...prev,
        endpointInput: newEndpointInputs
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add IP Address
  const handleAddIP = () => {
    // Construct IP address from input boxes
    const ipAddress = formData.ipInputs.join('.');
    
    // Validate IP address format
    const ipRegex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    if (ipRegex.test(ipAddress)) {
      setFormData(prev => ({
        ...prev,
        ip: [...prev.ip, ipAddress],
        ipInputs: ['', '', '', ''] // Reset IP input boxes
      }));
    } else {
      alert('Invalid IP address. Please ensure each section is between 0-255.');
    }
  };

  // Add Endpoint
  const handleAddEndpoint = () => {
    // Construct Endpoint address from input boxes
    const endpointAddress = formData.endpointInput.join('.');
    
    // Validate Endpoint address format
    const ipRegex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    if (ipRegex.test(endpointAddress)) {
      setFormData(prev => ({
        ...prev,
        endpoint: endpointAddress,
        endpointInput: ['', '', '', ''] // Reset Endpoint input boxes
      }));
    } else {
      alert('Invalid Endpoint address. Please ensure each section is between 0-255.');
    }
  };

  // Deploy Policy
  const handleDeployPolicy = async () => {
    // Validate required fields
    if (!formData.appName || !formData.purpose || !formData.endpoint) {
      alert('Please fill in all required fields: App Name, Purpose, and Endpoint');
      return;
    }

    // Prepare payload in the specified format
    const payload = {
      appname: formData.appName,
      purpose: formData.purpose,
      unblock_ip: formData.ip,
      endpoint: formData.endpoint
    };

    console.log('Payload being sent:', payload);

    try {
      // Axios POST request to backend
      const response = await axios.post('https://context-aware-firewall-sih-2024-1.onrender.com/api/blockAppAccess', payload);
      console.log('Policy deployed successfully:', response.data);
      // Optional: Add success toast or notification
    } catch (error) {
      console.error('Error deploying policy:', error);
      // Optional: Add error handling toast or notification
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg space-y-6">
      {/* App Name Configuration */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-100">App Name Configuration</h2>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              name="appName"
              value={formData.appName}
              onChange={handleChange}
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter app name"
            />
          </div>
        </div>
      </div>

      {/* Endpoint Configuration */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Link2 className="text-blue-500" size={24} />
          <h2 className="text-xl font-semibold text-gray-100">Endpoint Configuration</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {formData.endpointInput.map((value, index) => (
              <React.Fragment key={index}>
                <input
                  type="text"
                  id={`endpoint_${index}`}
                  name={`endpointInput_${index}`}
                  value={value}
                  onChange={handleChange}
                  maxLength="3"
                  placeholder="XXX"
                  className="w-16 bg-gray-700 border border-gray-600 rounded-lg px-2 py-2.5 text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {index < 3 && <span className="text-gray-400">.</span>}
              </React.Fragment>
            ))}
            <button
              type="button"
              onClick={handleAddEndpoint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-300 flex items-center gap-2 ml-2"
            >
              <Plus size={20} />
              Add
            </button>
          </div>

          {formData.endpoint && (
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between bg-gray-700 rounded-lg px-4 py-2">
                <span>{formData.endpoint}</span>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      endpoint: ''
                    }));
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors duration-300"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Purpose Selection */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-100">Policy Purpose</h2>
        <div className="flex gap-4">
          {['block', 'unblock'].map(purpose => (
            <label key={purpose} className="relative flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="purpose"
                value={purpose}
                checked={formData.purpose === purpose}
                onChange={handleChange}
                className="hidden"
              />
              <div className={`
                px-6 py-3 rounded-lg font-medium transition-all duration-300
                ${formData.purpose === purpose 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}
              `}>
                {purpose.charAt(0).toUpperCase() + purpose.slice(1)}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* IP Configuration */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Server className="text-blue-500" size={24} />
          <h2 className="text-xl font-semibold text-gray-100">IP Configuration</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {formData.ipInputs.map((value, index) => (
              <React.Fragment key={index}>
                <input
                  type="text"
                  id={`ip_${index}`}
                  name={`ipInput_${index}`}
                  value={value}
                  onChange={handleChange}
                  maxLength="3"
                  placeholder="XXX"
                  className="w-16 bg-gray-700 border border-gray-600 rounded-lg px-2 py-2.5 text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {index < 3 && <span className="text-gray-400">.</span>}
              </React.Fragment>
            ))}
            <button
              type="button"
              onClick={handleAddIP}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-300 flex items-center gap-2 ml-2"
            >
              <Plus size={20} />
              Add
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {formData.ip.map((ip, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-700 rounded-lg px-4 py-2">
                <span>{ip}</span>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      ip: prev.ip.filter((_, i) => i !== index)
                    }));
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors duration-300"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deploy Policy Button */}
      <div className="mt-6">
        <button
          type="button"
          onClick={handleDeployPolicy}
          className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300 font-semibold"
        >
          Deploy Policy
        </button>
      </div>
    </div>
  );
};

export default Policy_form_app;