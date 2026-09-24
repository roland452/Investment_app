'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, ShieldCheck, Shield, Crown, Calendar, Hash } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Profile {
  id: number;
  name: string;
  email: string;
  verified: boolean;
  is_admin: boolean;
  created_at: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/user/profile')
      .then(({ data }) => {
        setProfile(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Profile fetch error:', err);
        setError(err.response?.data?.error || 'Could not load profile');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center text-white/50">
        Loading...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center text-red-400">
        {error || 'Profile not found'}
      </div>
    );
  }

  const joined = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const isAdmin = profile.is_admin;

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
        className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4 flex-wrap"
      >
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center ${
            isAdmin ? 'bg-amber-400/10' : 'bg-white/10'
          }`}
        >
          {isAdmin ? (
            <Crown size={28} className="text-amber-400" />
          ) : (
            <User size={28} />
          )}
        </div>
        <div className="flex-1 min-w-[160px]">
          <p className="text-lg font-semibold">{profile.name}</p>
          <p className="text-white/50 text-sm">Member since {joined}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span
            className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-medium ${
              isAdmin
                ? 'bg-amber-400/10 text-amber-400'
                : 'bg-white/10 text-white/70'
            }`}
          >
            {isAdmin ? <Shield size={13} /> : <User size={13} />}
            {isAdmin ? 'Admin' : 'Investor'}
          </span>
          {profile.verified && (
            <span className="flex items-center gap-1 text-xs bg-green-500/10 px-3 py-1.5 rounded-full text-green-400">
              <ShieldCheck size={13} /> Verified
            </span>
          )}
        </div>
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
          <Hash size={18} className="text-white/50" />
          <div>
            <p className="text-xs text-white/40">Account ID</p>
            <p className="text-sm font-medium">#{profile.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4">
          <Calendar size={18} className="text-white/50" />
          <div>
            <p className="text-xs text-white/40">Joined</p>
            <p className="text-sm font-medium">{joined}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`rounded-2xl p-5 border flex items-center gap-3 ${
          isAdmin
            ? 'bg-amber-400/5 border-amber-400/20'
            : 'bg-white/5 border-white/10'
        }`}
      >
        {isAdmin ? (
          <>
            <Shield size={20} className="text-amber-400 shrink-0" />
            <p className="text-sm text-white/70">
              You have administrator access — you can manage customer support chats and
              user balances from the Admin panel.
            </p>
          </>
        ) : (
          <>
            <ShieldCheck size={20} className="text-white/50 shrink-0" />
            <p className="text-sm text-white/60">
              Your account is protected. If you ever suspect unauthorized access,
              contact support immediately.
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}