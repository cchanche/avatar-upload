/**
 * Convert rgb color to hsv color-space
 *
 * Individual channels have to be between 0 and 1
 *
 * @returns h in [0, 360], s, l in [0, 1]
 *
 * Shamelessly stolen from :
 * @see https://stackoverflow.com/a/54070620/15720810
 */
export function rgb2hsl(r: number, g: number, b: number) {
  const v = Math.max(r, g, b),
    c = v - Math.min(r, g, b),
    f = 1 - Math.abs(v + v - c - 1);
  const h =
    c && (v == r ? (g - b) / c : v == g ? 2 + (b - r) / c : 4 + (r - g) / c);
  return { h: 60 * (h < 0 ? h + 6 : h), s: f ? c / f : 0, l: (v + v - c) / 2 };
}
