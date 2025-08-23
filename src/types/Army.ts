export type UnitType = 'warrior' | 'archer' | 'mage' | 'balista' | 'catapult';

export interface Unit {
  id: string;
  type: UnitType;
  name: string;
  attack: number;
  defense: number;
  range?: number;
  rangeDamage?: number;
  health: number;
  goldCost: number;
  movement: number;
  level: number; // for non-hero units 1-regular, 2-veteran, 3-elite
  mana?: number; // how many mana produced per turn (only for heroes)
  hero: boolean;
}

export interface ArmyUnit {
  unit: Unit;
  count: number;
}

export interface Army {
  units: ArmyUnit[];
  totalCount: number;
}

export const UNIT_TYPES: { [key: string]: Unit } = {
  warrior: {
    id: 'warrior',
    type: 'warrior',
    name: 'Warrior',
    attack: 8,
    defense: 6,
    health: 25,
    goldCost: 40,
    movement: 2,
    level: 1,
    hero: false,
  },
  dwarf: {
    id: 'dwarf',
    type: 'warrior',
    name: 'Dwarf',
    attack: 12,
    defense: 20,
    health: 40,
    goldCost: 50,
    movement: 1,
    level: 1,
    hero: false,
  },
  orc: {
    id: 'orc',
    type: 'warrior',
    name: 'Orc',
    attack: 10,
    defense: 15,
    health: 30,
    goldCost: 45,
    movement: 2,
    level: 1,
    hero: false,
  },
  elf: {
    id: 'elf',
    type: 'archer',
    name: 'Elf',
    attack: 15,
    defense: 4,
    range: 20,
    rangeDamage: 15,
    health: 20,
    goldCost: 50,
    movement: 3,
    level: 1,
    hero: false,
  },
  darkelf: {
    id: 'darkelf',
    type: 'archer',
    name: 'DarkElf',
    attack: 15,
    defense: 4,
    range: 25,
    rangeDamage: 25,
    health: 20,
    goldCost: 70,
    movement: 3,
    level: 1,
    hero: false,
  },
  // War Machines
  balista: {
    id: 'balista',
    type: 'balista',
    name: 'Balista',
    attack: 0,
    defense: 0,
    range: 35,
    rangeDamage: 25,
    health: 15,
    goldCost: 150,
    movement: 0,
    level: 1,
    hero: false,
  },
  // Catapult do not damage anything only destroy buildings/walls
  catapult: {
    id: 'catapult',
    type: 'catapult',
    name: 'Catapult',
    attack: 0,
    defense: 0,
    health: 30,
    goldCost: 50,
    movement: 0,
    level: 1,
    hero: false,
  },
  // HEROES
  // Human warrior hero
  Fighter: {
    id: 'fighter',
    type: 'warrior',
    name: 'Fighter',
    attack: 30,
    defense: 3,
    range: 2,
    rangeDamage: 30,
    health: 18,
    goldCost: 100,
    movement: 4,
    level: 1,
    hero: true,
  },
  // Dwarf hero
  Hammerlord: {
    id: 'hummerlord',
    type: 'warrior',
    name: 'Hummerlord',
    attack: 40,
    defense: 3,
    range: 2,
    rangeDamage: 40,
    health: 25,
    goldCost: 100,
    movement: 4,
    level: 1,
    hero: true,
  },
  // Elf hero
  Ranger: {
    id: 'archer',
    type: 'archer',
    name: 'Ranger',
    attack: 30,
    defense: 3,
    range: 30,
    rangeDamage: 30,
    health: 18,
    goldCost: 100,
    movement: 5,
    level: 1,
    hero: true,
  },
  // Mage Heroes
  // Pyromancer - produce red mana
  Pyromancer: {
    id: 'pyromancer',
    type: 'mage',
    name: 'Pyromancer',
    attack: 30,
    defense: 3,
    range: 30,
    rangeDamage: 30,
    health: 18,
    goldCost: 100,
    movement: 2,
    level: 1,
    mana: 1,
    hero: true,
  },
  // Cleric - produce white mana
  Cleric: {
    id: 'cleric',
    type: 'mage',
    name: 'Cleric',
    attack: 25,
    defense: 5,
    range: 25,
    rangeDamage: 25,
    health: 20,
    goldCost: 100,
    movement: 2,
    level: 1,
    mana: 1,
    hero: true,
  },
  // Druid - produce green mana
  Druid: {
    id: 'druid',
    type: 'mage',
    name: 'Druid',
    attack: 20,
    defense: 4,
    range: 20,
    rangeDamage: 20,
    health: 22,
    goldCost: 100,
    movement: 3,
    level: 1,
    mana: 1,
    hero: true,
  },
  // Enchanter - produce blue mana
  Enchanter: {
    id: 'enchanter',
    type: 'mage',
    name: 'Enchanter',
    attack: 15,
    defense: 3,
    range: 35,
    rangeDamage: 15,
    health: 16,
    goldCost: 100,
    movement: 2,
    level: 1,
    mana: 1,
    hero: true,
  },
  // Necromancer - produce black mana
  Necromancer: {
    id: 'necromancer',
    type: 'mage',
    name: 'Necromancer',
    attack: 35,
    defense: 2,
    range: 25,
    rangeDamage: 35,
    health: 15,
    goldCost: 100,
    movement: 2,
    level: 1,
    mana: 1,
    hero: true,
  },
};
