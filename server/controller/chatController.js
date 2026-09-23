const pool = require('../db');

exports.getMessages = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, sender, message, created_at FROM messages WHERE user_id = $1 ORDER BY created_at ASC',
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.sendMessage = async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO messages (user_id, sender, message) VALUES ($1, $2, $3) RETURNING id, sender, message, created_at',
      [req.userId, 'user', message.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};