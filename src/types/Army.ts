import { Artifact } from './Treasures';

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
  // non-mage heroes units
  FIGHTER = 'Fighter',
  HAMMER_LORD = 'Hammer-lord',
  RANGER = 'Ranger',
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

export interface HeroUnit extends BaseUnit {
  id: HeroUnitType;
  name: string; // uniq names
  level: number;
  artifacts: Artifact[]; // for now, it is planned to have only one artifact per hero
  mana?: number; // how many mana produced per turn, undefined for non-magic heroes
}

export enum UnitRank {
  REGULAR = 'regular',
  VETERAN = 'veteran',
  ELITE = 'elite',
}

export const isHeroType = (unitType: UnitType): boolean => isHero(getDefaultUnit(unitType));
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
  recruitCost: number;
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
        id: unitType,
        attack: 8,
        defense: 6,
        health: 25,
        recruitCost: 500,
        maintainCost: 4,
        speed: 2,
        level: UnitRank.REGULAR,
        count: 20,
      };
    case RegularUnitType.DWARF:
      return {
        id: unitType,
        attack: 12,
        defense: 20,
        health: 40,
        recruitCost: 800,
        maintainCost: 5,
        speed: 1,
        level: UnitRank.REGULAR,
        count: 20,
      };
    case RegularUnitType.ORC:
      return {
        id: unitType,
        attack: 10,
        defense: 15,
        health: 30,
        recruitCost: 600,
        maintainCost: 4.5,
        speed: 2,
        level: UnitRank.REGULAR,
        count: 20,
      };
    case RegularUnitType.ELF:
    case RegularUnitType.DARK_ELF:
      return {
        id: unitType,
        attack: 15,
        defense: 4,
        range: 20,
        rangeDamage: 15,
        health: 20,
        recruitCost: 2500,
        maintainCost: 5,
        speed: 3,
        level: UnitRank.REGULAR,
        count: 20,
      };
    // War Machines
    // Catapult do not damage anything only destroy buildings/walls
    case RegularUnitType.BALLISTA:
      return {
        id: unitType,
        attack: 0,
        defense: 0,
        range: 35,
        rangeDamage: 25,
        health: 15,
        recruitCost: 1500,
        maintainCost: 150,
        speed: 0,
        level: UnitRank.REGULAR,
        count: 1,
      };
    case RegularUnitType.CATAPULT:
      return {
        id: unitType,
        attack: 0,
        defense: 0,
        health: 30,
        recruitCost: 1000,
        maintainCost: 50,
        speed: 0,
        level: UnitRank.REGULAR,
        count: 1,
      };
    // HEROES
    // Human warrior hero

    case HeroUnitType.WARSMITH:
    case HeroUnitType.FIGHTER:
      return {
        id: unitType,
        name: 'Fighter',
        attack: 30,
        defense: 3,
        range: 2,
        rangeDamage: 30,
        health: 18,
        recruitCost: 1500,
        maintainCost: 100,
        speed: 4,
        level: 1,
        artifacts: [],
      };
    // Dwarf hero
    case HeroUnitType.HAMMER_LORD:
      return {
        id: unitType,
        name: 'Hammerlord',
        attack: 40,
        defense: 3,
        range: 2,
        rangeDamage: 40,
        health: 25,
        recruitCost: 1500,
        maintainCost: 100,
        speed: 4,
        level: 1,
        artifacts: [],
      };
    // Orc hero
    case HeroUnitType.OGR:
      return {
        id: HeroUnitType.OGR,
        name: 'Ogr',
        attack: 40,
        defense: 4,
        range: 2,
        rangeDamage: 45,
        health: 30,
        recruitCost: 1500,
        maintainCost: 100,
        speed: 3,
        level: 1,
        artifacts: [],
      };
    // Elf hero
    case HeroUnitType.RANGER:
      return {
        id: unitType,
        name: 'Ranger',
        attack: 30,
        defense: 3,
        range: 30,
        rangeDamage: 30,
        health: 18,
        recruitCost: 1500,
        maintainCost: 100,
        speed: 5,
        level: 1,
        artifacts: [],
      };
    // Mage Heroes
    // Pyromancer - produce red mana
    case HeroUnitType.PYROMANCER:
      return {
        id: unitType,
        name: 'Pyromancer',
        attack: 30,
        defense: 3,
        range: 30,
        rangeDamage: 30,
        health: 18,
        recruitCost: 2500,
        maintainCost: 100,
        speed: 2,
        level: 1,
        mana: 1,
        artifacts: [],
      };
    // Cleric - produce white mana
    case HeroUnitType.CLERIC:
      return {
        id: unitType,
        name: 'Cleric',
        attack: 25,
        defense: 5,
        range: 25,
        rangeDamage: 25,
        health: 20,
        recruitCost: 2500,
        maintainCost: 100,
        speed: 2,
        level: 1,
        mana: 1,
        artifacts: [],
      };
    // Druid - produce green mana
    case HeroUnitType.DRUID:
      return {
        id: unitType,
        name: 'Druid',
        attack: 20,
        defense: 4,
        range: 20,
        rangeDamage: 20,
        health: 22,
        recruitCost: 2500,
        maintainCost: 100,
        speed: 3,
        level: 1,
        mana: 1,
        artifacts: [],
      };
    // Enchanter - produce blue mana
    case HeroUnitType.ENCHANTER:
      return {
        id: unitType,
        name: 'Enchanter',
        attack: 15,
        defense: 3,
        range: 35,
        rangeDamage: 15,
        health: 16,
        recruitCost: 2500,
        maintainCost: 100,
        speed: 2,
        level: 1,
        mana: 1,
        artifacts: [],
      };
    // Necromancer - produce black mana
    case HeroUnitType.NECROMANCER:
      return {
        id: unitType,
        name: 'Necromancer',
        attack: 35,
        defense: 2,
        range: 25,
        rangeDamage: 35,
        health: 15,
        recruitCost: 2500,
        maintainCost: 100,
        speed: 2,
        level: 1,
        mana: 1,
        artifacts: [],
      };
  }
};
