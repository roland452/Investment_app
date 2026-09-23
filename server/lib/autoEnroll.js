const TESLA_PLAN_NAME = 'Tesla Investment';
const TESLA_THRESHOLD = 200;

// Call this with an active pg client (inside a transaction) whenever a user's
// balance increases — enrolls them in the Tesla package once they cross $200
async function autoEnrollTesla(client, userId) {
  const userRes = await client.query('SELECT balance FROM users WHERE id = $1', [userId]);
  const balance = Number(userRes.rows[0]?.balance || 0);

  if (balance < TESLA_THRESHOLD) return;

  const existing = await client.query(
    `SELECT id FROM investments WHERE user_id = $1 AND plan_name = $2 AND status = 'active'`,
    [userId, TESLA_PLAN_NAME]
  );
  if (existing.rows.length > 0) return; // already enrolled

  await client.query(
    `INSERT INTO investments (user_id, plan_name, amount, returns_percent, status)
     VALUES ($1, $2, $3, $4, 'active')`,
    [userId, TESLA_PLAN_NAME, TESLA_THRESHOLD, 12]
  );
}

module.exports = { autoEnrollTesla, TESLA_PLAN_NAME, TESLA_THRESHOLD };