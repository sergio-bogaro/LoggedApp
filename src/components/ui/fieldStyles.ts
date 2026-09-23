/*
 * The shared identity of a form field — border, plane, focus ring and disabled
 * state.
 *
 * Composed by Input, the Select trigger and the date fields. It exists as one
 * constant on purpose: the divergence between a hand-copied `Button variant`
 * and the real fields is what made the range picker look like a different
 * control from the select beside it.
 */
export const fieldSurface = [
  "rounded-control border border-input bg-background",
  "outline-none transition-colors",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/25",
].join(" ");
