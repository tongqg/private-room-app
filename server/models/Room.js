const db = require('../utils/database');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

class Room {
  static create(name, adminId) {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
      // Generate a random access code (6 digits)
      const accessCode = crypto.randomInt(100000, 999999).toString();
      
      const sql = `INSERT INTO rooms (id, name, adminId, accessCode) VALUES (?, ?, ?, ?)`;
      db.run(sql, [id, name, adminId, accessCode], function(err) {
        if (err) return reject(err);
        
        resolve({
          id,
          name,
          adminId,
          accessCode,
          createdAt: new Date(),
          active: true
        });
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM rooms WHERE id = ?`;
      db.get(sql, [id], (err, room) => {
        if (err) return reject(err);
        if (!room) return resolve(null);
        
        // Convert active from INTEGER to Boolean
        room.active = !!room.active;
        resolve(room);
      });
    });
  }

  static findByAccessCode(accessCode) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM rooms WHERE accessCode = ? AND active = 1`;
      db.get(sql, [accessCode], (err, room) => {
        if (err) return reject(err);
        if (!room) return resolve(null);
        
        room.active = !!room.active;
        resolve(room);
      });
    });
  }

  static updateActive(id, active) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE rooms SET active = ? WHERE id = ?`;
      db.run(sql, [active ? 1 : 0, id], function(err) {
        if (err) return reject(err);
        resolve({ id, active });
      });
    });
  }

  static setAdminId(id, adminId) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE rooms SET adminId = ? WHERE id = ?`;
      db.run(sql, [adminId, id], function(err) {
        if (err) return reject(err);
        resolve({ id, adminId, changes: this.changes });
      });
    });
  }

  static getRoomWithUsers(roomId) {
    return new Promise((resolve, reject) => {
      const roomSql = `SELECT * FROM rooms WHERE id = ?`;
      const usersSql = `SELECT * FROM users WHERE roomId = ?`;
      
      db.get(roomSql, [roomId], (err, room) => {
        if (err) return reject(err);
        if (!room) return resolve(null);
        
        room.active = !!room.active;
        
        db.all(usersSql, [roomId], (err, users) => {
          if (err) return reject(err);
          
          users.forEach(user => {
            user.isAdmin = !!user.isAdmin;
          });
          
          room.users = users;
          resolve(room);
        });
      });
    });
  }
}

module.exports = Room;