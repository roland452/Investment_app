'use client';
import { motion } from 'framer-motion';
import { WifiOff, AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Returns true when a request failed because of the network
 * (offline, server unreachable, timeout) rather than a server error reply.
 * Works with axios errors and the browser's fetch "Failed to fetch".
 */
export function isNetworkError(err: any): boolean {
  if (!err) return false;
  if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED') return true;
  if (err.message === 'Network Error' || err.message === 'Failed to fetch') return true;
  // axios: request was sent but no response came back
  return Boolean(err.request && !err.response);
}

type ErrorStateProps = {
  /** Use true for network / failed to fetch errors, false for other errors */
  network?: boolean;
  title?: string;
  /** Section-specific message */
  message?: string;
  /** Shows a "Try again" button when provided */
  onRetry?: () => void;
  retrying?: boolean;
  className?: string;
};

export default function ErrorState({
  network = true,
  title,
  message,
  onRetry,
  retrying = false,
  className = '',
}: ErrorStateProps) {
  const Icon = network ? WifiOff : AlertCircle;
  const finalTitle = title ?? (network ? 'Connection problem' : 'Something went wrong');
  const finalMessage =
    message ??
    (network
      ? 'We could not reach the server. Check your internet connection and try again.'
      : 'We could not load this. Please try again.');

  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`mx-auto w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur ${className}`}
    >
      <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
        <Icon size={20} className="text-red-400" />
      </div>

      <h2 className="text-lg font-semibold tracking-tight">{finalTitle}</h2>
      <p className="mt-2 text-sm leading-relaxed text-white/50">{finalMessage}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          disabled={retrying}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-black transition active:scale-[0.98] disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <RefreshCw size={16} className={retrying ? 'animate-spin' : ''} />
          {retrying ? 'Trying again' : 'Try again'}
        </button>
      )}
    </motion.div>
  );
}