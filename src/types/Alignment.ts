export type Alignment = 'lawful' | 'neutral' | 'chaotic';

/**
 * Returns the color associated with a player's alignment
 * @param alignment The player's alignment
 * @returns The hex color code for the alignment
 */
export const getAlignmentColor = (alignment: Alignment): string => {
  switch (alignment) {
    case 'lawful':
      return '#4A90E2'; // Blue
    case 'neutral':
      return '#95A5A6'; // Gray
    case 'chaotic':
      return '#E74C3C'; // Red
    default:
      return '#95A5A6'; // Default to gray
  }
};
