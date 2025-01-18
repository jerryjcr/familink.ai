const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');

const app = express();
const port = 3000;
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://cubixularhelix:5zqbWbXvYZweDuSI@cluster.jp22d.mongodb.net/?retryWrites=true&w=majority&appName=Cluster', { useNewUrlParser: true, useUnifiedTopology: true });

const messageSchema = new mongoose.Schema({
  user: String,
  message: String,
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);

app.get('/api/messages', async (req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 });
  res.json(messages);
});

app.post('/api/messages', async (req, res) => {
  const { user, message } = req.body;
  const newMessage = new Message({ user, message });
  await newMessage.save();
  res.status(201).send('Message saved');
});

app.listen(port, () => console.log(`Server running on port ${port}`));

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('chat message', (msg) => {
    console.log('Message received:', msg);
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});
