'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CTA() {
  return (
    <section className="bg-gradient-to-b from-black to-orange-950/20 text-white px-6 py-20 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-xl mx-auto space-y-6"
      >
        <h2 className="text-3xl font-bold">Ready to grow your money?</h2>
        <p className="text-white/60">
          Create your account and make your first investment in minutes.
        </p>
        <Link href="/signup">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            className="bg-orange-500 text-black font-semibold px-8 py-3 rounded-xl"
          >
            Get Started
          </motion.button>
        </Link>
      </motion.div>
    </section>
  );
}