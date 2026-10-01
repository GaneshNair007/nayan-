/**
 * Spring configurations for inertia-based pointer interactions and subtle UI cues.
 * Note: Photography scroll motion uses deterministic scroll-linked useTransform,
 * not oscillating springs.
 * @see docs/PALOMINO_MOTION_FORENSICS.md
 */

export const SPRINGS = {
  // Cursor difference dot tracking (fast responsiveness, gentle dampening)
  cursorSpring: {
    stiffness: 450,
    damping: 35,
    mass: 0.5
  },

  // Media hover preview inertia (slight physical lag behind pointer)
  previewSpring: {
    stiffness: 220,
    damping: 28,
    mass: 0.8
  },

  // Small UI micro-interactions
  smallUISpring: {
    stiffness: 300,
    damping: 30,
    mass: 0.6
  }
};

export default SPRINGS;
