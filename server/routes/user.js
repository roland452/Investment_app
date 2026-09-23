const router = require('express').Router();
const auth = require('../middleware/auth');
const { getDashboard, getProfile, updateProfile } = require('../controller/userController');

router.get('/dashboard', auth, getDashboard);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

module.exports = router;