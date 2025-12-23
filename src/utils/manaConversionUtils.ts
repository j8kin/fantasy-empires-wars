import { ManaKind } from '../types/Mana';
import { Alignment } from '../types/Alignment';
import type { ManaType } from '../types/Mana';
import type { AlignmentType } from '../types/Alignment';

/**
 * Calculates the mana conversion amount based on player alignment and target mana type.
 * Used by both the Arcane Exchange spell and the VialPanel UI.
 *
 * @param alignment - The player's alignment (Chaotic, Lawful, or Neutral)
 * @param targetManaType - The mana type to convert to
 * @returns The amount of mana that will be gained from the conversion
 */
export const calculateManaConversionAmount = (
  alignment: AlignmentType,
  targetManaType: ManaType
): number => {
  switch (alignment) {
    case Alignment.CHAOTIC:
      switch (targetManaType) {
        case ManaKind.BLACK:
        case ManaKind.RED:
          return 90;
        case ManaKind.GREEN:
          return 75;
        case ManaKind.WHITE:
          return 50;
        default:
          return 0;
      }
    case Alignment.LAWFUL:
      switch (targetManaType) {
        case ManaKind.WHITE:
        case ManaKind.GREEN:
          return 90;
        case ManaKind.RED:
          return 75;
        case ManaKind.BLACK:
          return 50;
        default:
          return 0;
      }
    case Alignment.NEUTRAL:
      return 95;
    default:
      return 0;
  }
};
