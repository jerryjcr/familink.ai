const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// Create Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the client
app.use(express.static('client/public'));

// Handle socket.io connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Broadcast messages to all clients
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Start the server
const HOST = '0.0.0.0'; // Bind to all network interfaces
const PORT = 3000;
server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});