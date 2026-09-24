const axios = require('axios');
const pool = require('../db');
const { enrollOrUpdateTeslaInvestment } = require('../lib/autoEnroll');

// Step 1: no DB row yet — just hand back a reference for the popup to use
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

// Records the transaction exactly once (success or failed), credits balance
// and grows the user's Tesla Investment only on success. Safe to call twice
// (from verify AND webhook) — the unique reference makes the second call a no-op.
async function recordTransaction({ userId, reference, amount, status }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const insertResult = await client.query(
      `INSERT INTO transactions (user_id, reference, type, amount, status)
       VALUES ($1, $2, 'deposit', $3, $4)
       ON CONFLICT (reference) DO NOTHING
       RETURNING id`,
      [userId, reference, amount, status]
    );

    if (insertResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return { recorded: false, alreadyProcessed: true };
    }

    if (status === 'success') {
      const updatedUser = await client.query(
        'UPDATE users SET balance = balance + $1 WHERE id = $2 RETURNING balance',
        [amount, userId]
      );
      await enrollOrUpdateTeslaInvestment(client, userId, amount);
      await client.query('COMMIT');
      return { recorded: true, balance: updatedUser.rows[0].balance };
    }

    await client.query('COMMIT');
    return { recorded: true };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Step 2: frontend calls this after the Flutterwave popup closes
exports.verifyTopup = async (req, res) => {
  const { transaction_id, reference } = req.body;

  try {
    const verifyRes = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      { headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` } }
    );

    const data = verifyRes.data.data;
    const success = data.status === 'successful' && data.tx_ref === reference;

    const result = await recordTransaction({
      userId: req.userId,
      reference,
      amount: data.amount,
      status: success ? 'success' : 'failed',
    });

    if (result.alreadyProcessed) {
      return res.status(409).json({ error: 'Transaction already processed' });
    }
    if (!success) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    res.json({ success: true, balance: result.balance });
  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).json({ error: 'Verification failed' });
  }
};

// Step 3 (backup): Flutterwave webhook, in case the app closes before verify runs.
// The user id is pulled from the reference itself (topup_<timestamp>_<userId>).
exports.webhook = async (req, res) => {
  const signature = req.headers['verif-hash'];
  if (!signature || signature !== process.env.FLUTTERWAVE_SECRET_HASH) {
    return res.sendStatus(401);
  }

  const event = req.body;

  if (event.event === 'charge.completed') {
    const reference = event.data.tx_ref;
    const userId = Number(reference?.split('_').pop());
    const success = event.data.status === 'successful';

    if (userId) {
      try {
        await recordTransaction({
          userId,
          reference,
          amount: event.data.amount,
          status: success ? 'success' : 'failed',
        });
      } catch (err) {
        console.error(err);
        return res.sendStatus(500);
      }
    }
  }

  res.sendStatus(200);
};