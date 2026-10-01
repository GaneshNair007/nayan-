/**
 * Empirically measured motion easing tokens derived from Palomino forensics.
 * @see docs/PALOMINO_MOTION_FORENSICS.md
 */

export const EASING = {
  // Primary editorial curve (Power4.out equivalent: fast start, luxurious gentle deceleration)
  editorialEase: [0.25, 1.0, 0.5, 1.0],

  // Exponential deceleration used for numeric counters and rapid reveals
  expoOut: [0.16, 1.0, 0.3, 1.0],

  // Cinematic media and case-study transitions
  mediaEase: [0.22, 1.0, 0.36, 1.0],

  // Hover scale and subtle pointer inertia
  hoverEase: [0.25, 1.0, 0.5, 1.0],

  // Mask clip-path reveals
  revealEase: [0.16, 1.0, 0.3, 1.0],

  // Smooth scroll interpolation curve
  smoothScroll: [0.2, 1.0, 0.3, 1.0]
};

export default EASING;
