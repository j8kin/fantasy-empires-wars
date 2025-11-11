import { Artifact } from './Treasures';
import { Alignment } from './Alignment';
import { Movements } from './Movements';

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

export const isMage = (unitType: UnitType): boolean => {
  return (
    unitType === HeroUnitType.PYROMANCER ||
    unitType === HeroUnitType.DRUID ||
    unitType === HeroUnitType.ENCHANTER ||
    unitType === HeroUnitType.CLERIC ||
    unitType === HeroUnitType.NECROMANCER
  );
};

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
  speed: number;
  alignment: Alignment;
  recruitCost: number;
  maintainCost: number;
  description: string;
}

export type Army = {
  units: Unit[];
  movements?: Movements;
  isMoving: boolean; // true: units are moving and will be in "destination" land at the beginning of the next turn
};

export type Armies = Army[];

export const getDefaultUnit = (unitType: UnitType): Unit => {
  switch (unitType) {
    case RegularUnitType.WARRIOR:
      return {
        id: unitType,
        attack: 8,
        defense: 6,
        health: 25,
        speed: 2,
        alignment: Alignment.NEUTRAL,
        level: UnitRank.REGULAR,
        count: 20,
        recruitCost: 500,
        maintainCost: 4,
        description:
          'Hardened veterans of countless skirmishes, these soldiers fight for gold, glory, or the fragile peace that follows both.',
      };
    case RegularUnitType.DWARF:
      return {
        id: unitType,
        attack: 12,
        defense: 20,
        health: 40,
        speed: 1,
        alignment: Alignment.LAWFUL,
        level: UnitRank.REGULAR,
        count: 20,
        recruitCost: 800,
        maintainCost: 5,
        description:
          'Clad in runed steel and bound by oath, Dwarves hold the line like mountains given form—unyielding, proud, and slow to fall.',
      };
    case RegularUnitType.ORC:
      return {
        id: unitType,
        attack: 10,
        defense: 15,
        health: 30,
        speed: 2,
        alignment: Alignment.CHAOTIC,
        level: UnitRank.REGULAR,
        count: 20,
        recruitCost: 600,
        maintainCost: 4.5,
        description:
          'Forged in chaos and fire, Orcs live for the clash of steel—each battle a hymn to their untamed hunger for conquest.',
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
        speed: 3,
        alignment: unitType === RegularUnitType.ELF ? Alignment.LAWFUL : Alignment.CHAOTIC,
        level: UnitRank.REGULAR,
        count: 20,
        recruitCost: 2500,
        maintainCost: 5,
        description:
          unitType === RegularUnitType.ELF
            ? 'Silent as moonlight and swift as wind through leaves, Elven archers strike before their foes even sense the bowstring’s whisper.'
            : 'Born beneath shadowed groves, Dark Elves blend beauty with cruelty—their arrows carry both poison and pride.',
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
        speed: 0,
        alignment: Alignment.NEUTRAL,
        level: UnitRank.REGULAR,
        count: 1,
        recruitCost: 1500,
        maintainCost: 150,
        description:
          'Ancient engines of precision death, Ballistae pierce armor and arrogance alike with thunderous finality.',
      };
    case RegularUnitType.CATAPULT:
      return {
        id: unitType,
        attack: 0,
        defense: 0,
        health: 30,
        speed: 0,
        alignment: Alignment.NEUTRAL,
        level: UnitRank.REGULAR,
        count: 1,
        recruitCost: 1000,
        maintainCost: 50,
        description:
          'Stone-flingers of ruin, Catapults reduce fortresses to dust and kings to memory—patient, implacable, and deaf to mercy.',
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
        speed: 4,
        level: 1,
        alignment: unitType === HeroUnitType.WARSMITH ? Alignment.CHAOTIC : Alignment.LAWFUL,
        artifacts: [],
        recruitCost: 1500,
        maintainCost: 100,
        description:
          unitType === HeroUnitType.FIGHTER
            ? 'Champions of the common folk, Fighters carry the banners of law and honor into every battle, their courage as sharp as their blades.'
            : 'Forged in the fires of rebellion, Warsmiths temper chaos into strategy—each strike a protest against tyranny and weakness.',
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
        speed: 4,
        level: 1,
        alignment: Alignment.LAWFUL,
        artifacts: [],
        recruitCost: 1500,
        maintainCost: 100,
        description:
          'Bearing hammers that have shattered both stone and legend, Hammerlords are dwarven paragons of strength and unyielding resolve.',
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
        speed: 3,
        level: 1,
        alignment: Alignment.CHAOTIC,
        artifacts: [],
        recruitCost: 1500,
        maintainCost: 100,
        description:
          'Once feared as destroyers, the Ogr champions now fight with grim purpose—seeking to silence all who dare wield the arcane.',
      };
    // Elf hero
    case HeroUnitType.SHADOW_BLADE:
    case HeroUnitType.RANGER:
      return {
        id: unitType,
        name: 'Ranger',
        attack: 30,
        defense: 3,
        range: 30,
        rangeDamage: 30,
        health: 18,
        speed: 5,
        level: 1,
        alignment: unitType === HeroUnitType.RANGER ? Alignment.LAWFUL : Alignment.CHAOTIC,
        artifacts: [],
        recruitCost: 1500,
        maintainCost: 100,
        description:
          unitType === HeroUnitType.RANGER
            ? 'Keepers of forgotten groves, Rangers walk unseen between root and shadow, striking swiftly to preserve the wild balance of Orrivane.'
            : 'A silent killer born of twilight, where loyalty is as thin as moonlight.',
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
        speed: 2,
        level: 1,
        mana: 1,
        alignment: Alignment.CHAOTIC,
        artifacts: [],
        recruitCost: 2500,
        maintainCost: 100,
        description:
          'Born of embers and fury, Pyromancers command the flames of creation—each spell a hymn to passion and ruin.',
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
        speed: 2,
        level: 1,
        mana: 1,
        alignment: Alignment.LAWFUL,
        artifacts: [],
        recruitCost: 2500,
        maintainCost: 100,
        description:
          'Guided by celestial whispers, Clerics mend the wounds of body and spirit alike, their faith a shield against the growing dark.',
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
        speed: 3,
        level: 1,
        mana: 1,
        alignment: Alignment.LAWFUL,
        artifacts: [],
        recruitCost: 2500,
        maintainCost: 100,
        description:
          'Bound to the heartbeat of the wild, Druids channel Orrivane’s living breath—healing, nurturing, and unleashing nature’s wrath.',
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
        speed: 2,
        level: 1,
        mana: 1,
        alignment: Alignment.NEUTRAL,
        artifacts: [],
        recruitCost: 2500,
        maintainCost: 100,
        description:
          'Masters of unseen threads, Enchanters weave illusions and insight from pure thought, bending truth like light through a prism.',
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
        speed: 2,
        level: 1,
        mana: 1,
        alignment: Alignment.CHAOTIC,
        artifacts: [],
        recruitCost: 2500,
        maintainCost: 100,
        description:
          'Whisperers of death’s secrets, Necromancers blur the line between decay and command, binding restless souls to their grim will.',
      };
  }
};
