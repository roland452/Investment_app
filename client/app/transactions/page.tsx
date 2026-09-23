'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Receipt } from 'lucide-react';
import api from '@/lib/api';

interface Transaction {
  id: number;
  reference: string;
  type: string;
  amount: number;
  status: string;
  created_at: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/user/transactions')
      .then(({ data }) => {
        setTransactions(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Could not load transactions');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="max-w-3xl mx-auto py-20 text-center text-white/50">Loading...</div>;
  }

  if (error) {
    return <div className="max-w-3xl mx-auto py-20 text-center text-red-400">{error}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Receipt size={22} />
        <h1 className="text-2xl font-bold">Transaction History</h1>
      </div>

      {transactions.length === 0 ? (
        <p className="text-white/40 text-sm bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
          No transactions yet.
        </p>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl divide-y divide-white/10">
          {transactions.map((tx, i) => (
            <Link key={tx.id} href={`/transactions/${tx.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                className="flex items-center justify-between p-4 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                    {tx.type === 'deposit' ? (
                      <ArrowDownRight size={16} className="text-green-400" />
                    ) : (
                      <ArrowUpRight size={16} className="text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium capitalize">{tx.type}</p>
                    <p className="text-xs text-white/40">
                      {new Date(tx.created_at).toLocaleDateString()} ·{' '}
                      {new Date(tx.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      tx.type === 'deposit' ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {tx.type === 'deposit' ? '+' : '-'}${Number(tx.amount).toLocaleString()}
                  </p>
                  <p className="text-xs text-white/40 capitalize">{tx.status}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}