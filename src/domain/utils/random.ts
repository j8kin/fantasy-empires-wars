/**
 * Generic utility that returns a random element from an array
 * @param array - The array to select a random element from
 * @returns A random element from the array
 */
export const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

export const getMultipleRandomElements = <T>(array: T[], count: number): T[] => {
  if (count >= array.length) {
    return [...array];
  }
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
