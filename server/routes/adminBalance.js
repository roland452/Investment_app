const router = require('express').Router();
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminAuth');
const {
  searchUsers,
  getUser,
  addBalance,
  addBalanceToAll,
} = require('../controller/adminBalanceController');

router.get('/search', auth, adminOnly, searchUsers);
router.get('/:userId', auth, adminOnly, getUser);
router.post('/:userId/add', auth, adminOnly, addBalance);
router.post('/add-all', auth, adminOnly, addBalanceToAll);

module.exports = router;