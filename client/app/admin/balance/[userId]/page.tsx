'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Wallet, Plus, Minus } from 'lucide-react';
import api from '@/lib/api';

interface UserDetail {
  id: number;
  name: string;
  email: string;
  balance: number;
  created_at: string;
}

export default function AdminUserBalancePage() {
  const { userId } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUser();
  }, [userId]);

  async function fetchUser() {
    try {
      const { data } = await api.get(`/admin/balance/${userId}`);
      setUser(data);
    } catch {
      setError('Could not load user');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdjust(sign: 1 | -1) {
    setError('');
    setSuccess('');
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError('Enter a valid amount');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post(`/admin/balance/${userId}/add`, {
        amount: numericAmount * sign,
      });
      setUser(data);
      setSuccess(
        `${sign === 1 ? 'Added' : 'Deducted'} ₦${numericAmount.toLocaleString()} successfully`
      );
      setAmount('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="max-w-md mx-auto py-20 text-center text-white/50">Loading...</div>;
  }

  if (!user) {
    return <div className="max-w-md mx-auto py-20 text-center text-white/50">User not found</div>;
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <button onClick={() => router.push('/admin/balance')} className="flex items-center gap-2 text-white/60">
        <ArrowLeft size={18} /> Back to search
      </button>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <div>
          <p className="font-semibold text-lg">{user.name}</p>
          <p className="text-sm text-white/40">{user.email}</p>
        </div>

        <div className="flex items-center gap-3 bg-white/5 rounded-xl p-4">
          <Wallet size={22} />
          <div>
            <p className="text-xs text-white/40">Current Balance</p>
            <p className="text-2xl font-bold">₦{Number(user.balance).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold">Adjust Balance</h2>

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
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-white/30 transition-colors"
        />

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleAdjust(1)}
            disabled={submitting}
            className="flex-1 bg-white text-black font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Plus size={18} /> Add
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleAdjust(-1)}
            disabled={submitting}
            className="flex-1 bg-white/10 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Minus size={18} /> Deduct
          </motion.button>
        </div>
      </div>
    </div>
  );
}