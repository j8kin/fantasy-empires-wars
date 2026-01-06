import { Mana } from '../../types/Mana';
import { HeroUnitName } from '../../types/UnitType';
import { LandName } from '../../types/Land';
import type { LandType } from '../../types/Land';
import type { ManaType } from '../../types/Mana';
import type { ManaSource } from '../../types/Mana';
import type { HeroUnitType } from '../../types/UnitType';

const MANA_SOURCES: ManaSource[] = [
  {
    type: Mana.BLACK,
    heroTypes: [HeroUnitName.NECROMANCER],
    landTypes: [LandName.SHADOW_MIRE, LandName.BLIGHTED_FEN],
  },
  {
    type: Mana.RED,
    heroTypes: [HeroUnitName.PYROMANCER],
    landTypes: [LandName.VOLCANO, LandName.LAVA],
  },
  {
    type: Mana.BLUE,
    heroTypes: [HeroUnitName.ENCHANTER],
    landTypes: [LandName.CRISTAL_BASIN, LandName.MISTY_GLADES],
  },
  {
    type: Mana.GREEN,
    heroTypes: [HeroUnitName.DRUID],
    landTypes: [LandName.HEARTWOOD_GROVE, LandName.VERDANT_GLADE],
  },
  {
    type: Mana.WHITE,
    heroTypes: [HeroUnitName.CLERIC],
    landTypes: [LandName.SUN_SPIRE_PEAKS, LandName.GOLDEN_PLAINS],
  },
];

/**
 * Finds mana source by hero type or land type
 * @param params - Object containing heroType and/or LandKind to search by
 * @returns The matching mana source, or undefined if not found
 */
export const getManaSource = ({
  manaType,
  heroType,
  landKind,
}: {
  manaType?: ManaType;
  heroType?: HeroUnitType;
  landKind?: LandType;
}): ManaSource | undefined => {
  return MANA_SOURCES.find(
    (source) =>
      (manaType != null && source.type === manaType) ||
      (heroType != null && source.heroTypes.includes(heroType)) ||
      (landKind != null && source.landTypes.includes(landKind))
  );
};
