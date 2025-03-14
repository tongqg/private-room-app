const db = require('../utils/database');
const { v4: uuidv4 } = require('uuid');

class Message {
  static create(roomId, userId, content) {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
      const sql = `INSERT INTO messages (id, roomId, userId, content) VALUES (?, ?, ?, ?)`;
      
      db.run(sql, [id, roomId, userId, content], function(err) {
        if (err) return reject(err);
        
        resolve({
          id,
          roomId,
          userId,
          content,
          timestamp: new Date()
        });
      });
    });
  }

  static findByRoomId(roomId, limit = 50) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT m.*, u.displayName 
        FROM messages m
        JOIN users u ON m.userId = u.id
        WHERE m.roomId = ?
        ORDER BY m.timestamp DESC
        LIMIT ?
      `;
      
      db.all(sql, [roomId, limit], (err, messages) => {
        if (err) return reject(err);
        resolve(messages.reverse()); // Send in chronological order
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM messages WHERE id = ?`;
      db.get(sql, [id], (err, message) => {
        if (err) return reject(err);
        resolve(message);
      });
    });
  }

  static deleteByRoomId(roomId) {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM messages WHERE roomId = ?`;
      db.run(sql, [roomId], function(err) {
        if (err) return reject(err);
        resolve({ roomId, deleted: this.changes });
      });
    });
  }
}

module.exports = Message;