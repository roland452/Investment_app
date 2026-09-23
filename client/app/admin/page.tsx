'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import api from '@/lib/api';

interface Conversation {
  user_id: number;
  name: string;
  email: string;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: string;
}

export default function AdminDashboard() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 6000);
    return () => clearInterval(interval);
  }, []);

  async function fetchConversations() {
    try {
      const { data } = await api.get('/admin/chat/conversations');
      setConversations(data);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="max-w-3xl mx-auto py-20 text-center text-white/50">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Customer Conversations</h1>

      {conversations.length === 0 ? (
        <p className="text-white/40 text-sm bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
          No conversations yet.
        </p>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl divide-y divide-white/10">
          {conversations.map((c, i) => (
            <Link key={c.user_id} href={`/admin/chat/${c.user_id}`}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                className="flex items-center justify-between p-4 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <MessageCircle size={18} />
                  </div>
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-white/40 truncate max-w-[200px]">
                      {c.last_message || 'No messages yet'}
                    </p>
                  </div>
                </div>
                {Number(c.unread_count) > 0 && (
                  <span className="bg-white text-black text-xs font-bold px-2 py-1 rounded-full">
                    {c.unread_count}
                  </span>
                )}
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}