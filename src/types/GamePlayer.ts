import fighterAvatar from '../assets/avatars/fighter.png';
import necromancerAvatar from '../assets/avatars/necromancerW.png';
import dwarfAvatar from '../assets/avatars/dwarf.png';
import elfAvatar from '../assets/avatars/elf.png';
import rogueAvatar from '../assets/avatars/rodueW.png';
import orcAvatar from '../assets/avatars/orc.png';
import clericAvatar from '../assets/avatars/clericW.png';
import enchanterAvatar from '../assets/avatars/enchanter.png';
import clericMaleAvatar from '../assets/avatars/cleric.png';
import cleric2Avatar from '../assets/avatars/clericW2.png';
import druidAvatar from '../assets/avatars/druid.png';
import necromancerMaleAvatar from '../assets/avatars/necromancer.png';
import pyromancerAvatar from '../assets/avatars/pyromancer.png';
import pyromancerFemaleAvatar from '../assets/avatars/pyromancerW.png';
import { PlayerColorName } from './PlayerColors';
import { Alignment } from './Alignment';

export type PlayerRace = 'Human' | 'Elf' | 'Dwarf' | 'Orc' | 'Dark-elf' | 'Undead';

export interface GamePlayer {
  id: string;
  name: string;
  alignment: Alignment;
  race: PlayerRace;
  level: number; // 1-32
  description: string;
  avatar?: string; // path to avatar image
  color: PlayerColorName;
}

export const NO_PLAYER: GamePlayer = {
  id: 'none',
  name: 'None',
  alignment: Alignment.NEUTRAL,
  race: 'Human',
  level: 1,
  description: 'None',
  avatar: undefined,
  color: 'gray',
};

export const PREDEFINED_PLAYERS: GamePlayer[] = [
  {
    id: 'alaric',
    name: 'Alaric the Bold',
    alignment: Alignment.LAWFUL,
    race: 'Human',
    level: 8,
    description:
      'A noble paladin who has sworn to protect the innocent and uphold justice across the realm.',
    avatar: fighterAvatar,
    color: 'blue',
  },
  {
    id: 'morgana',
    name: 'Morgana Shadowweaver',
    alignment: Alignment.CHAOTIC,
    race: 'Undead',
    level: 12,
    description: 'A powerful sorceress who seeks forbidden knowledge and commands dark magic.',
    avatar: necromancerAvatar,
    color: 'purple',
  },
  {
    id: 'thorin',
    name: 'Thorin Ironforge',
    alignment: Alignment.NEUTRAL,
    race: 'Dwarf',
    level: 10,
    description: 'A dwarven smith-warrior who values craftsmanship and honor above all else.',
    avatar: dwarfAvatar,
    color: 'orange',
  },
  {
    id: 'vex',
    name: 'Vex the Cunning',
    alignment: Alignment.LAWFUL,
    race: 'Elf',
    level: 7,
    description: 'An elven ranger dedicated to protecting the ancient forests and their secrets.',
    avatar: elfAvatar,
    color: 'green',
  },
  {
    id: 'grimjaw',
    name: 'Grimjaw the Destroyer',
    alignment: Alignment.CHAOTIC,
    race: 'Orc',
    level: 15,
    description: 'A brutal orc warlord who leads through fear and seeks to conquer all lands.',
    avatar: orcAvatar,
    color: 'red',
  },
  {
    id: 'serena',
    name: 'Serena Lightbringer',
    alignment: Alignment.LAWFUL,
    race: 'Human',
    level: 11,
    description: 'A devout cleric who channels divine power to heal allies and smite evil.',
    avatar: clericAvatar,
    color: 'yellow',
  },
  {
    id: 'kael',
    name: 'Kael Stormwind',
    alignment: Alignment.NEUTRAL,
    race: 'Human',
    level: 9,
    description:
      'A wandering mage who seeks to master all schools of magic through experimentation.',
    avatar: enchanterAvatar,
    color: 'blue',
  },
  {
    id: 'elara',
    name: 'Elara Starshot',
    alignment: Alignment.CHAOTIC,
    race: 'Dark-elf',
    level: 6,
    description:
      'A sly rogue who uses wit and stealth to achieve goals through any means necessary.',
    avatar: rogueAvatar,
    color: 'gray',
  },
  {
    id: 'marcus',
    name: 'Marcus the Divine',
    alignment: Alignment.LAWFUL,
    race: 'Human',
    level: 13,
    description: 'A devoted priest who spreads hope and healing throughout the lands.',
    avatar: clericMaleAvatar,
    color: 'yellow',
  },
  {
    id: 'lydia',
    name: 'Lydia Moonwhisper',
    alignment: Alignment.NEUTRAL,
    race: 'Human',
    level: 9,
    description: 'A compassionate healer who tends to the wounded with divine grace.',
    avatar: cleric2Avatar,
    color: 'purple',
  },
  {
    id: 'elderoak',
    name: 'Elderoak the Wise',
    alignment: Alignment.NEUTRAL,
    race: 'Elf',
    level: 14,
    description: 'An ancient druid who maintains the balance between civilization and nature.',
    avatar: druidAvatar,
    color: 'green',
  },
  {
    id: 'valdris',
    name: 'Valdris Bonecaller',
    alignment: Alignment.CHAOTIC,
    race: 'Undead',
    level: 16,
    description: 'A sinister necromancer who commands the undead and delves into forbidden arts.',
    avatar: necromancerMaleAvatar,
    color: 'purple',
  },
  {
    id: 'ignatius',
    name: 'Ignatius Flameforge',
    alignment: Alignment.NEUTRAL,
    race: 'Orc',
    level: 11,
    description: 'A master of fire magic who forges spells as skillfully as weapons.',
    avatar: pyromancerAvatar,
    color: 'orange',
  },
  {
    id: 'ember',
    name: 'Ember Fireheart',
    alignment: Alignment.CHAOTIC,
    race: 'Orc',
    level: 10,
    description: 'A fierce sorceress whose burning passion fuels her destructive fire magic.',
    avatar: pyromancerFemaleAvatar,
    color: 'red',
  },
];
