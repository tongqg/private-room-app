const Room = require('../models/Room');
const User = require('../models/User');
const Message = require('../models/Message');
const jwt = require('jsonwebtoken');

// Load JWT secret from environment or use default for development
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

const roomController = {
  // Create a new room
  createRoom: async (req, res) => {
    try {
      const { name, displayName } = req.body;
      
      if (!name || !displayName) {
        return res.status(400).json({ error: 'Room name and display name are required' });
      }
      
      // Create temporary user first (without roomId)
      const admin = await User.create(displayName, null, true);
      
      // Create the room with adminId
      const room = await Room.create(name, admin.id);
      
      // Update user with roomId
      await User.updateRoomId(admin.id, room.id);
      
      // Generate JWT for room access
      const token = jwt.sign({
        userId: admin.id,
        roomId: room.id,
        isAdmin: true
      }, JWT_SECRET, { expiresIn: '7d' });
      
      res.status(201).json({
        room: {
          id: room.id,
          name: room.name,
          accessCode: room.accessCode,
          active: room.active
        },
        user: {
          id: admin.id,
          displayName: admin.displayName,
          isAdmin: admin.isAdmin
        },
        token
      });
    } catch (err) {
      console.error('Error creating room:', err);
      res.status(500).json({ error: 'Failed to create room' });
    }
  },
  
  // Get room details
  getRoomDetails: async (req, res) => {
    try {
      const { roomId } = req.params;
      
      const room = await Room.findById(roomId);
      
      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }
      
      // Only return room details if room is active
      if (!room.active) {
        return res.status(403).json({ error: 'Room is no longer active' });
      }
      
      const users = await User.findByRoomId(roomId);
      
      res.json({
        room: {
          id: room.id,
          name: room.name,
          active: room.active,
          createdAt: room.createdAt
        },
        users: users.map(user => ({
          id: user.id,
          displayName: user.displayName,
          isAdmin: user.isAdmin,
          joinedAt: user.joinedAt
        }))
      });
    } catch (err) {
      console.error('Error getting room details:', err);
      res.status(500).json({ error: 'Failed to get room details' });
    }
  },
  
  // Join a room with access code
  joinRoom: async (req, res) => {
    try {
      const { accessCode, displayName } = req.body;
      
      if (!accessCode || !displayName) {
        return res.status(400).json({ error: 'Access code and display name are required' });
      }
      
      const room = await Room.findByAccessCode(accessCode);
      
      if (!room) {
        return res.status(404).json({ error: 'Room not found or inactive' });
      }
      
      // Create a new user for this room
      const user = await User.create(displayName, room.id, false);
      
      // Generate JWT for room access
      const token = jwt.sign({
        userId: user.id,
        roomId: room.id,
        isAdmin: false
      }, JWT_SECRET, { expiresIn: '7d' });
      
      res.status(201).json({
        room: {
          id: room.id,
          name: room.name,
          active: room.active
        },
        user: {
          id: user.id,
          displayName: user.displayName,
          isAdmin: user.isAdmin
        },
        token
      });
    } catch (err) {
      console.error('Error joining room:', err);
      res.status(500).json({ error: 'Failed to join room' });
    }
  },
  
  // Close a room (admin only)
  closeRoom: async (req, res) => {
    try {
      const { roomId } = req.params;
      const { userId, isAdmin } = req.user;
      
      if (!isAdmin) {
        return res.status(403).json({ error: 'Only room admin can close the room' });
      }
      
      const result = await Room.setActive(roomId, false);
      
      if (!result) {
        return res.status(404).json({ error: 'Room not found' });
      }
      
      res.json({ message: 'Room closed successfully' });
    } catch (err) {
      console.error('Error closing room:', err);
      res.status(500).json({ error: 'Failed to close room' });
    }
  }
};

module.exports = roomController;