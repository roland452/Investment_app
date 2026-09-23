const pool = require('../db');
const { TESLA_PLAN_NAME } = require('../lib/autoEnroll');

const HOLD_HOURS = 5;

exports.requestWithdrawal = async (req, res) => {
  const { amount } = req.body;
  const numericAmount = Number(amount);

  if (!numericAmount || numericAmount <= 0) {
    return res.status(400).json({ error: 'Enter a valid amount' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const investmentResult = await client.query(
      `SELECT id FROM investments WHERE user_id = $1 AND plan_name = $2 AND status = 'active' LIMIT 1`,
      [req.userId, TESLA_PLAN_NAME]
    );

    if (investmentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        error: 'You need to start the Tesla Investment package before you can withdraw.',
      });
    }

    const userResult = await client.query(
      'SELECT balance FROM users WHERE id = $1 FOR UPDATE',
      [req.userId]
    );
    const balance = Number(userResult.rows[0].balance);

    if (balance < numericAmount) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    await client.query('UPDATE users SET balance = balance - $1 WHERE id = $2', [
      numericAmount,
      req.userId,
    ]);

    const reference = `wd_${Date.now()}_${req.userId}`;
    const availableAt = new Date(Date.now() + HOLD_HOURS * 60 * 60 * 1000);

    const txResult = await client.query(
      `INSERT INTO transactions (user_id, reference, type, amount, status, available_at)
       VALUES ($1, $2, 'withdrawal', $3, 'pending', $4)
       RETURNING id, reference, type, amount, status, created_at, available_at`,
      [req.userId, reference, numericAmount, availableAt]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: `Withdrawal request received. It will be processed within ${HOLD_HOURS} hours.`,
      transaction: txResult.rows[0],
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
};