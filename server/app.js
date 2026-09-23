const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const walletRoutes = require('./routes/wallet');
const chatRoutes = require('./routes/chat');
const adminChatRoutes = require('./routes/adminChat');



const app = express();

app.use(cors({
  origin: [`${process.env.CLIENT_URL}`, 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/auth', userRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin/chat', adminChatRoutes);

app.get('/', (req, res) => res.send('API running'));

module.exports = app;