'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';

export default function AdminAddToAllPage() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit() {
    setError('');
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount === 0) {
      setError('Enter a valid non-zero amount');
      return;
    }

    if (!confirming) {
      setConfirming(true);
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/admin/balance/add-all', { amount: numericAmount });
      setSuccess(`Updated balance for ${data.usersUpdated} users`);
      setAmount('');
      setConfirming(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <button onClick={() => router.push('/admin/balance')} className="flex items-center gap-2 text-white/60">
        <ArrowLeft size={18} /> Back to search
      </button>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <Users size={20} />
          </div>
          <h1 className="font-semibold text-lg">Add to All Users</h1>
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {success && (
          <p className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
            {success}
          </p>
        )}

        <input
          type="number"
          placeholder="Amount (use negative to deduct)"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setConfirming(false);
          }}
          className="w-full p-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-white/30 transition-colors"
        />

        {confirming && (
          <div className="flex items-start gap-2 text-yellow-400 text-sm bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>This will apply to every registered user. Tap again to confirm.</span>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-white text-black font-semibold py-3 rounded-xl disabled:opacity-60"
        >
          {submitting ? 'Processing...' : confirming ? 'Confirm — Apply to All' : 'Apply to All Users'}
        </motion.button>
      </div>
    </div>
  );
}