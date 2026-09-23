const axios = require('axios');
const crypto = require('crypto');
const pool = require('../db');
const { autoEnrollTesla } = require('../lib/autoEnroll');

const BTCPAY_URL = (process.env.BTCPAY_URL || '').replace(/\/$/, '');
const STORE_ID = process.env.BTCPAY_STORE_ID;
const API_KEY = process.env.BTCPAY_API_KEY;
const WEBHOOK_SECRET = process.env.BTCPAY_WEBHOOK_SECRET;

const btcpay = axios.create({
  baseURL: `${BTCPAY_URL}/api/v1/stores/${STORE_ID}`,
  headers: { Authorization: `token ${API_KEY}` },
});

async function creditIfSettled(invoiceId) {
  const { data: invoice } = await btcpay.get(`/invoices/${invoiceId}`);

  if (invoice.status !== 'Settled') {
    return { credited: false, status: invoice.status };
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const txResult = await client.query(
      "UPDATE transactions SET status='success' WHERE invoice_id=$1 AND status='pending' RETURNING user_id, amount",
      [invoiceId]
    );

    if (txResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return { credited: false, status: 'Settled', alreadyProcessed: true };
    }

    const { user_id, amount } = txResult.rows[0];
    const updated = await client.query(
      'UPDATE users SET balance = balance + $1 WHERE id = $2 RETURNING balance',
      [amount, user_id]
    );

    await autoEnrollTesla(client, user_id); // ← moved here, correct scope

    await client.query('COMMIT');
    return { credited: true, status: 'Settled', balance: updated.rows[0].balance };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ...rest of the file (initTopup, verifyTopup, webhook) stays exactly as you pasted it