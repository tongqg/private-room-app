const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');

// Import models
const Room = require('./models/Room');
const User = require('./models/User');
const Message = require('./models/Message');

// Import routes
const roomRoutes = require('./routes/roomRoutes');

// Environment variables
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Set up Socket.IO with CORS
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/rooms', roomRoutes);

// Serve static files from the client directory in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Socket.IO Authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication token is missing'));
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = {
      id: decoded.userId,
      roomId: decoded.roomId,
      isAdmin: decoded.isAdmin
    };
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.id}`);
  
  // Join the room
  socket.join(socket.user.roomId);
  
  // Broadcast user joined event
  socket.to(socket.user.roomId).emit('user.joined', {
    userId: socket.user.id
  });
  
  // Handle sending messages
  socket.on('message.send', async ({ content }) => {
    try {
      // Save message to database
      const message = await Message.create(socket.user.roomId, socket.user.id, content);
      
      // Get user info
      const user = await User.findById(socket.user.id);
      
      // Broadcast message to room
      io.to(socket.user.roomId).emit('message.new', {
        id: message.id,
        content: message.content,
        userId: message.userId,
        displayName: user.displayName,
        timestamp: message.timestamp
      });
    } catch (err) {
      console.error('Error sending message:', err);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });
  
  // Handle room closure (admin only)
  socket.on('room.close', async () => {
    try {
      // Verify user is room admin
      if (!socket.user.isAdmin) {
        return socket.emit('error', { message: 'Only room admin can close the room' });
      }
      
      // Update room status in database
      await Room.updateActive(socket.user.roomId, false);
      
      // Notify all users in room
      io.to(socket.user.roomId).emit('room.closed', {
        roomId: socket.user.roomId
      });
    } catch (err) {
      console.error('Error closing room:', err);
      socket.emit('error', { message: 'Failed to close room' });
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', async () => {
    console.log(`User disconnected: ${socket.user.id}`);
    
    // Broadcast user left event
    socket.to(socket.user.roomId).emit('user.left', {
      userId: socket.user.id
    });
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});