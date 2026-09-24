'use client';
import { motion, useReducedMotion } from 'framer-motion';

type LoaderProps = {
  /** Text under the animation, e.g. "Loading your investments" */
  message?: string;
  /** Centers the loader over the whole screen */
  fullScreen?: boolean;
  className?: string;
};

// Four bars that rise and fall like a chart
const BARS = [0.45, 0.8, 0.6, 1];

export default function Loader({
  message = 'Loading',
  fullScreen = false,
  className = '',
}: LoaderProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-4 ${
        fullScreen ? 'fixed inset-0 z-50 bg-[#0a0a0a]' : 'w-full py-12'
      } ${className}`}
    >
      <div className="flex h-10 items-end gap-1.5" aria-hidden="true">
        {BARS.map((peak, i) => (
          <motion.span
            key={i}
            className="w-1.5 origin-bottom rounded-full bg-white"
            style={{ height: '100%' }}
            initial={{ scaleY: 0.25, opacity: 0.4 }}
            animate={
              reduceMotion
                ? { scaleY: peak, opacity: 0.8 }
                : { scaleY: [0.25, peak, 0.25], opacity: [0.4, 1, 0.4] }
            }
            transition={
              reduceMotion
                ? { duration: 0 }
                : {
                    duration: 1.1,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.12,
                  }
            }
          />
        ))}
      </div>

      <p className="text-sm text-white/50">{message}</p>
    </div>
  );
}