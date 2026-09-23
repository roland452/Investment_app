const router = require('express').Router();
const auth = require('../middleware/auth');
const { signup, login, logout, me } = require('../controller/authController');

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', auth, me);

module.exports = router;