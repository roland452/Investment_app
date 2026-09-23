'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageCircle } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/authContext';

interface Message {
  id: number;
  sender: 'user' | 'admin';
  message: string;
  created_at: string;
}

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000); // poll every 4s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function fetchMessages() {
    try {
      const { data } = await api.get('/chat/messages');
      setMessages(data);
    } catch {
      // silent fail on poll
    }
  }

  async function handleSend() {
    if (!input.trim() || sending) return;
    setSending(true);
    const text = input;
    setInput('');
    try {
      const { data } = await api.post('/chat/send', { message: text });
      setMessages((prev) => [...prev, data]);
    } catch {
      setInput(text); // restore on failure
    } finally {
      setSending(false);
    }
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center text-white/50">
        Please log in to chat with support.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      <div className="flex items-center gap-2 px-2 pb-4">
        <MessageCircle size={20} />
        <h1 className="text-xl font-bold">Customer Support</h1>
      </div>

      <div className="flex-1 overflow-y-auto bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-white/40 text-sm text-center py-10">
            Send a message and our team will get back to you.
          </p>
        ) : (
          messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                  msg.sender === 'user'
                    ? 'bg-white text-black rounded-br-sm'
                    : 'bg-white/10 text-white rounded-bl-sm'
                }`}
              >
                <p>{msg.message}</p>
                <p
                  className={`text-[10px] mt-1 ${
                    msg.sender === 'user' ? 'text-black/50' : 'text-white/40'
                  }`}
                >
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </motion.div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 pt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
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