const axios = require('axios');
const crypto = require('crypto');
const pool = require('../db');
const { autoEnrollTesla } = require('../lib/autoEnroll');

// Step 1: user requests to top up — create pending transaction, return reference
exports.initTopup = async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Enter a valid amount' });
  }

  try {
    const userResult = await pool.query('SELECT email, name FROM users WHERE id = $1', [req.userId]);
    const user = userResult.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    const reference = `topup_${Date.now()}_${req.userId}`;

    await pool.query(
      'INSERT INTO transactions (user_id, reference, type, amount, status) VALUES ($1,$2,$3,$4,$5)',
      [req.userId, reference, 'deposit', amount, 'pending']
    );

    res.json({
      reference,
      amount,
      email: user.email,
      name: user.name,
      public_key: process.env.FLUTTERWAVE_PUBLIC_KEY,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Shared credit logic, used by both verify and webhook (idempotent — safe to call twice)
async function creditTransaction(reference) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const txResult = await client.query(
      "UPDATE transactions SET status='success' WHERE reference=$1 AND status='pending' RETURNING user_id, amount",
      [reference]
    );

    if (txResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return { credited: false, alreadyProcessed: true };
    }

    const { user_id, amount } = txResult.rows[0];

    const updatedUser = await client.query(
      'UPDATE users SET balance = balance + $1 WHERE id = $2 RETURNING balance',
      [amount, user_id]
    );

    await autoEnrollTesla(client, user_id);

    await client.query('COMMIT');
    return { credited: true, balance: updatedUser.rows[0].balance };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Step 2: frontend calls this after Flutterwave popup closes with success
exports.verifyTopup = async (req, res) => {
  const { transaction_id, reference } = req.body;

  try {
    const verifyRes = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      { headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` } }
    );

    const data = verifyRes.data.data;

    if (data.status !== 'successful' || data.tx_ref !== reference) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    const result = await creditTransaction(reference);

    if (result.alreadyProcessed) {
      return res.status(409).json({ error: 'Transaction already processed' });
    }

    res.json({ success: true, balance: result.balance });
  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).json({ error: 'Verification failed' });
  }
};

// Step 3 (backup): Flutterwave webhook, in case the user closes the app before verify runs
exports.webhook = async (req, res) => {
  const signature = req.headers['verif-hash'];
  if (!signature || signature !== process.env.FLUTTERWAVE_SECRET_HASH) {
    return res.sendStatus(401);
  }

  const event = req.body;

  if (event.event === 'charge.completed' && event.data.status === 'successful') {
    try {
      await creditTransaction(event.data.tx_ref);
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  }

  res.sendStatus(200);
};