'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, PiggyBank, Plus } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/authContext';
import TopUpModal from '@/components/topUpModal';
import WithdrawModal from '@/components/withdrawalModal';
import Loader from '@/product/loader'
import LoginPrompt from '@/product/loginPrompt'
import ErrorState from '@/product/errorState'


interface Investment {
  id: number;
  plan_name: string;
  amount: number;
  returns_percent: number;
  status: string;
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  status: string;
  created_at: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTopUp, setShowTopUp] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [retry, setRetry] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, [retry]);

  function fetchDashboard() {
    api
      .get('/user/dashboard')
      .then(({ data }) => {
        setBalance(data.user.balance);
        setInvestments(data.investments);
        setTransactions(data.transactions);
        setLoading(false);
      })
      .catch((err) => {
        setError(
          `Status: ${err.response?.status || 'no response'} — ${
            err.response?.data?.error || err.message
          }`
        );
        setLoading(false);
      });
  }

  if (loading) {
    return (
      <Loader 
        message="getting live dashboard ready"
      />
    );
  }

  if (error) {
    return (
      <ErrorState 
        title={"failed to fetch page"}
        message="this may be a network error try again"
        onRetry={() => setRetry(!retry)}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-bold"
      >
        Welcome back, {user?.name}
      </motion.h1>

      {/* Balance card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
            <Wallet size={22} className="text-white" />
          </div>
          <div>
            <p className="text-white/50 text-sm">Wallet Balance</p>
            <p className="text-3xl font-bold">${balance.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowTopUp(true)}
            className="bg-white text-black font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2"
          >
            <Plus size={18} /> Top Up
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowWithdraw(true)}
            className="bg-white/10 text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2"
          >
            <ArrowUpRight size={18} /> Withdraw
          </motion.button>
        </div>
      </motion.div>

      {/* Investments */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Your Investments</h2>
        {investments.length === 0 ? (
          <p className="text-white/40 text-sm bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
            You have no investments yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {investments.map((inv, i) => (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                whileHover={{ y: -4 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <PiggyBank size={20} className="text-white/60" />
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      inv.status === 'active'
                        ? 'bg-white/10 text-white'
                        : 'bg-white/5 text-white/40'
                    }`}
                  >
                    {inv.status}
                  </span>
                </div>
                <p className="font-semibold">{inv.plan_name}</p>
                <p className="text-2xl font-bold">${Number(inv.amount).toLocaleString()}</p>
                <p className="text-sm text-green-400 flex items-center gap-1">
                  <TrendingUp size={14} /> +{inv.returns_percent}% returns
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Transactions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
        {transactions.length === 0 ? (
          <p className="text-white/40 text-sm bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
            No transactions yet.
          </p>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl divide-y divide-white/10">
            {transactions.map((tx, i) => {
              const statusStyles: Record<string, string> = {
                success: 'bg-green-500/10 text-green-400',
                failed: 'bg-red-500/10 text-red-400',
                pending: 'bg-yellow-500/10 text-yellow-400',
              };
              const statusClass = statusStyles[tx.status] || 'bg-white/10 text-white/60';

              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                  className="flex items-center justify-between p-4"
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
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p
                      className={`font-semibold ${
                        tx.type === 'deposit' ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {tx.type === 'deposit' ? '+' : '-'}${Number(tx.amount).toLocaleString()}
                    </p>
                    <span
                      className={`inline-block text-[11px] px-2 py-0.5 rounded-full capitalize ${statusClass}`}
                    >
                      {tx.status}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <TopUpModal
        open={showTopUp}
        onClose={() => setShowTopUp(false)}
        onSuccess={() => fetchDashboard()}
      />

      <WithdrawModal
        open={showWithdraw}
        onClose={() => setShowWithdraw(false)}
        onSuccess={() => fetchDashboard()}
      />
    </div>
  );
}