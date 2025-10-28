import { GameState, getTurnOwner, TurnPhase } from '../../types/GameState';
import { HeroUnit } from '../../types/Army';
import { getQuestLength, QuestType } from './Quest';
import { getLands } from '../utils/getLands';

export const sendToQuest = (hero: HeroUnit, quest: QuestType, gameState: GameState) => {
  if (gameState.turnPhase !== TurnPhase.MAIN) return;

  const heroLand = getLands({
    lands: gameState.battlefield.lands,
    players: [getTurnOwner(gameState)!],
    noArmy: false,
  }).find((land) => land.army.find((army) => army.unit.id === hero.id));

  if (heroLand != null) {
    // remove hero from the battlefield
    heroLand.army = [...heroLand.army].filter((army) => army.unit.id !== hero.id);

    // send hero to quest
    getTurnOwner(gameState)?.quests.push({
      id: quest,
      land: heroLand.mapPos, // hero Start Quest land position (it will return at the same position if survive)
      hero: hero,
      remainTurnsInQuest: getQuestLength(quest),
    });
  }
};
