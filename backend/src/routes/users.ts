import express from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import pool from '../config/database';

const router = express.Router();

router.post('/xtream-login', async (req, res) => {
  const { xtream_username, xtream_password, xtream_url } = req.body;

  try {
    // Test Xtream credentials
    const xtreamResponse = await axios.get(`${xtream_url}/player_api.php`, {
      params: {
        username: xtream_username,
        password: xtream_password,
      },
    });

    if (xtreamResponse.data.user_info) {
      // Save user to database
      const result = await pool.query(
        'INSERT INTO users (xtream_username, xtream_password, xtream_url) VALUES ($1, $2, $3) RETURNING *',
        [xtream_username, xtream_password, xtream_url]
      );

      const user = result.rows[0];
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
        expiresIn: '24h',
      });

      res.json({ user, token });
    } else {
      res.status(401).json({ error: 'Invalid Xtream credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error or invalid Xtream server' });
  }
});

export default router;