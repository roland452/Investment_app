// Step 1: create a pending transaction + a BTCPay invoice
exports.initTopup = async (req, res) => {
  const amount = Number(req.body.amount);

  if (!amount || amount < 10) {
    return res.status(400).json({ error: 'Minimum top up is $10' });
  }

  try {
    const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [req.userId]);
    const user = userResult.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    const reference = `topup_${Date.now()}_${req.userId}`;

    const { data: invoice } = await btcpay.post('/invoices', {
      amount: amount.toFixed(2),
      currency: 'USD',
      metadata: { orderId: reference, buyerEmail: user.email },
    });

    await pool.query(
      'INSERT INTO transactions (user_id, reference, invoice_id, type, amount, status) VALUES ($1,$2,$3,$4,$5,$6)',
      [req.userId, reference, invoice.id, 'deposit', amount, 'pending']
    );

    res.json({
      reference,
      invoice_id: invoice.id,
      btcpay_url: BTCPAY_URL,
    });
  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).json({ error: 'Could not start payment' });
  }
};

// Step 2: frontend calls this when the payment modal closes
exports.verifyTopup = async (req, res) => {
  const { reference } = req.body;

  try {
    const tx = await pool.query(
      'SELECT invoice_id FROM transactions WHERE reference=$1 AND user_id=$2',
      [reference, req.userId]
    );
    if (tx.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const result = await creditIfSettled(tx.rows[0].invoice_id);

    if (result.credited) {
      return res.json({ success: true, balance: result.balance });
    }
    if (result.alreadyProcessed) {
      return res.status(409).json({ error: 'Transaction already processed' });
    }
    if (result.status === 'Expired' || result.status === 'Invalid') {
      return res.status(400).json({ error: 'Payment expired or invalid' });
    }

    return res.status(202).json({ success: false, pending: true, status: result.status });
  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).json({ error: 'Verification failed' });
  }
};

// Step 3 (backup): BTCPay webhook. Needs the RAW body (see routes file).
exports.webhook = async (req, res) => {
  const sigHeader = req.headers['btcpay-sig'] || '';
  const expected =
    'sha256=' + crypto.createHmac('sha256', WEBHOOK_SECRET).update(req.body).digest('hex');

  const a = Buffer.from(sigHeader);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.sendStatus(401);
  }

  const event = JSON.parse(req.body.toString());

  if (event.type === 'InvoiceSettled' && event.invoiceId) {
    try {
      await creditIfSettled(event.invoiceId);
    } catch (err) {
      console.error(err.response?.data || err);
      return res.sendStatus(500);
    }
  }

  res.sendStatus(200);
};