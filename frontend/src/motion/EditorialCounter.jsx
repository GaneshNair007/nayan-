import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'motion/react';

export default function EditorialCounter({
  value,
  duration = 1.6,
  decimals = 0,
  prefix = '',
  suffix = ''
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const target = typeof value === 'number' ? value : parseFloat(value) || 0;
    const startTime = performance.now();
    let animId = null;

    const update = (now) => {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(1, elapsed / duration);
      // Easing: expoOut [0.16, 1, 0.3, 1] approximation: 1 - Math.pow(2, -10 * progress)
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = eased * target;

      setDisplayValue(current);

      if (progress < 1) {
        animId = requestAnimationFrame(update);
      } else {
        setDisplayValue(target);
      }
    };

    animId = requestAnimationFrame(update);

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isInView, value, duration]);

  const formatted = decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue).toLocaleString();

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{formatted}{suffix}
    </span>
  );
}
