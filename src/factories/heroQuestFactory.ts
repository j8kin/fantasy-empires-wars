import { getQuest } from '../domain/quest/questRepository';

import type { HeroState } from '../state/army/HeroState';
import type { HeroQuest, QuestType } from '../types/Quest';
import type { LandPosition } from '../state/map/land/LandPosition';

export const heroQuestFactory = (questType: QuestType, hero: HeroState, landPos: LandPosition): HeroQuest => {
  const quest = getQuest(questType);
  return {
    quest: Object.freeze(quest),
    hero: Object.freeze(hero),
    land: Object.freeze(landPos),
    remainTurnsInQuest: quest.length,
  };
};
