const db = require('../utils/database');
const { v4: uuidv4 } = require('uuid');

class User {
  static create(displayName, roomId, isAdmin = false) {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
      const sql = `INSERT INTO users (id, displayName, roomId, isAdmin) VALUES (?, ?, ?, ?)`;
      
      db.run(sql, [id, displayName, roomId, isAdmin ? 1 : 0], function(err) {
        if (err) return reject(err);
        
        resolve({
          id,
          displayName,
          roomId,
          isAdmin,
          joinedAt: new Date()
        });
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM users WHERE id = ?`;
      db.get(sql, [id], (err, user) => {
        if (err) return reject(err);
        if (!user) return resolve(null);
        
        // Convert isAdmin from INTEGER to Boolean
        user.isAdmin = !!user.isAdmin;
        resolve(user);
      });
    });
  }

  static findByRoomId(roomId) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM users WHERE roomId = ?`;
      db.all(sql, [roomId], (err, users) => {
        if (err) return reject(err);
        
        users.forEach(user => {
          user.isAdmin = !!user.isAdmin;
        });
        
        resolve(users);
      });
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM users WHERE id = ?`;
      db.run(sql, [id], function(err) {
        if (err) return reject(err);
        resolve({ id, deleted: this.changes > 0 });
      });
    });
  }

  static findRoomAdmin(roomId) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM users WHERE roomId = ? AND isAdmin = 1`;
      db.get(sql, [roomId], (err, admin) => {
        if (err) return reject(err);
        if (!admin) return resolve(null);
        
        admin.isAdmin = true; // Ensure this is a boolean
        resolve(admin);
      });
    });
  }

  static updateRoomId(userId, roomId) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE users SET roomId = ? WHERE id = ?`;
      db.run(sql, [roomId, userId], function(err) {
        if (err) return reject(err);
        resolve({ 
          userId, 
          roomId, 
          updated: this.changes > 0 
        });
      });
    });
  }
}

module.exports = User;