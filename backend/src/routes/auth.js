const express = require('express');
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// ===============================
// POST /api/auth/signup
// ===============================
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    // Test DB
    await db.query('SELECT 1');

    const hashed = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [name, email, hashed]
    );

    const user = result.rows[0];

    // Create default account for user
    await db.query(
      `INSERT INTO accounts (user_id, name, balance)
       VALUES ($1, $2, $3)`,
      [user.id, 'Main', 0]
    );

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.json({ token, user });
  } catch (err) {
    console.error('🔥 Signup error:', err);

    // Unique email constraint
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Email already in use' });
    }

    return res.status(500).json({
      error: 'Signup failed',
      details: err.message,
    });
  }
});

// ===============================
// POST /api/auth/login
// ===============================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const { rows } = await db.query(
      `SELECT id, name, email, password_hash
       FROM users WHERE email = $1`,
      [email]
    );

    const user = rows[0];

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('🔥 Login error:', err);

    return res.status(500).json({
      error: 'Login failed',
      details: err.message,
    });
  }
});

module.exports = router;
