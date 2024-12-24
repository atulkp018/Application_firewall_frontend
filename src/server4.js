const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5003;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// Simulated attack data generator
const generateAttackData = () => {
  const attackTypes = [
    'Phishing',
    'Malware',
    'DDoS',
    'SQL Injection',
    'Cross-Site Scripting',
    'Ransomware',
    'Social Engineering',
    'Insider Threat',
  ];

  return attackTypes.map(type => ({
    type: type,
    count: Math.floor(Math.random() * 200) + 50, // Random count between 50-250
    severity: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
  }));
};

// API Endpoint for Attack Data
app.get('/api/attacks', (req, res) => {
  try {
    const attackData = generateAttackData();
    console.log('Generated Attack Data:', attackData); // Log generated data
    res.json(attackData);
  } catch (error) {
    console.error('Error generating attack data:', error.message); // Log errors
    res.status(500).json({
      message: 'Error generating attack data',
      error: error.message,
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Optional: Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});
