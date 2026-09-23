'use client';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-black text-white px-6 py-24 md:py-32">
      {/* glow background */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-500/20 rounded-full blur-3xl" />

      <div className="relative max-w-3xl mx-auto text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-green-400"
        >
          <TrendingUp size={14} />
          Trusted by 20,000+ investors
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl font-bold leading-tight"
        >
          Grow your wealth with{' '}
          <span className="text-orange-500">confidence</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-white/60 text-lg max-w-xl mx-auto"
        >
          Fund your wallet, invest in curated plans, and track your returns
          in real time — all in one secure platform.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center justify-center gap-4 pt-4"
        >
          <Link href="/signup">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="bg-orange-500 text-black font-semibold px-6 py-3 rounded-xl flex items-center gap-2"
            >
              Start Investing <ArrowRight size={18} />
            </motion.button>
          </Link>
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="border border-white/20 px-6 py-3 rounded-xl font-medium"
            >
              Login
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}