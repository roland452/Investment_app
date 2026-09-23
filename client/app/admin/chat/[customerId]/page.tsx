'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Send, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';

interface Message {
  id: number;
  sender: 'user' | 'admin';
  message: string;
  created_at: string;
}

export default function AdminCustomerChat() {
  const { customerId } = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<{ name: string; email: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversation();
    const interval = setInterval(fetchConversation, 4000);
    return () => clearInterval(interval);
  }, [customerId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function fetchConversation() {
    try {
      const { data } = await api.get(`/admin/chat/conversations/${customerId}`);
      setCustomer(data.customer);
      setMessages(data.messages);
    } catch {
      // silent fail on poll
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    if (!input.trim() || sending) return;
    setSending(true);
    const text = input;
    setInput('');
    try {
      const { data } = await api.post(`/admin/chat/conversations/${customerId}/send`, {
        message: text,
      });
      setMessages((prev) => [...prev, data]);
    } catch {
      setInput(text);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return <div className="max-w-2xl mx-auto py-20 text-center text-white/50">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      <div className="flex items-center gap-3 px-2 pb-4">
        <button onClick={() => router.push('/admin')}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-bold">{customer?.name}</h1>
          <p className="text-xs text-white/40">{customer?.email}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                msg.sender === 'admin'
                  ? 'bg-white text-black rounded-br-sm'
                  : 'bg-white/10 text-white rounded-bl-sm'
              }`}
            >
              <p>{msg.message}</p>
              <p
                className={`text-[10px] mt-1 ${
                  msg.sender === 'admin' ? 'text-black/50' : 'text-white/40'
                }`}
              >
                {new Date(msg.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </motion.div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 pt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Reply to customer..."
          className="flex-1 p-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-white/30 transition-colors"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={sending || !input.trim()}
          className="bg-white text-black p-3 rounded-xl disabled:opacity-40"
        >
          <Send size={18} />
        </motion.button>
      </div>
    </div>
  );
}