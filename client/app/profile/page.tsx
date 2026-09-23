'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, ShieldCheck, Edit3 } from 'lucide-react';
import api from '@/lib/api';

interface Profile {
  name: string;
  email: string;
  phone: string | null;
  verified: boolean;
  created_at: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/user/profile')
      .then(({ data }) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !profile) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center text-white/50">
        Loading...
      </div>
    );
  }

  const joined = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-bold"
      >
        My Profile
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4"
      >
        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
          <User size={28} />
        </div>
        <div className="flex-1">
          <p className="text-lg font-semibold">{profile.name}</p>
          <p className="text-white/50 text-sm">Member since {joined}</p>
        </div>
        {profile.verified && (
          <span className="flex items-center gap-1 text-xs bg-white/10 px-3 py-1.5 rounded-full text-green-400">
            <ShieldCheck size={14} /> Verified
          </span>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 border border-white/10 rounded-2xl divide-y divide-white/10"
      >
        <div className="flex items-center gap-3 p-4">
          <Mail size={18} className="text-white/50" />
          <div>
            <p className="text-xs text-white/40">Email</p>
            <p className="text-sm font-medium">{profile.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4">
          <Phone size={18} className="text-white/50" />
          <div>
            <p className="text-xs text-white/40">Phone</p>
            <p className="text-sm font-medium">{profile.phone || 'Not added'}</p>
          </div>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-white text-black font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
      >
        <Edit3 size={18} /> Edit Profile
      </motion.button>
    </div>
  );
}