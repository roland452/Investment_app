'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

type LoginPromptProps = {
  /** Section-specific message, e.g. "Log in to see your investments." */
  message: string;
  title?: string;
  loginHref?: string;
  /** If provided, shows a secondary "Create account" link */
  signupHref?: string;
  className?: string;
};

export default function LoginPrompt({
  message,
  title = 'Log in to continue',
  loginHref = '/login',
  signupHref,
  className = '',
}: LoginPromptProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`mx-auto w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur ${className}`}
    >
      <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
        <Lock size={20} className="text-white/70" />
      </div>

      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-white/50">{message}</p>

      <div className="mt-6 flex flex-col gap-2">
        <Link
          href={loginHref}
          className="w-full rounded-xl bg-white py-3 text-sm font-semibold text-black transition active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Log in
        </Link>

        {signupHref && (
          <Link
            href={signupHref}
            className="w-full rounded-xl border border-white/10 py-3 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Create account
          </Link>
        )}
      </div>
    </motion.div>
  );
}