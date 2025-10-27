export enum RegularUnitType {
  WARRIOR = 'Warrior',
  DWARF = 'Dwarf',
  ORC = 'Orc',
  ELF = 'Elf',
  DARK_ELF = 'Dark-Elf',
  BALLISTA = 'Ballista',
  CATAPULT = 'Catapult',
}

export enum HeroUnitType {
  FIGHTER = 'Fighter',
  HAMMER_LORD = 'Hammer-lord',
  RANGER = 'Ranger',
  PYROMANCER = 'Pyromancer',
  CLERIC = 'Cleric',
  DRUID = 'Druid',
  ENCHANTER = 'Enchanter',
  NECROMANCER = 'Necromancer',
}
export type UnitType = RegularUnitType | HeroUnitType;

export interface HeroUnit extends BaseUnit {
  id: HeroUnitType;
  name: string; // only heroes has uniq names
  level: number; // for non-hero units 1-regular, 2-veteran, 3-elite
  mana?: number; // how many mana produced per turn (only for heroes)
}

export enum UnitRank {
  REGULAR = 'regular',
  VETERAN = 'veteran',
  ELITE = 'elite',
}

export const isHero = (unit: Unit): boolean => typeof unit.level === 'number';

export interface RegularUnit extends BaseUnit {
  id: RegularUnitType;
  level: UnitRank;
  count: number;
}

export type Unit = HeroUnit | RegularUnit;

export interface BaseUnit {
  attack: number;
  defense: number;
  range?: number;
  rangeDamage?: number;
  health: number;
  maintainCost: number;
  speed: number;
}

export type ArmyUnit = {
  unit: Unit;
  isMoving: boolean; // true: units are moving and will be in "destination" land at the beginning of the next turn
};

export type Army = ArmyUnit[];

export const getDefaultUnit = (unitType: UnitType): Unit => {
  switch (unitType) {
    case RegularUnitType.WARRIOR:
      return {
        id: RegularUnitType.WARRIOR,
        attack: 8,
        defense: 6,
        health: 25,
        maintainCost: 4,
        speed: 2,
        level: UnitRank.REGULAR,
        count: 20,
      };
    case RegularUnitType.DWARF:
      return {
        id: RegularUnitType.DWARF,
        attack: 12,
        defense: 20,
        health: 40,
        maintainCost: 5,
        speed: 1,
        level: UnitRank.REGULAR,
        count: 20,
      };
    case RegularUnitType.ORC:
      return {
        id: RegularUnitType.ORC,
        attack: 10,
        defense: 15,
        health: 30,
        maintainCost: 4.5,
        speed: 2,
        level: UnitRank.REGULAR,
        count: 20,
      };
    case RegularUnitType.ELF:
      return {
        id: RegularUnitType.ELF,
        attack: 15,
        defense: 4,
        range: 20,
        rangeDamage: 15,
        health: 20,
        maintainCost: 5,
        speed: 3,
        level: UnitRank.REGULAR,
        count: 20,
      };
    case RegularUnitType.DARK_ELF:
      return {
        id: RegularUnitType.DARK_ELF,
        attack: 15,
        defense: 4,
        range: 25,
        rangeDamage: 25,
        health: 20,
        maintainCost: 5,
        speed: 3,
        level: UnitRank.REGULAR,
        count: 20,
      };
    // War Machines
    // Catapult do not damage anything only destroy buildings/walls
    case RegularUnitType.BALLISTA:
      return {
        id: RegularUnitType.BALLISTA,
        attack: 0,
        defense: 0,
        range: 35,
        rangeDamage: 25,
        health: 15,
        maintainCost: 150,
        speed: 0,
        level: UnitRank.REGULAR,
        count: 1,
      };
    case RegularUnitType.CATAPULT:
      return {
        id: RegularUnitType.CATAPULT,
        attack: 0,
        defense: 0,
        health: 30,
        maintainCost: 50,
        speed: 0,
        level: UnitRank.REGULAR,
        count: 1,
      };
    // HEROES
    // Human warrior hero

    case HeroUnitType.FIGHTER:
      return {
        id: HeroUnitType.FIGHTER,
        name: 'Fighter',
        attack: 30,
        defense: 3,
        range: 2,
        rangeDamage: 30,
        health: 18,
        maintainCost: 100,
        speed: 4,
        level: 1,
      };
    // Dwarf hero
    case HeroUnitType.HAMMER_LORD:
      return {
        id: HeroUnitType.HAMMER_LORD,
        name: 'Hammerlord',
        attack: 40,
        defense: 3,
        range: 2,
        rangeDamage: 40,
        health: 25,
        maintainCost: 100,
        speed: 4,
        level: 1,
      };
    // Elf hero
    case HeroUnitType.RANGER:
      return {
        id: HeroUnitType.RANGER,
        name: 'Ranger',
        attack: 30,
        defense: 3,
        range: 30,
        rangeDamage: 30,
        health: 18,
        maintainCost: 100,
        speed: 5,
        level: 1,
      };
    // Mage Heroes
    // Pyromancer - produce red mana
    case HeroUnitType.PYROMANCER:
      return {
        id: HeroUnitType.PYROMANCER,
        name: 'Pyromancer',
        attack: 30,
        defense: 3,
        range: 30,
        rangeDamage: 30,
        health: 18,
        maintainCost: 100,
        speed: 2,
        level: 1,
        mana: 1,
      };
    // Cleric - produce white mana
    case HeroUnitType.CLERIC:
      return {
        id: HeroUnitType.CLERIC,
        name: 'Cleric',
        attack: 25,
        defense: 5,
        range: 25,
        rangeDamage: 25,
        health: 20,
        maintainCost: 100,
        speed: 2,
        level: 1,
        mana: 1,
      };
    // Druid - produce green mana
    case HeroUnitType.DRUID:
      return {
        id: HeroUnitType.DRUID,
        name: 'Druid',
        attack: 20,
        defense: 4,
        range: 20,
        rangeDamage: 20,
        health: 22,
        maintainCost: 100,
        speed: 3,
        level: 1,
        mana: 1,
      };
    // Enchanter - produce blue mana
    case HeroUnitType.ENCHANTER:
      return {
        id: HeroUnitType.ENCHANTER,
        name: 'Enchanter',
        attack: 15,
        defense: 3,
        range: 35,
        rangeDamage: 15,
        health: 16,
        maintainCost: 100,
        speed: 2,
        level: 1,
        mana: 1,
      };
    // Necromancer - produce black mana
    case HeroUnitType.NECROMANCER:
      return {
        id: HeroUnitType.NECROMANCER,
        name: 'Necromancer',
        attack: 35,
        defense: 2,
        range: 25,
        rangeDamage: 35,
        health: 15,
        maintainCost: 100,
        speed: 2,
        level: 1,
        mana: 1,
      };
  }
};
