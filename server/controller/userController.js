const pool = require('../db');

await pool.query(
  `UPDATE transactions SET status = 'success'
   WHERE user_id = $1 AND type = 'withdrawal' AND status = 'pending' AND available_at <= NOW()`,
  [req.userId]
);

exports.getDashboard = async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT id, name, balance FROM users WHERE id = $1',
      [req.userId]
    );
    const investmentsResult = await pool.query(
      'SELECT id, plan_name, amount, returns_percent, status FROM investments WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    const transactionsResult = await pool.query(
      'SELECT id, type, amount, status, created_at FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
      [req.userId]
    );

    res.json({
      user: userResult.rows[0],
      investments: investmentsResult.rows,
      transactions: transactionsResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, phone, verified, created_at FROM users WHERE id = $1',
      [req.userId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  const { name, phone } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone) WHERE id = $3 RETURNING id, name, email, phone',
      [name, phone, req.userId]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};


exports.getTransactions = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, reference, type, amount, status, created_at FROM transactions WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getTransactionById = async (req, res) => {
  const { transactionId } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT id, reference, type, amount, status, created_at FROM transactions WHERE id = $1 AND user_id = $2',
      [transactionId, req.userId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Transaction not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};