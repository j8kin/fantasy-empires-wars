import { Alignment } from './Alignment';
import { RegularUnitType } from './UnitType';
import { HeroUnit } from './HeroUnit';
import { getBaseUnitStats, getRecruitDuration } from './BaseUnit';

export enum UnitRank {
  REGULAR = 'regular',
  VETERAN = 'veteran',
  ELITE = 'elite',
}

export const isHero = (unit: Unit): boolean => typeof unit.level === 'number';

export interface RegularUnit {
  get id(): RegularUnitType;
  get level(): UnitRank;
  get count(): number;
  set count(newCount: number);
  // get BaseUnitStats(): BaseUnitStats;
  get attack(): number;
  get defense(): number;
  get range(): number | undefined;
  get rangeDamage(): number | undefined;
  get health(): number;
  get speed(): number;
  get alignment(): Alignment;
  get recruitCost(): number;
  get recruitDuration(): number;
  get maintainCost(): number;
  get description(): string;

  levelUp(): void;
}

export const createRegularUnit = (unitType: RegularUnitType): RegularUnit => {
  const baseUnitStats = getBaseUnitStats(unitType);
  let level = UnitRank.REGULAR;
  let count = getBaseUnitCount(unitType);
  return {
    get id(): RegularUnitType {
      return unitType;
    },
    get level(): UnitRank {
      return level;
    },
    get count(): number {
      return count;
    },
    set count(newCount) {
      count = newCount;
    },
    get attack(): number {
      return baseUnitStats.attack;
    },
    get defense(): number {
      return baseUnitStats.defense;
    },
    get range(): number | undefined {
      return baseUnitStats.range;
    },
    get rangeDamage(): number | undefined {
      return baseUnitStats.rangeDamage;
    },
    get health(): number {
      return baseUnitStats.health;
    },
    get speed(): number {
      return baseUnitStats.speed;
    },
    get alignment(): Alignment {
      return baseUnitStats.alignment;
    },
    get recruitCost(): number {
      return baseUnitStats.recruitCost;
    },
    get recruitDuration(): number {
      return getRecruitDuration(unitType);
    },
    get maintainCost(): number {
      return baseUnitStats.maintainCost;
    },
    get description(): string {
      return baseUnitStats.description;
    },
    levelUp() {
      if (level === UnitRank.REGULAR) {
        level = UnitRank.VETERAN;
      } else {
        level = UnitRank.ELITE;
      }
      // todo calculate new base RegularUnit Stats
    },
  };
};

export type Unit = HeroUnit | RegularUnit;

const getBaseUnitCount = (unitType: RegularUnitType): number => {
  switch (unitType) {
    case RegularUnitType.WARD_HANDS:
      return 30;
    case RegularUnitType.HALFLING:
      return 25;
    case RegularUnitType.BALLISTA:
    case RegularUnitType.CATAPULT:
      return 1;
    default:
      return 20;
  }
};

// export const getDefaultUnit = (unitType: UnitType): RegularUnit => {
//   switch (unitType) {
//     case RegularUnitType.WARD_HANDS:
//       return {
//         id: unitType,
//         attack: 5,
//         defense: 3,
//         health: 20,
//         speed: 2,
//         alignment: Alignment.NEUTRAL,
//         level: UnitRank.REGULAR,
//         count: 30,
//         recruitCost: 300,
//         maintainCost: 2,
//         description:
//           'Local hands risen in necessity, their resolve rough but unbroken against Orrivane’s growing dread.',
//       };
//     case RegularUnitType.WARRIOR:
//       return {
//         id: unitType,
//         attack: 8,
//         defense: 6,
//         health: 25,
//         speed: 2,
//         alignment: Alignment.NEUTRAL,
//         level: UnitRank.REGULAR,
//         count: 20,
//         recruitCost: 500,
//         maintainCost: 4,
//         description:
//           'Hardened veterans of countless skirmishes, these soldiers fight for gold, glory, or the fragile peace that follows both.',
//       };
//     case RegularUnitType.DWARF:
//       return {
//         id: unitType,
//         attack: 12,
//         defense: 20,
//         health: 40,
//         speed: 1,
//         alignment: Alignment.LAWFUL,
//         level: UnitRank.REGULAR,
//         count: 20,
//         recruitCost: 800,
//         maintainCost: 5,
//         description:
//           'Clad in runed steel and bound by oath, Dwarves hold the line like mountains given form—unyielding, proud, and slow to fall.',
//       };
//     case RegularUnitType.ORC:
//       return {
//         id: unitType,
//         attack: 10,
//         defense: 15,
//         health: 30,
//         speed: 2,
//         alignment: Alignment.CHAOTIC,
//         level: UnitRank.REGULAR,
//         count: 20,
//         recruitCost: 600,
//         maintainCost: 4.5,
//         description:
//           'Forged in chaos and fire, Orcs live for the clash of steel—each battle a hymn to their untamed hunger for conquest.',
//       };
//     case RegularUnitType.HALFLING:
//       return {
//         id: unitType,
//         attack: 6,
//         defense: 3,
//         range: 15,
//         rangeDamage: 8,
//         health: 15,
//         speed: 4,
//         alignment: Alignment.NEUTRAL,
//         level: UnitRank.REGULAR,
//         count: 25,
//         recruitCost: 700,
//         maintainCost: 3,
//         description:
//           'Small in stature, stubborn in spirit—halfling slingers pelt foes with stones and startling courage.',
//       };
//     case RegularUnitType.ELF:
//     case RegularUnitType.DARK_ELF:
//       return {
//         id: unitType,
//         attack: 15,
//         defense: 4,
//         range: 20,
//         rangeDamage: 15,
//         health: 20,
//         speed: 3,
//         alignment: unitType === RegularUnitType.ELF ? Alignment.LAWFUL : Alignment.CHAOTIC,
//         level: UnitRank.REGULAR,
//         count: 20,
//         recruitCost: 2500,
//         maintainCost: 5,
//         description:
//           unitType === RegularUnitType.ELF
//             ? 'Silent as moonlight and swift as wind through leaves, Elven archers strike before their foes even sense the bowstring’s whisper.'
//             : 'Born beneath shadowed groves, Dark Elves blend beauty with cruelty—their arrows carry both poison and pride.',
//       };
//     // War Machines
//     // Catapult do not damage anything only destroy buildings/walls
//     case RegularUnitType.BALLISTA:
//       return {
//         id: unitType,
//         attack: 0,
//         defense: 0,
//         range: 35,
//         rangeDamage: 25,
//         health: 15,
//         speed: 0,
//         alignment: Alignment.NEUTRAL,
//         level: UnitRank.REGULAR,
//         count: 1,
//         recruitCost: 1500,
//         maintainCost: 150,
//         description:
//           'Ancient engines of precision death, Ballistae pierce armor and arrogance alike with thunderous finality.',
//       };
//     case RegularUnitType.CATAPULT:
//       return {
//         id: unitType,
//         attack: 0,
//         defense: 0,
//         health: 30,
//         speed: 0,
//         alignment: Alignment.NEUTRAL,
//         level: UnitRank.REGULAR,
//         count: 1,
//         recruitCost: 1000,
//         maintainCost: 50,
//         description:
//           'Stone-flingers of ruin, Catapults reduce fortresses to dust and kings to memory—patient, implacable, and deaf to mercy.',
//       };
//     // HEROES
//     // Human warrior hero
//     case HeroUnitType.WARSMITH:
//     case HeroUnitType.FIGHTER:
//       return {
//         id: unitType,
//         name: 'Fighter',
//         attack: 30,
//         defense: 3,
//         range: 2,
//         rangeDamage: 30,
//         health: 18,
//         speed: 4,
//         level: 1,
//         alignment: unitType === HeroUnitType.WARSMITH ? Alignment.CHAOTIC : Alignment.LAWFUL,
//         artifacts: [],
//         recruitCost: 1500,
//         maintainCost: 100,
//         description:
//           unitType === HeroUnitType.FIGHTER
//             ? 'Champions of the common folk, Fighters carry the banners of law and honor into every battle, their courage as sharp as their blades.'
//             : 'Forged in the fires of rebellion, Warsmiths temper chaos into strategy—each strike a protest against tyranny and weakness.',
//       };
//     // Dwarf hero
//     case HeroUnitType.HAMMER_LORD:
//       return {
//         id: unitType,
//         name: 'Hammerlord',
//         attack: 40,
//         defense: 3,
//         range: 2,
//         rangeDamage: 40,
//         health: 25,
//         speed: 4,
//         level: 1,
//         alignment: Alignment.LAWFUL,
//         artifacts: [],
//         recruitCost: 1500,
//         maintainCost: 100,
//         description:
//           'Bearing hammers that have shattered both stone and legend, Hammerlords are dwarven paragons of strength and unyielding resolve.',
//       };
//     // Orc hero
//     case HeroUnitType.OGR:
//       return {
//         id: HeroUnitType.OGR,
//         name: 'Ogr',
//         attack: 40,
//         defense: 4,
//         range: 2,
//         rangeDamage: 45,
//         health: 30,
//         speed: 3,
//         level: 1,
//         alignment: Alignment.CHAOTIC,
//         artifacts: [],
//         recruitCost: 1500,
//         maintainCost: 100,
//         description:
//           'Once feared as destroyers, the Ogr champions now fight with grim purpose—seeking to silence all who dare wield the arcane.',
//       };
//     // Elf hero
//     case HeroUnitType.SHADOW_BLADE:
//     case HeroUnitType.RANGER:
//       return {
//         id: unitType,
//         name: 'Ranger',
//         attack: 30,
//         defense: 3,
//         range: 30,
//         rangeDamage: 30,
//         health: 18,
//         speed: 5,
//         level: 1,
//         alignment: unitType === HeroUnitType.RANGER ? Alignment.LAWFUL : Alignment.CHAOTIC,
//         artifacts: [],
//         recruitCost: 1500,
//         maintainCost: 100,
//         description:
//           unitType === HeroUnitType.RANGER
//             ? 'Keepers of forgotten groves, Rangers walk unseen between root and shadow, striking swiftly to preserve the wild balance of Orrivane.'
//             : 'A silent killer born of twilight, where loyalty is as thin as moonlight.',
//       };
//     // Mage Heroes
//     // Pyromancer - produce red mana
//     case HeroUnitType.PYROMANCER:
//       return {
//         id: unitType,
//         name: 'Pyromancer',
//         attack: 30,
//         defense: 3,
//         range: 30,
//         rangeDamage: 30,
//         health: 18,
//         speed: 2,
//         level: 1,
//         mana: 1,
//         alignment: Alignment.CHAOTIC,
//         artifacts: [],
//         recruitCost: 2500,
//         maintainCost: 100,
//         description:
//           'Born of embers and fury, Pyromancers command the flames of creation—each spell a hymn to passion and ruin.',
//       };
//     // Cleric - produce white mana
//     case HeroUnitType.CLERIC:
//       return {
//         id: unitType,
//         name: 'Cleric',
//         attack: 25,
//         defense: 5,
//         range: 2,
//         rangeDamage: 25,
//         health: 20,
//         speed: 2,
//         level: 1,
//         mana: 1,
//         alignment: Alignment.LAWFUL,
//         artifacts: [],
//         recruitCost: 2500,
//         maintainCost: 100,
//         description:
//           'Guided by celestial whispers, Clerics mend the wounds of body and spirit alike, their faith a shield against the growing dark.',
//       };
//     // Druid - produce green mana
//     case HeroUnitType.DRUID:
//       return {
//         id: unitType,
//         name: 'Druid',
//         attack: 20,
//         defense: 4,
//         range: 2,
//         rangeDamage: 20,
//         health: 22,
//         speed: 3,
//         level: 1,
//         mana: 1,
//         alignment: Alignment.LAWFUL,
//         artifacts: [],
//         recruitCost: 2500,
//         maintainCost: 100,
//         description:
//           'Bound to the heartbeat of the wild, Druids channel Orrivane’s living breath—healing, nurturing, and unleashing nature’s wrath.',
//       };
//     // Enchanter - produce blue mana
//     case HeroUnitType.ENCHANTER:
//       return {
//         id: unitType,
//         name: 'Enchanter',
//         attack: 15,
//         defense: 3,
//         range: 35,
//         rangeDamage: 15,
//         health: 16,
//         speed: 2,
//         level: 1,
//         mana: 1,
//         alignment: Alignment.NEUTRAL,
//         artifacts: [],
//         recruitCost: 2500,
//         maintainCost: 100,
//         description:
//           'Masters of unseen threads, Enchanters weave illusions and insight from pure thought, bending truth like light through a prism.',
//       };
//     // Necromancer - produce black mana
//     case HeroUnitType.NECROMANCER:
//       return {
//         id: unitType,
//         name: 'Necromancer',
//         attack: 35,
//         defense: 2,
//         range: 25,
//         rangeDamage: 35,
//         health: 15,
//         speed: 2,
//         level: 1,
//         mana: 1,
//         alignment: Alignment.CHAOTIC,
//         artifacts: [],
//         recruitCost: 2500,
//         maintainCost: 100,
//         description:
//           'Whisperers of death’s secrets, Necromancers blur the line between decay and command, binding restless souls to their grim will.',
//       };
//   }
// };
