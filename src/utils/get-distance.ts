/**
 * Perform the euclidian distance between two points
 * @see https://en.wikipedia.org/wiki/Euclidean_distance
 */
export const getDistance = (
  point1: [number, number],
  point2: [number, number],
) => {
  return Math.sqrt(
    Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2),
  );
};
