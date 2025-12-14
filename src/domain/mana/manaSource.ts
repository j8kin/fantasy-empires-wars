import { ManaSource, ManaType } from '../../types/Mana';
import { HeroUnitType } from '../../types/UnitType';
import { LandType } from '../../types/Land';

const MANA_SOURCES: ManaSource[] = [
  {
    type: ManaType.BLACK,
    heroTypes: [HeroUnitType.NECROMANCER],
    landTypes: [LandType.SHADOW_MIRE, LandType.BLIGHTED_FEN],
  },
  {
    type: ManaType.RED,
    heroTypes: [HeroUnitType.PYROMANCER],
    landTypes: [LandType.VOLCANO, LandType.LAVA],
  },
  {
    type: ManaType.BLUE,
    heroTypes: [HeroUnitType.ENCHANTER],
    landTypes: [LandType.CRISTAL_BASIN, LandType.MISTY_GLADES],
  },
  {
    type: ManaType.GREEN,
    heroTypes: [HeroUnitType.DRUID],
    landTypes: [LandType.HEARTWOOD_COVE, LandType.VERDANT_GLADE],
  },
  {
    type: ManaType.WHITE,
    heroTypes: [HeroUnitType.CLERIC],
    landTypes: [LandType.SUN_SPIRE_PEAKS, LandType.GOLDEN_PLAINS],
  },
];

/**
 * Finds mana source by hero type or land type
 * @param params - Object containing heroType and/or landType to search by
 * @returns The matching mana source, or undefined if not found
 */
export const getManaSource = ({
  manaType,
  heroType,
  landType,
}: {
  manaType?: ManaType;
  heroType?: HeroUnitType;
  landType?: LandType;
}): ManaSource | undefined => {
  return MANA_SOURCES.find(
    (source) =>
      (manaType != null && source.type === manaType) ||
      (heroType != null && source.heroTypes.includes(heroType)) ||
      (landType != null && source.landTypes.includes(landType))
  );
};
