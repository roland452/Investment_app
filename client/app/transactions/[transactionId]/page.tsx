'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
} from 'lucide-react';
import api from '@/lib/api';

interface Transaction {
  id: number;
  reference: string;
  type: string;
  amount: number;
  status: string;
  created_at: string;
}

export default function TransactionDetailPage() {
  const { transactionId } = useParams();
  const router = useRouter();
  const [tx, setTx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api
      .get(`/user/transactions/${transactionId}`)
      .then(({ data }) => {
        setTx(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Transaction not found');
        setLoading(false);
      });
  }, [transactionId]);

  function copyReference() {
    if (!tx) return;
    navigator.clipboard.writeText(tx.reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (loading) {
    return <div className="max-w-md mx-auto py-20 text-center text-white/50">Loading...</div>;
  }

  if (error || !tx) {
    return (
      <div className="max-w-md mx-auto py-20 text-center text-red-400">
        {error || 'Transaction not found'}
      </div>
    );
  }

  const statusConfig = {
    success: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
    pending: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
  };

  const status =
    statusConfig[tx.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className="max-w-md mx-auto space-y-6">
      <button onClick={() => router.push('/transactions')} className="flex items-center gap-2 text-white/60">
        <ArrowLeft size={18} /> Back to transactions
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-4"
      >
        <div
          className={`w-16 h-16 rounded-full ${status.bg} flex items-center justify-center mx-auto`}
        >
          {tx.type === 'deposit' ? (
            <ArrowDownRight size={28} className="text-green-400" />
          ) : (
            <ArrowUpRight size={28} className="text-red-400" />
          )}
        </div>

        <div>
          <p
            className={`text-3xl font-bold ${
              tx.type === 'deposit' ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {tx.type === 'deposit' ? '+' : '-'}₦{Number(tx.amount).toLocaleString()}
          </p>
          <p className="text-white/40 text-sm capitalize mt-1">{tx.type}</p>
        </div>

        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${status.bg} ${status.color}`}>
          <StatusIcon size={14} />
          <span className="capitalize">{tx.status}</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 border border-white/10 rounded-2xl divide-y divide-white/10"
      >
        <div className="flex items-center justify-between p-4">
          <span className="text-sm text-white/40">Date</span>
          <span className="text-sm font-medium">
            {new Date(tx.created_at).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>
        <div className="flex items-center justify-between p-4">
          <span className="text-sm text-white/40">Time</span>
          <span className="text-sm font-medium">
            {new Date(tx.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        <div className="flex items-center justify-between p-4">
          <span className="text-sm text-white/40">Reference</span>
          <button
            onClick={copyReference}
            className="flex items-center gap-1.5 text-sm font-medium text-white/80"
          >
            <span className="truncate max-w-[140px]">{tx.reference}</span>
            <Copy size={14} />
          </button>
        </div>
        <div className="flex items-center justify-between p-4">
          <span className="text-sm text-white/40">Transaction ID</span>
          <span className="text-sm font-medium">#{tx.id}</span>
        </div>
      </motion.div>

      {copied && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-xs text-white/40"
        >
          Reference copied
        </motion.p>
      )}
    </div>
  );
}