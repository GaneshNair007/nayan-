/**
 * GSAP ScrollTrigger and Lenis smooth scrolling configuration
 * Centralizes easing, scrub triggers, and motion lifecycle.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export function initSmoothScroll() {
  // Check if reduced motion is requested
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    return { lenis: null, destroy: () => {} };
  }

  // Initialize Lenis with subtle inertia matching Palomino
  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.5
  });

  // Connect Lenis scroll events to GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);

  const tickerCallback = (time) => {
    lenis.raf(time * 1000);
  };

  gsap.ticker.add(tickerCallback);
  gsap.ticker.lagSmoothing(0);

  return {
    lenis,
    destroy: () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      ScrollTrigger.getAll().forEach(t => t.kill());
    }
  };
}

export const EASING = {
  smooth: 'cubic-bezier(0.2, 1, 0.3, 1)',
  characterSwap: 'cubic-bezier(0.3, 1, 0.7, 1)'
};
