import { LandPosition } from '../utils/getLands';
import { HeroUnit } from '../../types/Army';

export type QuestType =
  | 'The Echoing Ruins'
  | 'The Whispering Grove'
  | 'The Abyssal Crypt'
  | 'The Shattered Sky';

export const questLevel = (questType: QuestType) => {
  switch (questType) {
    case 'The Echoing Ruins':
      return 1;
    case 'The Whispering Grove':
      return 2;
    case 'The Abyssal Crypt':
      return 3;
    case 'The Shattered Sky':
      return 4;
    default:
      return 1000;
  }
};
export const getQuestLength = (questType: QuestType) => {
  switch (questType) {
    case 'The Echoing Ruins':
      return 4;
    case 'The Whispering Grove':
      return 5;
    case 'The Abyssal Crypt':
      return 6;
    case 'The Shattered Sky':
      return 7;
  }
};

export interface HeroQuest {
  hero: HeroUnit;
  id: QuestType;
  land: LandPosition;
  remainTurnsInQuest: number;
}

//export const questRewards = ()
