const express = require('express');
const cors = require('cors');
const app = express();
const port = 5004;

// Middleware
app.use(cors());
app.use(express.json());

// Sample data for endpoint attacks
const attackData = [
  { endpoint: '127-0-0-1', type: 'DDoS', count: 50 },
  { endpoint: '127-0-0-1', type: 'Phishing', count: 30 },
  { endpoint: '127-0-0-1', type: 'SQL Injection', count: 20 },
  { endpoint: '192-168-1-1', type: 'Ransomware', count: 40 },
  { endpoint: '192-168-1-1', type: 'Trojan', count: 25 },
  { endpoint: '10-0-0-1', type: 'DDoS', count: 15 },
  { endpoint: '10-0-0-1', type: 'Phishing', count: 10 },
  { endpoint: '10-0-0-1', type: 'Malware', count: 5 },
];

// API endpoint for attacks
app.get('/api/attacks', (req, res) => {
  const { endpoint } = req.query;

  // Filter data for the specific endpoint
  if (endpoint) {
    const filteredData = attackData.filter(
      attack => attack.endpoint === endpoint
    );
    if (filteredData.length === 0) {
      return res.status(404).json({
        message: `No data found for endpoint: ${endpoint}`,
      });
    }
    return res.json(filteredData);
  }

  // If no endpoint is provided, return all data
  res.json(attackData);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
