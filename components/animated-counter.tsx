'use client';

import { motion, useInView, useMotionValue, animate } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

type Props = {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
};

export function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  duration = 2,
  className,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.floor(v)),
    });
    return () => controls.stop();
  }, [inView, value, duration]);

  return (
    <motion.span ref={ref} className={className}>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </motion.span>
  );
}
