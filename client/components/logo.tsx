'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <motion.div
        whileHover={{ rotate: 8, scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        className="relative w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* ascending growth bars */}
          <rect x="3" y="14" width="3.5" height="7" rx="1" fill="black" />
          <rect x="8.5" y="9" width="3.5" height="12" rx="1" fill="black" />
          <rect x="14" y="4" width="3.5" height="17" rx="1" fill="black" />
          {/* spark / arrow accent */}
          <path
            d="M14 6L19.5 2.5M19.5 2.5H16M19.5 2.5V6"
            stroke="black"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>

      <div className="flex flex-col leading-none">
        <span className="text-lg font-bold tracking-tight">
          Tesla <span className="text-white/60 font-medium">Investment</span>
        </span>
        <motion.span
          initial={{ width: 0 }}
          whileInView={{ width: '100%' }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="h-[2px] bg-white/30 mt-0.5"
        />
      </div>
    </Link>
  );
}