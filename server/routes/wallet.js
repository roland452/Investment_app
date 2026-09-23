const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { initTopup, verifyTopup, webhook } = require('../controller/walletController');

router.post('/topup/init', auth, initTopup);
router.post('/topup/verify', auth, verifyTopup);

// Raw body is required to verify BTCPay's signature.
// IMPORTANT: if app.js has a global app.use(express.json()), this route
// must be registered BEFORE it, or the body will already be parsed.
router.post('/webhook', express.raw({ type: 'application/json' }), webhook);

module.exports = router;

/*
Run this SQL once:

ALTER TABLE transactions ADD COLUMN IF NOT EXISTS invoice_id VARCHAR(100) UNIQUE;

.env additions (remove the FLUTTERWAVE_* ones):

BTCPAY_URL=https://your-btcpay-domain.com
BTCPAY_STORE_ID=xxxx
BTCPAY_API_KEY=xxxx
BTCPAY_WEBHOOK_SECRET=xxxx
*/
