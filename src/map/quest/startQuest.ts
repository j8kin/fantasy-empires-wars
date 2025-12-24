import { findArmyByHero, getPosition } from '../../selectors/armySelectors';
import { cleanupArmies, getHero } from '../../systems/armyActions';
import { updateArmyInGameState } from '../../systems/armyActions';
import { addPlayerQuest } from '../../systems/gameStateActions';
import { heroQuestFactory } from '../../factories/heroQuestFactory';

import type { GameState } from '../../state/GameState';
import type { QuestType } from '../../types/Quest';

export const startQuest = (state: GameState, heroName: string, questType: QuestType) => {
  // Find the army containing the hero
  const heroArmy = findArmyByHero(state, heroName);
  if (!heroArmy) return;

  // remove hero from the army
  const heroAndArmy = getHero(heroArmy, heroName)!;
  const questLandPosition = getPosition(heroAndArmy.updatedArmy);

  const updatedState: GameState = addPlayerQuest(
    cleanupArmies(updateArmyInGameState(state, heroAndArmy.updatedArmy)),
    heroQuestFactory(questType, heroAndArmy.hero, questLandPosition)
  );
  Object.assign(state, updatedState);
};
