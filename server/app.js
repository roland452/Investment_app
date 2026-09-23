const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const pool = require('./db');


const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const walletRoutes = require('./routes/wallet');
const chatRoutes = require('./routes/chat');
const adminChatRoutes = require('./routes/adminChat');
const adminBalanceRoutes = require('./routes/adminBalance');



const app = express();

app.use(cors({
  origin: [`${process.env.CLIENT_URL}`, 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use('/api/wallet/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin/chat', adminChatRoutes);
app.use('/api/admin/balance', adminBalanceRoutes);

pool.query(
  'ALTER TABLE transactions ADD COLUMN IF NOT EXISTS invoice_id VARCHAR(100) UNIQUE'
).catch(console.error);

app.get('/', (req, res) => res.send('API running'));

module.exports = app;