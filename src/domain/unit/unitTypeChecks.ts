import { HeroUnitName, RegularUnitName } from '../../types/UnitType';
import type { HeroUnitType, UnitType } from '../../types/UnitType';

/**
 * Type guard to check if a unit type is a hero unit
 * @param unitType - The unit type to check
 * @returns true if the unit is a hero type
 */
export const isHeroType = (unitType: UnitType): unitType is HeroUnitType => {
  return Object.values(HeroUnitName).includes(unitType as HeroUnitType);
};

/**
 * Checks if a unit is a war machine (Ballista or Catapult)
 * @param unitType - The unit type to check
 * @returns true if the unit is a war machine
 */
export const isWarMachine = (unitType: UnitType): boolean =>
  unitType === RegularUnitName.BALLISTA || unitType === RegularUnitName.CATAPULT;

/**
 * Checks if a unit is a mage type hero
 * @param unitType - The unit type to check
 * @returns true if the unit is one of the mage hero types
 */
export const isMageType = (unitType: UnitType): boolean => {
  return (
    unitType === HeroUnitName.PYROMANCER ||
    unitType === HeroUnitName.DRUID ||
    unitType === HeroUnitName.ENCHANTER ||
    unitType === HeroUnitName.CLERIC ||
    unitType === HeroUnitName.NECROMANCER
  );
};
