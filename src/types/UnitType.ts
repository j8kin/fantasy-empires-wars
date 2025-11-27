export enum RegularUnitType {
  WARD_HANDS = 'Ward-hands',
  WARRIOR = 'Warrior',
  DWARF = 'Dwarf',
  ORC = 'Orc',
  HALFLING = 'Halfling',
  ELF = 'Elf',
  DARK_ELF = 'Dark-Elf',
  BALLISTA = 'Ballista',
  CATAPULT = 'Catapult',
  UNDEAD = 'Undead',
}

export enum HeroUnitType {
  // non-mage heroes units
  FIGHTER = 'Fighter',
  HAMMER_LORD = 'Hammer-lord',
  RANGER = 'Ranger',
  SHADOW_BLADE = 'Shadowblade',
  OGR = 'Ogr',
  // mage heroes units
  PYROMANCER = 'Pyromancer',
  CLERIC = 'Cleric',
  DRUID = 'Druid',
  ENCHANTER = 'Enchanter',
  NECROMANCER = 'Necromancer',
  // non-magic heroes (heroes who reject magic at all)
  WARSMITH = 'Warsmith',
}

export type UnitType = RegularUnitType | HeroUnitType;

export const isHeroType = (unitType: UnitType): unitType is HeroUnitType => {
  return Object.values(HeroUnitType).includes(unitType as HeroUnitType);
};

export const isWarMachine = (unitType: UnitType): boolean =>
  unitType === RegularUnitType.BALLISTA || unitType === RegularUnitType.CATAPULT;

export const isMageType = (unitType: UnitType): boolean => {
  return (
    unitType === HeroUnitType.PYROMANCER ||
    unitType === HeroUnitType.DRUID ||
    unitType === HeroUnitType.ENCHANTER ||
    unitType === HeroUnitType.CLERIC ||
    unitType === HeroUnitType.NECROMANCER
  );
};
