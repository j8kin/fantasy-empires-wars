export const RegularUnitName = {
  WARD_HANDS: 'Ward-hands',
  WARRIOR: 'Warrior',
  DWARF: 'Dwarf',
  ORC: 'Orc',
  HALFLING: 'Halfling',
  ELF: 'Elf',
  DARK_ELF: 'Dark-Elf',
  BALLISTA: 'Ballista',
  CATAPULT: 'Catapult',
  UNDEAD: 'Undead',
} as const;

export type RegularUnitType = (typeof RegularUnitName)[keyof typeof RegularUnitName];

export const HeroUnitName = {
  // non-mage heroes units
  FIGHTER: 'Fighter',
  HAMMER_LORD: 'Hammer-lord',
  RANGER: 'Ranger',
  SHADOW_BLADE: 'Shadowblade',
  OGR: 'Ogr',
  // mage heroes units
  PYROMANCER: 'Pyromancer',
  CLERIC: 'Cleric',
  DRUID: 'Druid',
  ENCHANTER: 'Enchanter',
  NECROMANCER: 'Necromancer',
  // non-magic heroes (heroes who reject magic at all)
  WARSMITH: 'Warsmith',
} as const;

export type HeroUnitType = (typeof HeroUnitName)[keyof typeof HeroUnitName];

export type UnitType = RegularUnitType | HeroUnitType;

export const MAX_HERO_LEVEL = 32;
