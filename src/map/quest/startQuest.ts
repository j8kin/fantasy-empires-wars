import { GameState } from '../../state/GameState';
import { HeroState } from '../../state/army/HeroState';

import { getTurnOwner } from '../../selectors/playerSelectors';
import { getArmiesByPlayer } from '../../selectors/armySelectors';
import { getHero } from '../../systems/armyActions';
import { updateArmyInGameState, removeArmyFromGameState } from '../utils/armyUtils';

import { getQuest, QuestType } from '../../types/Quest';

export const startQuest = (hero: HeroState, questType: QuestType, gameState: GameState) => {
  const turnOwner = getTurnOwner(gameState);

  // Find the army containing the hero
  const armies = getArmiesByPlayer(gameState, turnOwner.id);
  const armyWithHero = armies.find((army) => army.heroes.some((unit) => unit.name === hero.name));

  if (armyWithHero != null) {
    // remove hero from the army
    const heroToQuest = getHero(armyWithHero, hero.name)!;

    // Get the army's current position from movement path
    const questLandPosition =
      armyWithHero.movement.path.length > 0 ? armyWithHero.movement.path[0] : { row: 0, col: 0 };

    // Remove army if it has no units left, otherwise update it
    if (armyWithHero.regulars.length === 0 && armyWithHero.heroes.length === 0) {
      Object.assign(gameState, removeArmyFromGameState(gameState, armyWithHero.id));
    } else {
      Object.assign(gameState, updateArmyInGameState(gameState, armyWithHero));
    }

    // send hero to quest
    turnOwner.quests.push({
      quest: getQuest(questType),
      land: questLandPosition, // hero Start Quest land position (it will return at the same position if survive)
      hero: heroToQuest,
      remainTurnsInQuest: getQuest(questType).length,
    });
  }
};
