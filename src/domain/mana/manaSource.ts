import { Mana } from '../../types/Mana';
import { HeroUnitName } from '../../types/UnitType';
import { LandKind } from '../../types/Land';
import type { LandType } from '../../types/Land';
import type { ManaType } from '../../types/Mana';
import type { ManaSource } from '../../types/Mana';
import type { HeroUnitType } from '../../types/UnitType';

const MANA_SOURCES: ManaSource[] = [
  {
    type: Mana.BLACK,
    heroTypes: [HeroUnitName.NECROMANCER],
    landKinds: [LandKind.SHADOW_MIRE, LandKind.BLIGHTED_FEN],
  },
  {
    type: Mana.RED,
    heroTypes: [HeroUnitName.PYROMANCER],
    landKinds: [LandKind.VOLCANO, LandKind.LAVA],
  },
  {
    type: Mana.BLUE,
    heroTypes: [HeroUnitName.ENCHANTER],
    landKinds: [LandKind.CRISTAL_BASIN, LandKind.MISTY_GLADES],
  },
  {
    type: Mana.GREEN,
    heroTypes: [HeroUnitName.DRUID],
    landKinds: [LandKind.HEARTWOOD_COVE, LandKind.VERDANT_GLADE],
  },
  {
    type: Mana.WHITE,
    heroTypes: [HeroUnitName.CLERIC],
    landKinds: [LandKind.SUN_SPIRE_PEAKS, LandKind.GOLDEN_PLAINS],
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
      (landKind != null && source.landKinds.includes(landKind))
  );
};
