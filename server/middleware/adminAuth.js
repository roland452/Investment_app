const pool = require('../db');

module.exports = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT is_admin FROM users WHERE id = $1', [req.userId]);
    if (!rows[0] || !rows[0].is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};