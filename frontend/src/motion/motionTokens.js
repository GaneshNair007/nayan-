/**
 * NAYAN × Palomino Master Motion Tokens
 * Centralized easing curves, duration standards, and spring physics.
 */
import { editorialEase, mediaEase, hoverEase, navEase, revealEase, expoOut } from './easing';
import { SPRINGS } from './springs';

export const MOTION_TOKENS = {
  easings: {
    editorial: editorialEase,
    media: mediaEase,
    hover: hoverEase,
    nav: navEase,
    reveal: revealEase,
    expoOut
  },
  durations: {
    micro: 0.15,
    quick: 0.25,
    standard: 0.45,
    editorial: 0.65,
    deliberate: 0.85,
    curtain: 1.1
  },
  springs: SPRINGS,
  stagger: {
    letters: 0.015,
    lines: 0.08,
    cards: 0.12,
    timeline: 0.15
  }
};

export default MOTION_TOKENS;
