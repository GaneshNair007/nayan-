/**
 * Standalone smooth scroll configuration using Lenis.
 * GSAP and ScrollTrigger have been completely removed from the landing page.
 * Motion for React drives all animations and scroll-linked transforms.
 */
import Lenis from 'lenis';

export function initSmoothScroll() {
  if (typeof window === 'undefined') return { lenis: null, destroy: () => {} };

  // Respect reduced-motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    return { lenis: null, destroy: () => {} };
  }

  // Initialize Lenis with subtle inertia matching Palomino telemetry
  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.5
  });

  let rafId;
  function raf(time) {
    lenis.raf(time);
    rafId = requestAnimationFrame(raf);
  }
  rafId = requestAnimationFrame(raf);

  return {
    lenis,
    destroy: () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    }
  };
}
