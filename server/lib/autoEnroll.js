const TESLA_PLAN_NAME = 'Tesla Investment';

// Call inside an active pg transaction whenever a deposit succeeds.
// Creates the user's Tesla Investment on their first top-up, or adds
// the new amount to it if they already have one active.
async function enrollOrUpdateTeslaInvestment(client, userId, topupAmount) {
  const existing = await client.query(
    `SELECT id FROM investments WHERE user_id = $1 AND plan_name = $2 AND status = 'active' LIMIT 1`,
    [userId, TESLA_PLAN_NAME]
  );

  if (existing.rows.length > 0) {
    await client.query('UPDATE investments SET amount = amount + $1 WHERE id = $2', [
      topupAmount,
      existing.rows[0].id,
    ]);
  } else {
    await client.query(
      `INSERT INTO investments (user_id, plan_name, amount, returns_percent, status)
       VALUES ($1, $2, $3, $4, 'active')`,
      [userId, TESLA_PLAN_NAME, topupAmount, 12]
    );
  }
}

module.exports = { enrollOrUpdateTeslaInvestment, TESLA_PLAN_NAME };