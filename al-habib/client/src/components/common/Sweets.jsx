import { motion, useReducedMotion } from 'framer-motion';

export const Laddoo = ({ size = 90 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="50" r="42" fill="#E0A23B" /><circle cx="50" cy="50" r="42" fill="none" stroke="#B77945" strokeWidth="3" />
    {[[34,36],[56,30],[66,50],[44,52],[30,62],[56,68],[72,66],[40,78]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.2" fill="#B77945" />)}
    <ellipse cx="38" cy="30" rx="14" ry="7" fill="#F4C96B" opacity=".6" />
  </svg>
);
export const Jalebi = ({ size = 90 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
    <path d="M50 50c0-6 8-6 8 0s-12 10-16 0 4-20 18-20 22 14 22 24-12 26-30 26-32-14-32-32 16-34 38-34" fill="none" stroke="#D9822B" strokeWidth="8" strokeLinecap="round" />
    <path d="M50 50c0-6 8-6 8 0s-12 10-16 0 4-20 18-20" fill="none" stroke="#F2A94E" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);
export const Sparkle = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0c1 7 5 11 12 12-7 1-11 5-12 12-1-7-5-11-12-12 7-1 11-5 12-12z" fill="#B77945" /></svg>
);

// Gentle float; disabled when the visitor prefers reduced motion.
export function Float({ children, className = '', y = 12, duration = 5, delay = 0 }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className} animate={reduce ? undefined : { y: [0, -y, 0], rotate: [0, 4, 0] }} transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}>
      {children}
    </motion.div>
  );
}
