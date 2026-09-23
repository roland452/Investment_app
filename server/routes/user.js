const router = require('express').Router();
const auth = require('../middleware/auth');
const {
  getDashboard,
  getProfile,
  updateProfile,
  getTransactions,
  getTransactionById,
} = require('../controller/userController');

router.get('/dashboard', auth, getDashboard);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.get('/transactions', auth, getTransactions);
router.get('/transactions/:transactionId', auth, getTransactionById);

module.exports = router;