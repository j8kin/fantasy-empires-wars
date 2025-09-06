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
import { PLAYER_COLOR_VALUES } from './PlayerColors';

export type PlayerClass = 'lawful' | 'neutral' | 'chaotic';

export interface GamePlayer {
  id: string;
  name: string;
  class: PlayerClass;
  level: number; // 1-32
  description: string;
  avatar?: string; // path to avatar image
  defaultColor: string;
}

export const PREDEFINED_PLAYERS: GamePlayer[] = [
  {
    id: 'alaric',
    name: 'Alaric the Bold',
    class: 'lawful',
    level: 8,
    description:
      'A noble paladin who has sworn to protect the innocent and uphold justice across the realm.',
    avatar: fighterAvatar,
    defaultColor: '#4A90E2',
  },
  {
    id: 'morgana',
    name: 'Morgana Shadowweaver',
    class: 'chaotic',
    level: 12,
    description: 'A powerful sorceress who seeks forbidden knowledge and commands dark magic.',
    avatar: necromancerAvatar,
    defaultColor: '#8B4A9C',
  },
  {
    id: 'thorin',
    name: 'Thorin Ironforge',
    class: 'neutral',
    level: 10,
    description: 'A dwarven smith-warrior who values craftsmanship and honor above all else.',
    avatar: dwarfAvatar,
    defaultColor: '#E67E22',
  },
  {
    id: 'vex',
    name: 'Vex the Cunning',
    class: 'lawful',
    level: 7,
    description: 'An elven ranger dedicated to protecting the ancient forests and their secrets.',
    avatar: elfAvatar,
    defaultColor: '#27AE60',
  },
  {
    id: 'grimjaw',
    name: 'Grimjaw the Destroyer',
    class: 'chaotic',
    level: 15,
    description: 'A brutal orc warlord who leads through fear and seeks to conquer all lands.',
    avatar: orcAvatar,
    defaultColor: '#C0392B',
  },
  {
    id: 'serena',
    name: 'Serena Lightbringer',
    class: 'lawful',
    level: 11,
    description: 'A devout cleric who channels divine power to heal allies and smite evil.',
    avatar: clericAvatar,
    defaultColor: '#F1C40F',
  },
  {
    id: 'kael',
    name: 'Kael Stormwind',
    class: 'neutral',
    level: 9,
    description:
      'A wandering mage who seeks to master all schools of magic through experimentation.',
    avatar: enchanterAvatar,
    defaultColor: '#4A90E2',
  },
  {
    id: 'elara',
    name: 'Elara Starshot',
    class: 'chaotic',
    level: 6,
    description:
      'A sly rogue who uses wit and stealth to achieve goals through any means necessary.',
    avatar: rogueAvatar,
    defaultColor: '#95A5A6',
  },
  {
    id: 'marcus',
    name: 'Marcus the Divine',
    class: 'lawful',
    level: 13,
    description: 'A devoted priest who spreads hope and healing throughout the lands.',
    avatar: clericMaleAvatar,
    defaultColor: '#F1C40F',
  },
  {
    id: 'lydia',
    name: 'Lydia Moonwhisper',
    class: 'lawful',
    level: 9,
    description: 'A compassionate healer who tends to the wounded with divine grace.',
    avatar: cleric2Avatar,
    defaultColor: '#8B4A9C',
  },
  {
    id: 'elderoak',
    name: 'Elderoak the Wise',
    class: 'neutral',
    level: 14,
    description: 'An ancient druid who maintains the balance between civilization and nature.',
    avatar: druidAvatar,
    defaultColor: '#27AE60',
  },
  {
    id: 'valdris',
    name: 'Valdris Bonecaller',
    class: 'chaotic',
    level: 16,
    description: 'A sinister necromancer who commands the undead and delves into forbidden arts.',
    avatar: necromancerMaleAvatar,
    defaultColor: '#2F4F4F',
  },
  {
    id: 'ignatius',
    name: 'Ignatius Flameforge',
    class: 'neutral',
    level: 11,
    description: 'A master of fire magic who forges spells as skillfully as weapons.',
    avatar: pyromancerAvatar,
    defaultColor: '#E67E22',
  },
  {
    id: 'ember',
    name: 'Ember Fireheart',
    class: 'chaotic',
    level: 10,
    description: 'A fierce sorceress whose burning passion fuels her destructive fire magic.',
    avatar: pyromancerFemaleAvatar,
    defaultColor: '#C0392B',
  },
];

// Re-export for backward compatibility
export { PLAYER_COLOR_VALUES as PLAYER_COLORS } from './PlayerColors';
