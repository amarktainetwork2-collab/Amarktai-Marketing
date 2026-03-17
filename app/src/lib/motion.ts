/**
 * Shared Framer Motion constants.
 * Single source of truth for animation variants and transitions used across the app.
 */

import type { Transition, Variants } from 'framer-motion';

/** Standard cubic-bezier ease curve used on page and list animations. */
export const EASE_OUT_CURVE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Reusable spring transition for item enter/exit animations. */
export const SPRING_TRANSITION: Transition = {
  type: 'spring',
  stiffness: 100,
};

/**
 * Standard staggered container variants (stagger: 0.1).
 * Use on the parent wrapper; pair with `itemVariants` on each child.
 */
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

/**
 * Staggered container variants with a slower stagger (0.08).
 * Used in feed-style lists where items arrive slightly more spaced.
 */
export const containerVariantsSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

/** Standard item variants — vertical slide-up spring. */
export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: SPRING_TRANSITION,
  },
};

/** Item variants — horizontal slide-in from the left, spring. */
export const itemVariantsX: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: SPRING_TRANSITION,
  },
};
