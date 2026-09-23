'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet } from 'lucide-react';
import api from '@/lib/api';

declare global {
  interface Window {
    btcpay: any;
  }
}

// Loads BTCPay's modal script from your BTCPay server (once)
function loadBtcpayScript(baseUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.btcpay) return resolve();
    const s = document.createElement('script');
    s.src = `${baseUrl}/modal/btcpay.js`;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Could not load payment window'));
    document.body.appendChild(s);
  });
}

export default function TopUpModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: (newBalance: number) => void;
}) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleTopUp = async () => {
    setError('');
    setInfo('');
    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount < 10) {
      setError('Enter an amount of at least $10');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/wallet/topup/init', { amount: numericAmount });

      await loadBtcpayScript(data.btcpay_url);

      // When the customer closes the BTCPay window, check the payment
      window.btcpay.onModalWillLeave(async () => {
        try {
          const res = await api.post('/wallet/topup/verify', { reference: data.reference });
          if (res.status === 200 && res.data.success) {
            onSuccess(res.data.balance);
            onClose();
          } else {
            // 202: paid but waiting for confirmations, or not paid yet.
            // The webhook will credit the wallet automatically once confirmed.
            setInfo('Waiting for payment confirmation. Your balance updates automatically once confirmed.');
          }
        } catch (err: any) {
          setError(
            err.response?.data?.error ||
              'Payment could not be verified. Contact support if you were charged.'
          );
        } finally {
          setLoading(false);
        }
      });

      window.btcpay.showInvoice(data.invoice_id);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet size={20} />
                <h2 className="font-semibold text-lg">Top Up Wallet</h2>
              </div>
              <button onClick={onClose}>
                <X size={20} className="text-white/50" />
              </button>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {info && (
              <p className="text-amber-300 text-sm bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                {info}
              </p>
            )}

            <div>
              <label className="text-sm text-white/50 mb-1 block">Amount ($) — pay with Bitcoin</label>
              <input
                type="number"
                placeholder="e.g. 50"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-white/30 transition-colors"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleTopUp}
              disabled={loading}
              className="w-full bg-white text-black font-semibold py-3 rounded-xl disabled:opacity-60"
            >
              {loading ? 'Processing...' : 'Continue to Pay'}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}