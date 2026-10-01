/**
 * Empirically measured motion easing tokens derived from Palomino forensics.
 * @see docs/PALOMINO_FIRST_PAGE_FORENSICS.md
 */

export const editorialEase = [0.25, 1.0, 0.5, 1.0];
export const mediaEase = [0.16, 1.0, 0.3, 1.0];
export const hoverEase = [0.33, 1.0, 0.68, 1.0];
export const navEase = [0.76, 0.0, 0.24, 1.0];
export const revealEase = [0.16, 1.0, 0.3, 1.0];
export const expoOut = [0.16, 1.0, 0.3, 1.0];

export const EASING = {
  editorialEase,
  mediaEase,
  hoverEase,
  navEase,
  revealEase,
  expoOut
};

export default EASING;
