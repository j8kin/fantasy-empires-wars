export enum UnitType {
  WARRIOR = 'warrior',
  DWARF = 'dwarf',
  ORC = 'orc',
  ELF = 'elf',
  DARKELF = 'darkelf',
  BALISTA = 'balista',
  CATAPULT = 'catapult',
  FIGHTER = 'fighter',
  HAMMERLORD = 'hammerlord',
  RANGER = 'ranger',
  PYROMANCER = 'pyromancer',
  CLERIC = 'cleric',
  DRUID = 'druid',
  ENCHANTER = 'Enchanter',
  NECROMANCER = 'Necromancer',
}

export interface Unit {
  id: string;
  name: string;
  attack: number;
  defense: number;
  range?: number;
  rangeDamage?: number;
  health: number;
  maintainCost: number;
  movement: number;
  level: number; // for non-hero units 1-regular, 2-veteran, 3-elite
  mana?: number; // how many mana produced per turn (only for heroes)
  hero: boolean;
}

export type ArmyUnit = {
  unit: Unit;
  quantity: number;
  moveInTurn: number; // e.g., 0 = army movement complete, 1+ how many movements need to reach destination
};

export type Army = ArmyUnit[];

export const getUnit = (unitType: UnitType): Unit => {
  switch (unitType) {
    case UnitType.WARRIOR:
      return {
        id: 'warrior',
        name: 'Warrior',
        attack: 8,
        defense: 6,
        health: 25,
        maintainCost: 4,
        movement: 2,
        level: 1,
        hero: false,
      };
    case UnitType.DWARF:
      return {
        id: 'dwarf',
        name: 'Dwarf',
        attack: 12,
        defense: 20,
        health: 40,
        maintainCost: 5,
        movement: 1,
        level: 1,
        hero: false,
      };
    case UnitType.ORC:
      return {
        id: 'orc',
        name: 'Orc',
        attack: 10,
        defense: 15,
        health: 30,
        maintainCost: 4.5,
        movement: 2,
        level: 1,
        hero: false,
      };
    case UnitType.ELF:
      return {
        id: 'elf',
        name: 'Elf',
        attack: 15,
        defense: 4,
        range: 20,
        rangeDamage: 15,
        health: 20,
        maintainCost: 5,
        movement: 3,
        level: 1,
        hero: false,
      };
    case UnitType.DARKELF:
      return {
        id: 'darkelf',
        name: 'DarkElf',
        attack: 15,
        defense: 4,
        range: 25,
        rangeDamage: 25,
        health: 20,
        maintainCost: 5,
        movement: 3,
        level: 1,
        hero: false,
      };
    // War Machines
    // Catapult do not damage anything only destroy buildings/walls
    case UnitType.BALISTA:
      return {
        id: 'balista',
        name: 'Balista',
        attack: 0,
        defense: 0,
        range: 35,
        rangeDamage: 25,
        health: 15,
        maintainCost: 150,
        movement: 0,
        level: 1,
        hero: false,
      };
    case UnitType.CATAPULT:
      return {
        id: 'catapult',
        name: 'Catapult',
        attack: 0,
        defense: 0,
        health: 30,
        maintainCost: 50,
        movement: 0,
        level: 1,
        hero: false,
      };
    // HEROES
    // Human warrior hero

    case UnitType.FIGHTER:
      return {
        id: 'fighter',
        name: 'Fighter',
        attack: 30,
        defense: 3,
        range: 2,
        rangeDamage: 30,
        health: 18,
        maintainCost: 100,
        movement: 4,
        level: 1,
        hero: true,
      };
    // Dwarf hero
    case UnitType.HAMMERLORD:
      return {
        id: 'hammerlord',
        name: 'Hammerlord',
        attack: 40,
        defense: 3,
        range: 2,
        rangeDamage: 40,
        health: 25,
        maintainCost: 100,
        movement: 4,
        level: 1,
        hero: true,
      };
    // Elf hero
    case UnitType.RANGER:
      return {
        id: 'ranger',
        name: 'Ranger',
        attack: 30,
        defense: 3,
        range: 30,
        rangeDamage: 30,
        health: 18,
        maintainCost: 100,
        movement: 5,
        level: 1,
        hero: true,
      };
    // Mage Heroes
    // Pyromancer - produce red mana
    case UnitType.PYROMANCER:
      return {
        id: 'pyromancer',
        name: 'Pyromancer',
        attack: 30,
        defense: 3,
        range: 30,
        rangeDamage: 30,
        health: 18,
        maintainCost: 100,
        movement: 2,
        level: 1,
        mana: 1,
        hero: true,
      };
    // Cleric - produce white mana
    case UnitType.CLERIC:
      return {
        id: 'cleric',
        name: 'Cleric',
        attack: 25,
        defense: 5,
        range: 25,
        rangeDamage: 25,
        health: 20,
        maintainCost: 100,
        movement: 2,
        level: 1,
        mana: 1,
        hero: true,
      };
    // Druid - produce green mana
    case UnitType.DRUID:
      return {
        id: 'druid',
        name: 'Druid',
        attack: 20,
        defense: 4,
        range: 20,
        rangeDamage: 20,
        health: 22,
        maintainCost: 100,
        movement: 3,
        level: 1,
        mana: 1,
        hero: true,
      };
    // Enchanter - produce blue mana
    case UnitType.ENCHANTER:
      return {
        id: 'enchanter',
        name: 'Enchanter',
        attack: 15,
        defense: 3,
        range: 35,
        rangeDamage: 15,
        health: 16,
        maintainCost: 100,
        movement: 2,
        level: 1,
        mana: 1,
        hero: true,
      };
    // Necromancer - produce black mana
    case UnitType.NECROMANCER:
      return {
        id: 'necromancer',
        name: 'Necromancer',
        attack: 35,
        defense: 2,
        range: 25,
        rangeDamage: 35,
        health: 15,
        maintainCost: 100,
        movement: 2,
        level: 1,
        mana: 1,
        hero: true,
      };
  }
};
