import { PLAYER_COLORS } from '../../types/PlayerColors';
import type { PlayerColorName } from '../../types/PlayerColors';

/**
 * Looks up a color's hex value by name
 * @param colorName - The player color name to look up
 * @returns The hex color value, or white as default
 */
export const getPlayerColorValue = (colorName: PlayerColorName): string => {
  const color = PLAYER_COLORS.find((c) => c.name === colorName);
  return color?.value || '#FFFFFF'; // Default to white if color not found
};
