import { Alignment } from '../../types/Alignment';

/**
 * Returns the color associated with a player's alignment
 * @param alignment The player's alignment
 * @returns The RGB color code for the alignment
 */
export const getAlignmentColor = (alignment: Alignment): string => {
  switch (alignment) {
    case Alignment.LAWFUL:
      return 'rgb(74, 144, 226)'; // Blue
    case Alignment.NEUTRAL:
      return 'rgb(149, 165, 166)'; // Gray
    case Alignment.CHAOTIC:
      return 'rgb(231, 76, 60)'; // Red
    default:
      return 'rgb(149, 165, 166)'; // Default to gray
  }
};
