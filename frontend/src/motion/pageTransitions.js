/**
 * Editorial Page Transition Configurations for Motion for React.
 */
import { editorialEase } from './easing';

export const pageTransitionVariants = {
  initial: {
    opacity: 0,
    y: 18,
    transition: { duration: 0.45, ease: editorialEase }
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: editorialEase,
      staggerChildren: 0.08
    }
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.35, ease: editorialEase }
  }
};

export const editorialItemVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: editorialEase }
  }
};
