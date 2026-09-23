'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpRight } from 'lucide-react';
import api from '@/lib/api';

export default function WithdrawModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleWithdraw() {
    setError('');
    setMessage('');
    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      setError('Enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/wallet/withdraw', { amount: numericAmount });
      setMessage(data.message);
      setAmount('');
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

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
                <ArrowUpRight size={20} />
                <h2 className="font-semibold text-lg">Withdraw Funds</h2>
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
            {message && (
              <p className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                {message}
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
              onClick={handleWithdraw}
              disabled={loading}
              className="w-full bg-white text-black font-semibold py-3 rounded-xl disabled:opacity-60"
            >
              {loading ? 'Processing...' : 'Request Withdrawal'}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}