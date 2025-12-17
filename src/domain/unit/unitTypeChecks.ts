import { HeroUnitType, RegularUnitType } from '../../types/UnitType';
import type { UnitType } from '../../types/UnitType';

/**
 * Type guard to check if a unit type is a hero unit
 * @param unitType - The unit type to check
 * @returns true if the unit is a hero type
 */
export const isHeroType = (unitType: UnitType): unitType is HeroUnitType => {
  return Object.values(HeroUnitType).includes(unitType as HeroUnitType);
};

/**
 * Checks if a unit is a war machine (Ballista or Catapult)
 * @param unitType - The unit type to check
 * @returns true if the unit is a war machine
 */
export const isWarMachine = (unitType: UnitType): boolean =>
  unitType === RegularUnitType.BALLISTA || unitType === RegularUnitType.CATAPULT;

/**
 * Checks if a unit is a mage type hero
 * @param unitType - The unit type to check
 * @returns true if the unit is one of the mage hero types
 */
export const isMageType = (unitType: UnitType): boolean => {
  return (
    unitType === HeroUnitType.PYROMANCER ||
    unitType === HeroUnitType.DRUID ||
    unitType === HeroUnitType.ENCHANTER ||
    unitType === HeroUnitType.CLERIC ||
    unitType === HeroUnitType.NECROMANCER
  );
};
