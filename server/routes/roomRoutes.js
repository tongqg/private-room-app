// filepath: /Users/jotong/aicoder/private-room-app/server/routes/roomRoutes.js
const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const authMiddleware = require('../middleware/authMiddleware');

// Create a new room
// POST /api/rooms
router.post('/', roomController.createRoom);

// Get room details
// GET /api/rooms/:roomId
router.get('/:roomId', authMiddleware, roomController.getRoomDetails);

// Join a room with access code
// POST /api/rooms/join
router.post('/join', roomController.joinRoom);

// Close a room (admin only)
// PUT /api/rooms/:roomId/close
router.put('/:roomId/close', authMiddleware, roomController.closeRoom);

module.exports = router;