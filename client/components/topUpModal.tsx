'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet } from 'lucide-react';
import api from '@/lib/api';

declare global {
  interface Window {
    FlutterwaveCheckout: any;
  }
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

  const handleTopUp = async () => {
    setError('');
    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount < 1) {
      setError('Enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/wallet/topup/init', { amount: numericAmount });

      window.FlutterwaveCheckout({
        public_key: data.public_key,
        tx_ref: data.reference,
        amount: data.amount,
        currency: 'USD',
        payment_options: 'card, banktransfer, ussd',
        customer: {
          email: data.email,
          name: data.name,
        },
        customizations: {
          title: 'Wallet Top Up',
          description: 'Add money to your wallet',
        },
        callback: async (response: any) => {
          try {
            const verifyRes = await api.post('/wallet/topup/verify', {
              transaction_id: response.transaction_id,
              reference: data.reference,
            });
            onSuccess(verifyRes.data.balance);
            onClose();
          } catch {
            setError('Payment could not be verified. Contact support if you were charged.');
          }
        },
        onclose: () => {
          setLoading(false);
        },
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
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

            <div>
              <label className="text-sm text-white/50 mb-1 block">Amount ($)</label>
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