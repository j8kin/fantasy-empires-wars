import { LandPosition } from '../state/LandState';

import { HeroUnit } from './Army';

export type QuestType =
  | 'The Echoing Ruins'
  | 'The Whispering Grove'
  | 'The Abyssal Crypt'
  | 'The Shattered Sky';

export interface Quest {
  id: QuestType;
  level: number;
  length: number;
  description: string;
}

export interface HeroQuest {
  quest: Quest;
  hero: HeroUnit;
  land: LandPosition;
  remainTurnsInQuest: number;
}

const ALL_QUESTS: Quest[] = [
  {
    id: 'The Echoing Ruins',
    level: 1,
    length: 4,
    description:
      'Whispers of lost ages linger among crumbling halls where the past refuses to rest.',
  },
  {
    id: 'The Whispering Grove',
    level: 2,
    length: 5,
    description: 'Roots drink old blood as the wind recalls names the forest swore to forget.',
  },
  {
    id: 'The Abyssal Crypt',
    level: 3,
    length: 6,
    description:
      'Shadows coil beneath the earth, guarding the silence of those who should not wake.',
  },
  {
    id: 'The Shattered Sky',
    level: 4,
    length: 7,
    description:
      'The heavens cracked once, and from the wound still seeps the color of forgotten light.',
  },
];

export const getQuestType = (questLevel: number): QuestType => {
  return ALL_QUESTS.find((q) => q.level === questLevel)?.id || ALL_QUESTS[0].id;
};

export const getQuest = (questType: QuestType): Quest =>
  ALL_QUESTS.find((q) => q.id === questType) || ALL_QUESTS[0];

export const getAllQuests = (): Quest[] => ALL_QUESTS;
