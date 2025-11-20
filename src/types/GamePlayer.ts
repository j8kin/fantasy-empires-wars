import { PlayerColorName } from './PlayerColors';
import { Alignment } from './Alignment';
import { HeroUnitType } from './Army';
import { Mana, ManaType } from './Mana';
import { HeroQuest } from './Quest';
import { EmpireTreasure } from './Treasures';
import { Diplomacy } from './Diplomacy';

export type PlayerRace = 'Human' | 'Elf' | 'Dwarf' | 'Orc' | 'Dark-elf' | 'Undead';

export interface PlayerProfile {
  id: string;
  name: string;
  alignment: Alignment;
  race: PlayerRace;
  type: HeroUnitType;
  level: number; // 1-32
  description: string;
  color: PlayerColorName; // base player color when game starts continues current color
}

export interface PlayerState {
  playerId: string; // link to PlayerProfile.id
  playerType: 'human' | 'computer';

  mana: Mana;
  vault: number;
  income: number;

  diplomacy: Diplomacy;
  empireTreasures: EmpireTreasure[];
  quests: HeroQuest[];
  color: PlayerColorName;

  getAlignment(): Alignment;
  getLevel(): number;
  getName(): string;
  getType(): HeroUnitType;
  getRace(): PlayerRace;

  getProfile(): PlayerProfile;
}

export const createPlayerState = (
  profile: PlayerProfile,
  playerType: 'human' | 'computer'
): PlayerState => {
  return {
    diplomacy: {},
    empireTreasures: [],
    income: 0,
    mana: {
      [ManaType.WHITE]: 0,
      [ManaType.BLACK]: 0,
      [ManaType.GREEN]: 0,
      [ManaType.BLUE]: 0,
      [ManaType.RED]: 0,
    },
    playerId: profile.id, // Fixed: was empty string before
    playerType: playerType,
    quests: [],
    vault: 0,
    color: profile.color,

    getAlignment: () => getPlayerProfile(profile.id).alignment,
    getLevel: () => getPlayerProfile(profile.id).level,
    getName: () => getPlayerProfile(profile.id).name,
    getType: () => getPlayerProfile(profile.id).type,
    getRace: () => getPlayerProfile(profile.id).race,
    getProfile: () => getPlayerProfile(profile.id),
  };
};

const getPlayerProfile = (playerId: string): PlayerProfile => {
  return PREDEFINED_PLAYERS.find((p) => p.id === playerId)!;
};
export const NO_PLAYER: PlayerProfile = {
  id: 'none',
  name: 'None',
  alignment: Alignment.NEUTRAL,
  race: 'Human',
  type: HeroUnitType.FIGHTER,
  level: 1,
  description: 'None',
  color: 'white',
};

export const PREDEFINED_PLAYERS: PlayerProfile[] = [
  {
    id: 'alaric',
    name: 'Alaric the Bold',
    alignment: Alignment.LAWFUL,
    race: 'Human',
    type: HeroUnitType.FIGHTER,
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
    type: HeroUnitType.NECROMANCER,
    level: 12,
    description: 'A powerful sorceress who seeks forbidden knowledge and commands dark magic.',
    color: 'purple',
  },
  {
    id: 'thorin',
    name: 'Thorin Ironforge',
    alignment: Alignment.NEUTRAL,
    race: 'Dwarf',
    type: HeroUnitType.HAMMER_LORD,
    level: 10,
    description: 'A dwarven smith-warrior who values craftsmanship and honor above all else.',
    color: 'orange',
  },
  {
    id: 'kaer',
    name: 'Kaer Dravane',
    alignment: Alignment.NEUTRAL,
    race: 'Undead',
    type: HeroUnitType.WARSMITH,
    level: 28,
    description: 'A tired soul of bone and will, seeking silence at the edge of eterni',
    color: 'burgundy',
  },
  {
    id: 'vex',
    name: 'Vex the Cunning',
    alignment: Alignment.LAWFUL,
    race: 'Elf',
    type: HeroUnitType.RANGER,
    level: 7,
    description: 'An elven ranger dedicated to protecting the ancient forests and their secrets.',
    color: 'green',
  },
  {
    id: 'grimjaw',
    name: 'Grimjaw the Destroyer',
    alignment: Alignment.CHAOTIC,
    race: 'Orc',
    type: HeroUnitType.OGR,
    level: 15,
    description: 'A brutal orc warlord who leads through fear and seeks to conquer all lands.',
    color: 'red',
  },
  {
    id: 'serena',
    name: 'Serena Lightbringer',
    alignment: Alignment.LAWFUL,
    race: 'Human',
    type: HeroUnitType.CLERIC,
    level: 11,
    description: 'A devout cleric who channels divine power to heal allies and smite evil.',
    color: 'yellow',
  },
  {
    id: 'kael',
    name: 'Kael Stormwind',
    alignment: Alignment.NEUTRAL,
    race: 'Human',
    type: HeroUnitType.ENCHANTER,
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
    type: HeroUnitType.RANGER,
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
    type: HeroUnitType.CLERIC,
    level: 13,
    description: 'A devoted priest who spreads hope and healing throughout the lands.',
    color: 'yellow',
  },
  {
    id: 'lydia',
    name: 'Lydia Moonwhisper',
    alignment: Alignment.NEUTRAL,
    race: 'Human',
    type: HeroUnitType.CLERIC,
    level: 9,
    description: 'A compassionate healer who tends to the wounded with divine grace.',
    color: 'purple',
  },
  {
    id: 'selene',
    name: 'Selene Moonwhisper',
    alignment: Alignment.CHAOTIC,
    race: 'Human',
    type: HeroUnitType.ENCHANTER,
    level: 9,
    description:
      'A manipulator of perception and dreams, weaving illusions that blur truth and deceit.',
    color: 'darkSlateGray',
  },
  {
    id: 'elderoak',
    name: 'Elderoak the Wise',
    alignment: Alignment.NEUTRAL,
    race: 'Elf',
    type: HeroUnitType.DRUID,
    level: 14,
    description: 'An ancient druid who maintains the balance between civilization and nature.',
    color: 'green',
  },
  {
    id: 'valdris',
    name: 'Valdris Bonecaller',
    alignment: Alignment.CHAOTIC,
    race: 'Undead',
    type: HeroUnitType.NECROMANCER,
    level: 16,
    description: 'A sinister necromancer who commands the undead and delves into forbidden arts.',
    color: 'purple',
  },
  {
    id: 'ignatius',
    name: 'Ignatius Flameforge',
    alignment: Alignment.NEUTRAL,
    race: 'Orc',
    type: HeroUnitType.PYROMANCER,
    level: 11,
    description: 'A master of fire magic who forges spells as skillfully as weapons.',
    color: 'orange',
  },
  {
    id: 'ember',
    name: 'Ember Fireheart',
    alignment: Alignment.CHAOTIC,
    race: 'Orc',
    type: HeroUnitType.PYROMANCER,
    level: 10,
    description: 'A fierce sorceress whose burning passion fuels her destructive fire magic.',
    color: 'red',
  },
];
