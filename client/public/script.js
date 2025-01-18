// Connect to the server
const socket = io();

// DOM elements
const form = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const messagesDiv = document.getElementById('messages');

// Listen for messages from the server
socket.on('chat message', (msg) => {
  const messageElement = document.createElement('div');
  messageElement.textContent = msg;
  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight; // Scroll to the latest message
});

// Handle form submission
form.addEventListener('submit', (e) => {
  e.preventDefault(); // Prevent page reload
  const message = messageInput.value;
  socket.emit('chat message', message); // Send message to the server
  messageInput.value = ''; // Clear the input
});