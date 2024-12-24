// src/components/PolicyForm.js
import React, { useState } from 'react';
import axios from 'axios';
// import '../styles/PolicyForm.css';

const PolicyForm = ({ policy, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: policy?.name || '',
    description: policy?.description || '',
    priority: policy?.priority || 1,
    rules: policy?.rules || [{ type: '', target: '', value: '' }],
    startTime: policy?.timeBasedRules?.startTime || '',
    endTime: policy?.timeBasedRules?.endTime || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRuleChange = (index, e) => {
    const { name, value } = e.target;
    const updatedRules = [...formData.rules];
    updatedRules[index][name] = value;
    setFormData({ ...formData, rules: updatedRules });
  };

  const addRule = () => {
    setFormData({
      ...formData,
      rules: [...formData.rules, { type: '', target: '', value: '' }],
    });
  };

  const removeRule = (index) => {
    const updatedRules = formData.rules.filter((_, i) => i !== index);
    setFormData({ ...formData, rules: updatedRules });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    axios.post('https://jsonplaceholder.typicode.com/users',formData).then((response)=>console.log(response))
    // console.log(formData);

  };

  return (
    <form className="policy-form" onSubmit={handleSubmit}>
      <h2>{policy ? 'Edit Policy' : 'Create Policy'}</h2>
      
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Policy Name"
        required
      />
      
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Policy Description"
        required
      />
      
      {/* <input
        type="number"
        name="priority"
        value={formData.priority}
        onChange={handleChange}
        placeholder="Priority"
        required
      /> */}

      <div className="rules-section">
        <h3>Rules</h3>
        {formData.rules.map((rule, index) => (
          <div key={index} className="rule">
            <select
              name="type"
              value={rule.type}
              onChange={(e) => handleRuleChange(index, e)}
              required
            >
              <option value="">Select Type</option>
              <option value="allow">Allow</option>
              <option value="block">Block</option>
            </select>
            <input
              type="text"
              name="target"
              value={rule.target}
              onChange={(e) => handleRuleChange(index, e)}
              placeholder="Target (e.g., IP)"
              required
            />
            <input
              type="text"
              name="value"
              value={rule.value}
              onChange={(e) => handleRuleChange(index, e)}
              placeholder="Value (e.g., 192.168.1.1)"
              required
            />
            <button type="button" onClick={() => removeRule(index)}>
              Remove this rule
            </button>
          </div>
        ))}
        <button type="button" onClick={addRule}>
          Add a new Rule
        </button>
      </div>

      {/* <input
        type="time"
        name="startTime"
        value={formData.startTime}
        onChange={handleChange}
        placeholder="Start Time"
      /> */}
      
      {/* <input
        type="time"
        name="endTime"
        value={formData.endTime}
        onChange={handleChange}
        placeholder="End Time"
      /> */}

      <button type="submit" className="submit-btn">
        {policy ? 'Update' : 'Create'}
      </button>
    </form>
  );
};

export default PolicyForm;
