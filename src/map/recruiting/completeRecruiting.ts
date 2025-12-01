import { GameState } from '../../state/GameState';
import { addHero, addRegulars } from '../../systems/armyActions';
import { isMoving, getArmiesAtPosition } from '../../selectors/armySelectors';
import { getPlayerLands } from '../../selectors/playerSelectors';
import { armyFactory } from '../../factories/armyFactory';
import { heroFactory } from '../../factories/heroFactory';
import { regularsFactory } from '../../factories/regularsFactory';
import {
  decrementPlayerRecruitmentSlots,
  removePlayerCompletedRecruitmentSlots,
} from '../../systems/gameStateActions';

import { isHeroType } from '../../domain/unit/unitTypeChecks';
import { HeroOutcome, HeroOutcomeType } from '../../types/HeroOutcome';

import { generateHeroName } from './heroNameGeneration';
import { heroRecruitingMessage } from './heroRecruitingMessage';

import { addArmyToGameState, updateArmyInGameState } from '../../systems/armyActions';

export const completeRecruiting = (gameState: GameState): HeroOutcome[] => {
  const heroesRecruited: HeroOutcome[] = [];
  const { turnOwner } = gameState;

  // First, decrement recruitment slot counters immutably for current player's lands only
  Object.assign(gameState, decrementPlayerRecruitmentSlots(gameState, turnOwner));

  // Find all completed recruitment slots (turns remaining === 0) and process them
  const playerLands = getPlayerLands(gameState);
  const landsWithRecruitment = playerLands.filter(
    (l) =>
      l.buildings.length > 0 &&
      l.buildings.some((b) => b.numberOfSlots > 0 && b.slots && b.slots.length > 0)
  );

  landsWithRecruitment.forEach((l) =>
    l.buildings.forEach((b) => {
      if (b.slots && b.slots.length > 0) {
        // Find completed slots (after decrement, so 0 means just completed)
        const completedSlots = b.slots.filter((s) => s.turnsRemaining === 0);

        completedSlots.forEach((s) => {
          const armiesAtPosition = getArmiesAtPosition(gameState, l.mapPos);
          const stationedArmy = armiesAtPosition.find(
            (a) => !isMoving(a) && a.controlledBy === turnOwner
          );

          if (isHeroType(s.unit)) {
            const newHero = heroFactory(s.unit, generateHeroName(s.unit));
            // create a message for hero recruiting
            heroesRecruited.push({
              status: HeroOutcomeType.Success,
              message: heroRecruitingMessage(newHero),
            });
            if (stationedArmy) {
              const updatedArmy = addHero(stationedArmy, newHero);
              Object.assign(stationedArmy, updatedArmy);
              Object.assign(gameState, updateArmyInGameState(gameState, stationedArmy));
            } else {
              const newArmy = armyFactory(turnOwner, l.mapPos, [newHero]);
              Object.assign(gameState, addArmyToGameState(gameState, newArmy));
            }
          } else {
            const newRegulars = regularsFactory(s.unit);
            if (stationedArmy) {
              const updatedArmy = addRegulars(stationedArmy, newRegulars);
              Object.assign(stationedArmy, updatedArmy);
              Object.assign(gameState, updateArmyInGameState(gameState, stationedArmy));
            } else {
              const newArmy = armyFactory(turnOwner, l.mapPos, undefined, [newRegulars]);
              Object.assign(gameState, addArmyToGameState(gameState, newArmy));
            }
          }
        });
      }
    })
  );

  // Finally, remove all completed recruitment slots immutably for current player only
  Object.assign(gameState, removePlayerCompletedRecruitmentSlots(gameState, turnOwner));

  return heroesRecruited;
};
