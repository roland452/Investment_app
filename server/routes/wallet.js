const router = require('express').Router();
const auth = require('../middleware/auth');
const { initTopup, verifyTopup, webhook } = require('../controller/walletController');
const { requestWithdrawal } = require('../controller/withdrawalController');

router.post('/topup/init', auth, initTopup);
router.post('/topup/verify', auth, verifyTopup);
router.post('/webhook', webhook); // no auth — Flutterwave calls this directly
router.post('/withdraw', auth, requestWithdrawal);

module.exports = router;