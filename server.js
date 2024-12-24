const http = require('http');

// Sample data to be served
const sampleData = [
  {
    id: '66d4e0af1c0c2cb592878a59',
    name: 'server-1',
    ip: '127.0.0.1',
    status: 'Active',
    applications: [
      { name: 'brave.exe', policy: 'No Policy' },
      { name: 'msedge.exe', policy: 'No Policy' },
    ],
    policies: [],
    trafficLogs: 10,
    recentAlerts: [
      {
        id: 'alert1',
        severity: 'Normal',
        message: 'Normal',
        timestamp: 'datetime',
      },
    ],
  },
];

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  // Handle different routes
  if (req.url === '/api/endpoints') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(sampleData));
  } else {
    res.statusCode = 404;
    res.end('Not found');
  }
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});