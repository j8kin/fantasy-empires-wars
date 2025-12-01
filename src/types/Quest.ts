import { HeroState } from '../state/army/HeroState';
import { LandPosition } from '../state/map/land/LandPosition';

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
  hero: HeroState;
  land: LandPosition;
  remainTurnsInQuest: number;
}
