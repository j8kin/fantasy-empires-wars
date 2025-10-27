export type QuestType =
  | 'The Echoing Ruins'
  | 'The Whispering Grove'
  | 'The Abyssal Crypt'
  | 'The Shattered Sky';
export interface inQuest {
  hero: string;
  id: QuestType;
  remainTurnsInQuest: number;
}

//export const questRewards = ()
