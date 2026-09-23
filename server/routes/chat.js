const router = require('express').Router();
const auth = require('../middleware/auth');
const { getMessages, sendMessage } = require('../controller/chatController');

router.get('/messages', auth, getMessages);
router.post('/send', auth, sendMessage);

module.exports = router;