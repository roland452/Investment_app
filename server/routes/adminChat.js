const router = require('express').Router();
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminAuth');
const {
  listConversations,
  getConversation,
  sendMessageAsAdmin,
} = require('../controller/adminChatController');

router.get('/conversations', auth, adminOnly, listConversations);
router.get('/conversations/:customerId', auth, adminOnly, getConversation);
router.post('/conversations/:customerId/send', auth, adminOnly, sendMessageAsAdmin);

module.exports = router;