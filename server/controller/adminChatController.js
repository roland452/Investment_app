const pool = require('../db');

// List all customers who have at least one message, with last message + unread count
exports.listConversations = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        u.id AS user_id,
        u.name,
        u.email,
        (SELECT message FROM messages m2 WHERE m2.user_id = u.id ORDER BY m2.created_at DESC LIMIT 1) AS last_message,
        (SELECT created_at FROM messages m3 WHERE m3.user_id = u.id ORDER BY m3.created_at DESC LIMIT 1) AS last_message_at,
        (SELECT COUNT(*) FROM messages m4 WHERE m4.user_id = u.id AND m4.sender = 'user' AND m4.read = false) AS unread_count
      FROM users u
      WHERE EXISTS (SELECT 1 FROM messages m WHERE m.user_id = u.id)
      ORDER BY last_message_at DESC NULLS LAST
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get full conversation with one specific customer
exports.getConversation = async (req, res) => {
  const { customerId } = req.params;

  try {
    const customerResult = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [customerId]);
    if (!customerResult.rows[0]) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const messagesResult = await pool.query(
      'SELECT id, sender, message, created_at FROM messages WHERE user_id = $1 ORDER BY created_at ASC',
      [customerId]
    );

    // mark user's messages as read now that admin has opened the conversation
    await pool.query(
      "UPDATE messages SET read = true WHERE user_id = $1 AND sender = 'user' AND read = false",
      [customerId]
    );

    res.json({ customer: customerResult.rows[0], messages: messagesResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Reply to a specific customer
exports.sendMessageAsAdmin = async (req, res) => {
  const { customerId } = req.params;
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO messages (user_id, sender, message) VALUES ($1, $2, $3) RETURNING id, sender, message, created_at',
      [customerId, 'admin', message.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};