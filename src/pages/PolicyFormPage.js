import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, ArrowLeft, Shield, Server, Globe } from 'lucide-react';
import '../styles/PolicyFormPage.css';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const PolicyFormPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    domains: [],
    ip: [],
    ports: [],
    domainInput: '',
    ipInputs: ['', '', '', ''],
    portInput: '',
    protocols: { TCP: false, UDP: false, ICMP: false },
    purpose: '',
    endpoint: '',
    endpointInput: ['', '', '', ''],
    appNameInput: '',
    app_name: [], // This will store the display version (with spaces)
    app_name_backend: [], // This will store the backend version (without spaces)
  });

  const handleChange = (e) => {
    const { name, value, checked } = e.target;

    if (name.startsWith('ipInput_')) {
      const index = parseInt(name.split('_')[1], 10);
      const newIpInputs = [...formData.ipInputs];
      newIpInputs[index] = value.slice(0, 3);
      
      setFormData({
        ...formData,
        ipInputs: newIpInputs,
      });

      if (value.length === 3 && index < 3) {
        document.getElementById(`ip_${index + 1}`).focus();
      }
    } else if (name === 'portInput') {
      setFormData({
        ...formData,
        portInput: value,
      });
    } else if (name === 'appNameInput') {
      setFormData({
        ...formData,
        appNameInput: value,
      });
    } else if (name in formData.protocols) {
      setFormData({
        ...formData,
        protocols: {
          ...formData.protocols,
          [name]: checked,
        },
      });
    } else if (name === 'purpose') {
      setFormData({
        ...formData,
        purpose: value,
      });
    } else if (name.startsWith('endpointInput')) {
      const index = parseInt(name.split('_')[1], 10);
      const newEndpointInput = [...formData.endpointInput];
      newEndpointInput[index] = value.slice(0, 3);
      setFormData({
        ...formData,
        endpointInput: newEndpointInput,
      });

      if (value.length === 3 && index < 3) {
        document.getElementById(`endpoint_${index + 1}`).focus();
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleAddAppName = () => {
    if (formData.appNameInput.trim() !== '') {
      const displayAppName = formData.appNameInput.trim(); // Keep spaces for display
      const backendAppName = displayAppName.replace(/\s+/g, ''); // Remove spaces for backend
      
      setFormData((prevData) => ({
        ...prevData,
        app_name: [...prevData.app_name, displayAppName], // For display
        app_name_backend: [...prevData.app_name_backend, backendAppName], // For backend
        appNameInput: '',
      }));
    }
  };

  const handleAddDomain = () => {
    if (formData.domainInput.trim() !== '') {
      setFormData((prevData) => ({
        ...prevData,
        domains: [...prevData.domains, formData.domainInput.trim().toLowerCase()],
        domainInput: '',
      }));
    }
  };

  const handleAddIP = () => {
    if (formData.ipInputs.every(part => part.trim() !== '')) {
      const formattedIP = formData.ipInputs.join('.');
      setFormData((prevData) => ({
        ...prevData,
        ip: [...prevData.ip, formattedIP],
        ipInputs: ['', '', '', ''],
      }));
    }
  };

  const handleAddPort = () => {
    const selectedProtocols = Object.keys(formData.protocols).filter(
      (key) => formData.protocols[key]
    );

    if (formData.portInput.trim() === '' || selectedProtocols.length === 0) {
      alert('Please enter a valid port number and select at least one protocol.');
      return;
    }

    setFormData((prevData) => ({
      ...prevData,
      ports: [
        ...prevData.ports,
        {
          port: parseInt(formData.portInput.trim(), 10),
          protocol: selectedProtocols,
        },
      ],
      portInput: '',
      protocols: { TCP: false, UDP: false, ICMP: false },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const { domainInput, ipInputs, portInput, protocols, ports, endpointInput, appNameInput, ...dataToSubmit } = formData;
    
    const endpoint = endpointInput.join('-');
    
    const payload = {
      name: formData.name,
      description: formData.description,
      domains: formData.domains,
      ip: formData.ip,
      ports: formData.ports,
      purpose: formData.purpose,
      app_name: formData.app_name_backend, // Use the version without spaces for backend
    };
  
    console.log(payload);
    toast.success("Policy Updated Successfully");
    
    console.log(endpoint);
  
    axios.post(`http://44.204.255.126:6538/api/${endpoint}/insertPolicy`, payload)
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.error('Error submitting form:', error);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all duration-300 text-gray-300 hover:text-white"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Policy Configuration
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-gray-800 rounded-2xl p-8 shadow-xl">
          {/* Basic Information Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="text-blue-500" size={24} />
              <h2 className="text-xl font-semibold text-gray-100">Basic Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xl font-semibold text-gray-100">Policy Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter policy name"
                  required
                />
              </div>

              <div>
                <label className="text-xl font-semibold text-gray-100">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="Describe the policy purpose and scope"
                />
              </div>
            </div>
          </div>

          {/* Domain Configuration */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Globe className="text-blue-500" size={24} />
              <h2 className="text-xl font-semibold text-gray-100">Domain Configuration</h2>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  name="domainInput"
                  value={formData.domainInput}
                  onChange={handleChange}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter domain (e.g., example.com)"
                />
                <button
                  type="button"
                  onClick={handleAddDomain}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-300 flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {formData.domains.map((domain, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-700 rounded-lg px-4 py-2">
                    <span>{domain}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          domains: prev.domains.filter((_, i) => i !== index)
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

          {/* Endpoint Configuration */}
          <div className="space-y-4">
            <label className="text-xl font-semibold text-gray-100">Endpoint IPv4</label>
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
            </div>
          </div>



          {/* Port Configuration */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-100">Port & Protocol Configuration</h2>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <input
                  type="text"
                  name="portInput"
                  value={formData.portInput}
                  onChange={handleChange}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter port number"
                />
                <div className="flex gap-4">
                  {Object.keys(formData.protocols).map(protocol => (
                    <label key={protocol} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name={protocol}
                        checked={formData.protocols[protocol]}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{protocol}</span>
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleAddPort}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-300 flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {formData.ports.map((port, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-700 rounded-lg px-4 py-2">
                    <div>
                      <span className="font-medium">Port: {port.port}</span>
                      <span className="ml-4 text-gray-400">Protocols: {port.protocol.join(', ')}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          ports: prev.ports.filter((_, i) => i !== index)
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

          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-100">App Name Configuration</h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  name="appNameInput"
                  value={formData.appNameInput}
                  onChange={handleChange}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter app name"
                />
                <button
                  type="button"
                  onClick={handleAddAppName}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-300 flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add
                </button>
              </div>

             <div className="grid grid-cols-1 gap-2">
      {formData.app_name.map((app, index) => ( // Use app_name (with spaces) for display
        <div key={index} className="flex items-center justify-between bg-gray-700 rounded-lg px-4 py-2">
          <span>{app}</span>
          <button
            type="button"
            onClick={() => {
              setFormData(prev => ({
                ...prev,
                app_name: prev.app_name.filter((_, i) => i !== index),
                app_name_backend: prev.app_name_backend.filter((_, i) => i !== index)
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

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-medium py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02]"
            >
              Deploy Policy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PolicyFormPage;





//aftr toast.success
// Reset form state to initial values
// setFormData({
//   name: '',
//   description: '',
//   domains: [],
//   ip: [],
//   ports: [],
//   domainInput: '',
//   ipInputs: ['', '', '', ''],
//   portInput: '',
//   protocols: { TCP: false, UDP: false, ICMP: false },
//   purpose: '',
//   endpoint: '',
//   endpointInput: ['', '', '', ''],
//   appNameInput: '',
//   app_name: [], 
//   app_name_backend: [], 
// });
