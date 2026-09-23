'use client';
import { motion } from 'framer-motion';
import { ShieldCheck, Wallet, BarChart3, Zap } from 'lucide-react';

const features = [
  {
    icon: Wallet,
    title: 'Instant Wallet Funding',
    desc: 'Top up your wallet in seconds via card or bank transfer.',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Tracking',
    desc: 'Watch your returns grow with live portfolio insights.',
  },
  {
    icon: ShieldCheck,
    title: 'Bank-Level Security',
    desc: 'Your funds and data are protected with encrypted transactions.',
  },
  {
    icon: Zap,
    title: 'Fast Withdrawals',
    desc: 'Cash out your returns quickly, whenever you need to.',
  },
];

export default function Features() {
  return (
    <section className="bg-black text-white px-6 py-20">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl md:text-3xl font-bold text-center mb-12"
        >
          Why invest with us
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3"
              >
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Icon size={20} className="text-orange-500" />
                </div>
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="text-white/50 text-sm">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}