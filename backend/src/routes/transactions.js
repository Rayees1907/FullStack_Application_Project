const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// POST /api/transactions/deposit
router.post('/deposit', auth, async (req, res) => {
  const { account_id, amount } = req.body;
  if (!account_id || !amount || amount <= 0) return res.status(400).json({ error: 'Invalid input' });
  try {
    // ensure account belongs to user
    const { rows } = await db.query('SELECT balance FROM accounts WHERE id=$1 AND user_id=$2', [account_id, req.userId]);
    const acct = rows[0];
    if (!acct) return res.status(404).json({ error: 'Account not found' });

    // update balance and insert transaction in a transaction
    await db.pool.query('BEGIN');
    const newBalance = parseFloat(acct.balance) + parseFloat(amount);
    await db.query('UPDATE accounts SET balance=$1 WHERE id=$2', [newBalance, account_id]);
    await db.query('INSERT INTO transactions (account_id, type, amount) VALUES ($1,$2,$3)', [account_id, 'deposit', amount]);
    await db.pool.query('COMMIT');
    res.json({ balance: newBalance });
  } catch (err) {
    await db.pool.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Deposit failed' });
  }
});

// POST /api/transactions/withdraw
router.post('/withdraw', auth, async (req, res) => {
  const { account_id, amount } = req.body;
  if (!account_id || !amount || amount <= 0) return res.status(400).json({ error: 'Invalid input' });
  try {
    const { rows } = await db.query('SELECT balance FROM accounts WHERE id=$1 AND user_id=$2', [account_id, req.userId]);
    const acct = rows[0];
    if (!acct) return res.status(404).json({ error: 'Account not found' });
    if (parseFloat(acct.balance) < parseFloat(amount)) return res.status(400).json({ error: 'Insufficient funds' });

    await db.pool.query('BEGIN');
    const newBalance = parseFloat(acct.balance) - parseFloat(amount);
    await db.query('UPDATE accounts SET balance=$1 WHERE id=$2', [newBalance, account_id]);
    await db.query('INSERT INTO transactions (account_id, type, amount) VALUES ($1,$2,$3)', [account_id, 'withdraw', amount]);
    await db.pool.query('COMMIT');
    res.json({ balance: newBalance });
  } catch (err) {
    await db.pool.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Withdraw failed' });
  }
});

module.exports = router;
