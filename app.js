const express = require('express');
const compression = require('compression');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const http = require('http');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs-extra');
const path = require('path');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const PORT = process.env.PORT || 3000;

// Middleware
app.use(compression()); // Compress responses
app.use(cors()); // Enable CORS
app.use(cookieParser()); // Parse cookies
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Sample REST endpoints
app.get('/', (req, res) => {
  res.json({ message: 'Hello, World!', timestamp: new Date().toISOString() });
});

app.post('/users', (req, res) => {
    const {id, username, email } = req.body;
    // Save the user to a file
    // push the user to the array with auto increment id
    const user = {id, username, email};
    const users = fs.readJsonSync('users.json', { throws: false }) || [];
    // if user id is already present then display the user details already present message
    const userAlreadyPresent = users.find((user) => user.id === id);
    if(userAlreadyPresent) {
        return res.json({message: 'User already present with this id'});
    }
    users.push(user);
    fs.writeJsonSync('users.json', users);
    res.json(user);
});

app.get('/usersList', (req, res) => {
  const users = fs.readJsonSync('users.json', { throws: false }) || [];
  res.json(users);
});

app.get('/users/:id', (req, res) => {
  const users = fs.readJsonSync('users.json', { throws: false }) || [];
  const user = users.find((user) => user.id === req.params.id);
  if(!user) {
    return res.json({message: 'User not found'});
  }
  res.json(user);
});

//update user details with id
app.put('/users/:id', (req, res) => {
  const users = fs.readJsonSync('users.json', { throws: false }) || [];
  const user = users.find((user) => user.id === req.params.id);
  if(!user) {
    return res.json({message: 'User not found'});
  }
  const {username, email} = req.body;
  user.username = username;
  user.email = email;
  fs.writeJsonSync('users.json', users);
  res.json(user);
});

//delete user with id
app.delete('/users/:id', (req, res) => {
  const users = fs.readJsonSync('users.json', { throws: false }) || [];
  const userIndex = users.findIndex((user) => user.id === req.params.id);
  if(userIndex === -1) {
    return res.json({message: 'User not found'});
  }
  users.splice(userIndex, 1);
  fs.writeJsonSync('users.json', users);
  res.json({message: 'User deleted successfully'});
});

// WebSocket handling
wss.on('connection', (ws) => {
  console.log('Client connected');
  
  // Assign a unique ID to this connection
  const clientId = uuidv4();
  ws.id = clientId;
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connection',
    message: 'Connected to server',
    clientId
  }));
  
  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log(`Received message from ${clientId}:`, data);
      
      // Echo the message back
      ws.send(JSON.stringify({
        type: 'echo',
        originalMessage: data,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  });
  
  // Handle disconnection
  ws.on('close', () => {
    console.log(`Client ${clientId} disconnected`);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});