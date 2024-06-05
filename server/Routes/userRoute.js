import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
const router = express.Router();


router.post('/login', async (req, res) => {
    const { role, username, password } = req.body;
  
    try {
      const query = `SELECT * FROM Users WHERE role = ? AND username = ?`;
      db.query(query, [role, username], async (err, results) => {
        if (err) {
          console.error('Error querying database:', err);
          return res.status(500).json({ success: false, message: 'Server error.' });
        }
  
        if (results.length === 0) {
          return res.json({ success: false, message: 'Invalid username or role.' });
        }
  
        const Users = results[0];
  
        if (role === 'manager') {
          if (password === Users.password) {
            return res.json({ success: true });
          } else {
            return res.json({ success: false, message: 'Invalid password.' });
          }
        } else {
          const match = await bcrypt.compare(password, Users.password);
          if (match) {
            return res.json({ success: true });
          } else {
            return res.json({ success: false, message: 'Invalid password.' });
          }
        }
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: 'Server error.' });
    }
  });

export { router as userRouter};
