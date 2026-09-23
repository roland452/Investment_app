const pool = require('../db');

// Search users by partial email match
exports.searchUsers = async (req, res) => {
  const { email } = req.query;
  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Email query is required' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, balance FROM users WHERE email ILIKE $1 ORDER BY email ASC LIMIT 20',
      [`%${email.trim()}%`]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get a single user's details for the dynamic page
exports.getUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, balance, created_at FROM users WHERE id = $1',
      [userId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add (or subtract, if amount is negative) to one user's balance
exports.addBalance = async (req, res) => {
  const { userId } = req.params;
  const { amount, note } = req.body;

  const numericAmount = Number(amount);
  if (!numericAmount || numericAmount === 0) {
    return res.status(400).json({ error: 'Enter a valid non-zero amount' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userResult = await client.query(
      'UPDATE users SET balance = balance + $1 WHERE id = $2 RETURNING id, name, email, balance',
      [numericAmount, userId]
    );

    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found' });
    }

    await client.query(
      'INSERT INTO transactions (user_id, reference, type, amount, status) VALUES ($1,$2,$3,$4,$5)',
      [
        userId,
        `admin_adj_${Date.now()}_${userId}`,
        numericAmount > 0 ? 'deposit' : 'withdrawal',
        Math.abs(numericAmount),
        'success',
      ]
    );

    await client.query('COMMIT');
    res.json(userResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
};

// Add the same amount to every user's balance
exports.addBalanceToAll = async (req, res) => {
  const { amount } = req.body;
  const numericAmount = Number(amount);

  if (!numericAmount || numericAmount === 0) {
    return res.status(400).json({ error: 'Enter a valid non-zero amount' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const usersResult = await client.query('SELECT id FROM users');

    await client.query('UPDATE users SET balance = balance + $1', [numericAmount]);

    const values = usersResult.rows
      .map(
        (u, i) =>
          `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4}, 'success')`
      )
      .join(',');

    const params = usersResult.rows.flatMap((u) => [
      u.id,
      `admin_bulk_${Date.now()}_${u.id}`,
      numericAmount > 0 ? 'deposit' : 'withdrawal',
      Math.abs(numericAmount),
    ]);

    if (usersResult.rows.length > 0) {
      await client.query(
        `INSERT INTO transactions (user_id, reference, type, amount, status) VALUES ${values}`,
        params
      );
    }

    await client.query('COMMIT');
    res.json({ success: true, usersUpdated: usersResult.rows.length });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
};