const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// GET /api/accounts - list user's accounts
router.get('/', auth, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT id, name, balance FROM accounts WHERE user_id=$1 ORDER BY id', [req.userId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// GET /api/accounts/:id - fetch account details and transactions
router.get('/:id', auth, async (req, res) => {
  const id = req.params.id;
  try {
    const { rows } = await db.query('SELECT id, name, balance FROM accounts WHERE id=$1 AND user_id=$2', [id, req.userId]);
    if (!rows[0]) return res.status(404).json({ error: 'Account not found' });
    const account = rows[0];
    const { rows: txs } = await db.query('SELECT id, type, amount, created_at FROM transactions WHERE account_id=$1 ORDER BY created_at DESC LIMIT 100', [id]);
    res.json({ account, transactions: txs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch account' });
  }
});

module.exports = router;
