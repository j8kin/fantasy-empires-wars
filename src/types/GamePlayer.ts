import fighterAvatar from '../assets/avatars/fighter.png';
import necromancerAvatar from '../assets/avatars/necromancer.png';
import dwarfAvatar from '../assets/avatars/dwarf.png';
import elfAvatar from '../assets/avatars/elf.png';
import orcAvatar from '../assets/avatars/orc.png';
import clericAvatar from '../assets/avatars/cleric.png';
import enchanterAvatar from '../assets/avatars/enchanter.png';

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
    id: 'elara',
    name: 'Elara Starshot',
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
    defaultColor: '#3498DB',
  },
  {
    id: 'vex',
    name: 'Vex the Cunning',
    class: 'chaotic',
    level: 6,
    description:
      'A sly rogue who uses wit and stealth to achieve goals through any means necessary.',
    avatar: elfAvatar,
    defaultColor: '#95A5A6',
  },
];

export const PLAYER_COLORS = [
  '#4A90E2', // Blue
  '#E67E22', // Orange
  '#27AE60', // Green
  '#C0392B', // Red
  '#8B4A9C', // Purple
  '#F1C40F', // Yellow
  '#3498DB', // Light Blue
  '#95A5A6', // Gray
];
