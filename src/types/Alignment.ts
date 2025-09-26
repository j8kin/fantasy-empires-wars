export enum Alignment {
  LAWFUL = 'lawful',
  NEUTRAL = 'neutral',
  CHAOTIC = 'chaotic',
}

/**
 * Returns the color associated with a player's alignment
 * @param alignment The player's alignment
 * @returns The hex color code for the alignment
 */
export const getAlignmentColor = (alignment: Alignment): string => {
  switch (alignment) {
    case Alignment.LAWFUL:
      return '#4A90E2'; // Blue
    case Alignment.NEUTRAL:
      return '#95A5A6'; // Gray
    case Alignment.CHAOTIC:
      return '#E74C3C'; // Red
    default:
      return '#95A5A6'; // Default to gray
  }
};
