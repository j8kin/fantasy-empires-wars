import { PlayerColorName } from './PlayerColors';
import { Alignment } from './Alignment';
import { UnitType } from './Army';
import { Mana } from './Mana';

export type PlayerRace = 'Human' | 'Elf' | 'Dwarf' | 'Orc' | 'Dark-elf' | 'Undead';

export enum DiplomacyStatus {
  NO_TREATY = 'No Treaty',
  PEACE = 'Peace',
  WAR = 'War',
  ALLIANCE = 'Alliance',
}

export type Diplomacy = Record<string, DiplomacyStatus>;

export interface PlayerInfo {
  id: string;
  name: string;
  alignment: Alignment;
  race: PlayerRace;
  type: UnitType;
  level: number; // 1-32
  description: string;
  color: PlayerColorName; // base player color when game starts continues current color
}

export interface GamePlayer extends PlayerInfo {
  mana: Mana;
  money: number;
  income: number;
  diplomacy: Diplomacy;
  playerType: 'human' | 'computer';
}

export const NO_PLAYER: PlayerInfo = {
  id: 'none',
  name: 'None',
  alignment: Alignment.NEUTRAL,
  race: 'Human',
  type: UnitType.WARRIOR,
  level: 1,
  description: 'None',
  color: 'white',
};

export const PREDEFINED_PLAYERS: PlayerInfo[] = [
  {
    id: 'alaric',
    name: 'Alaric the Bold',
    alignment: Alignment.LAWFUL,
    race: 'Human',
    type: UnitType.FIGHTER,
    level: 8,
    description:
      'A noble paladin who has sworn to protect the innocent and uphold justice across the realm.',
    color: 'blue',
  },
  {
    id: 'morgana',
    name: 'Morgana Shadowweaver',
    alignment: Alignment.CHAOTIC,
    race: 'Undead',
    type: UnitType.NECROMANCER,
    level: 12,
    description: 'A powerful sorceress who seeks forbidden knowledge and commands dark magic.',
    color: 'purple',
  },
  {
    id: 'thorin',
    name: 'Thorin Ironforge',
    alignment: Alignment.NEUTRAL,
    race: 'Dwarf',
    type: UnitType.HAMMERLORD,
    level: 10,
    description: 'A dwarven smith-warrior who values craftsmanship and honor above all else.',
    color: 'orange',
  },
  {
    id: 'vex',
    name: 'Vex the Cunning',
    alignment: Alignment.LAWFUL,
    race: 'Elf',
    type: UnitType.RANGER,
    level: 7,
    description: 'An elven ranger dedicated to protecting the ancient forests and their secrets.',
    color: 'green',
  },
  {
    id: 'grimjaw',
    name: 'Grimjaw the Destroyer',
    alignment: Alignment.CHAOTIC,
    race: 'Orc',
    type: UnitType.FIGHTER, // todo add Unit for ORC HERO
    level: 15,
    description: 'A brutal orc warlord who leads through fear and seeks to conquer all lands.',
    color: 'red',
  },
  {
    id: 'serena',
    name: 'Serena Lightbringer',
    alignment: Alignment.LAWFUL,
    race: 'Human',
    type: UnitType.CLERIC,
    level: 11,
    description: 'A devout cleric who channels divine power to heal allies and smite evil.',
    color: 'yellow',
  },
  {
    id: 'kael',
    name: 'Kael Stormwind',
    alignment: Alignment.NEUTRAL,
    race: 'Human',
    type: UnitType.ENCHANTER,
    level: 9,
    description:
      'A wandering mage who seeks to master all schools of magic through experimentation.',
    color: 'blue',
  },
  {
    id: 'elara',
    name: 'Elara Starshot',
    alignment: Alignment.CHAOTIC,
    race: 'Dark-elf',
    type: UnitType.RANGER,
    level: 6,
    description:
      'A sly rogue who uses wit and stealth to achieve goals through any means necessary.',
    color: 'gray',
  },
  {
    id: 'marcus',
    name: 'Marcus the Divine',
    alignment: Alignment.LAWFUL,
    race: 'Human',
    type: UnitType.CLERIC,
    level: 13,
    description: 'A devoted priest who spreads hope and healing throughout the lands.',
    color: 'yellow',
  },
  {
    id: 'lydia',
    name: 'Lydia Moonwhisper',
    alignment: Alignment.NEUTRAL,
    race: 'Human',
    type: UnitType.CLERIC,
    level: 9,
    description: 'A compassionate healer who tends to the wounded with divine grace.',
    color: 'purple',
  },
  {
    id: 'elderoak',
    name: 'Elderoak the Wise',
    alignment: Alignment.NEUTRAL,
    race: 'Elf',
    type: UnitType.DRUID,
    level: 14,
    description: 'An ancient druid who maintains the balance between civilization and nature.',
    color: 'green',
  },
  {
    id: 'valdris',
    name: 'Valdris Bonecaller',
    alignment: Alignment.CHAOTIC,
    race: 'Undead',
    type: UnitType.NECROMANCER,
    level: 16,
    description: 'A sinister necromancer who commands the undead and delves into forbidden arts.',
    color: 'purple',
  },
  {
    id: 'ignatius',
    name: 'Ignatius Flameforge',
    alignment: Alignment.NEUTRAL,
    race: 'Orc',
    type: UnitType.PYROMANCER,
    level: 11,
    description: 'A master of fire magic who forges spells as skillfully as weapons.',
    color: 'orange',
  },
  {
    id: 'ember',
    name: 'Ember Fireheart',
    alignment: Alignment.CHAOTIC,
    race: 'Orc',
    type: UnitType.PYROMANCER,
    level: 10,
    description: 'A fierce sorceress whose burning passion fuels her destructive fire magic.',
    color: 'red',
  },
];
