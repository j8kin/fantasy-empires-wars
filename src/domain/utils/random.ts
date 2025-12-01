/**
 * Generic utility that returns a random element from an array
 * @param array - The array to select a random element from
 * @returns A random element from the array
 */
export const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};
