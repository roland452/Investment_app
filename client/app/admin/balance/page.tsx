'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, User, Wallet, Users } from 'lucide-react';
import api from '@/lib/api';

interface UserResult {
  id: number;
  name: string;
  email: string;
  balance: number;
}

export default function AdminBalanceSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(value: string) {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get('/admin/balance/search', {
        params: { email: value },
      });
      setResults(data);
      setSearched(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Balances</h1>
        <Link
          href="/admin/balance/all"
          className="flex items-center gap-2 text-sm bg-white/10 px-4 py-2 rounded-xl hover:bg-white/20 transition-colors"
        >
          <Users size={16} /> Add to All Users
        </Link>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          type="email"
          placeholder="Search by email..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-white/30 transition-colors"
        />
      </div>

      {loading && <p className="text-white/40 text-sm text-center py-4">Searching...</p>}

      {!loading && searched && results.length === 0 && (
        <p className="text-white/40 text-sm text-center py-4">No users found.</p>
      )}

      {results.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl divide-y divide-white/10">
          {results.map((user, i) => (
            <Link key={user.id} href={`/admin/balance/${user.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                className="flex items-center justify-between p-4 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-white/40">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-white/60">
                  <Wallet size={14} />
                  <span>${Number(user.balance).toLocaleString()}</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}