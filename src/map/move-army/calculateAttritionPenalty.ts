import { getTurnOwner } from '../../selectors/playerSelectors';
import { getArmiesAtPositionByPlayers } from '../../selectors/armySelectors';
import { getHostileLands } from '../../selectors/landSelectors';
import { updateArmyInGameState, removeArmyFromGameState } from '../../systems/armyActions';
import { calculateAndApplyArmyPenalties } from '../../domain/army/armyPenaltyCalculator';

import type { PenaltyConfig } from '../../domain/army/armyPenaltyCalculator';
import type { GameState } from '../../state/GameState';

const ATTRITION_PENALTY_CONFIG: PenaltyConfig = {
  regular: { minPct: 0.08, maxPct: 0.1, minAbs: 40, maxAbs: 60 },
  veteran: { minPct: 0.05, maxPct: 0.07, minAbs: 20, maxAbs: 40 },
  elite: { minPct: 0.03, maxPct: 0.05, minAbs: 10, maxAbs: 20 },
};

/**
 * find armies controlled by the turn owner and apply attrition penalty
 *   out of radius 1 from any owner stronghold or not in ally's land
 *
 * Attrition penalty:
 * | RegularUnit Type | Attrition Penalty                           |
 * |------------------|---------------------------------------------|
 * | Regular          | 8-10%, not less than 40-60 units            |
 * | Veteran          | 5-7%, not less than 20-40 units             |
 * | Elite            | 3-5%, not less than 10-20 units             |
 * | Hero below lvl 8 | die                                         |
 * |------------------|---------------------------------------------|
 * | Hero above lvl 8 | Could be moved only on owner or ally's land |
 * |                  | if stronghold is not constructed immediately|
 * |------------------|---------------------------------------------|
 *
 * penalty applied from above till bellow, for example, if there are 70 regular units, 10 veteran etc.,
 *   then only 40-60 units will be affected by attrition penalty
 * @param gameState
 */
export const calculateAttritionPenalty = (gameState: GameState): void => {
  const turnOwnerId = getTurnOwner(gameState).id;

  getHostileLands(gameState).forEach((land) => {
    const allArmies = getArmiesAtPositionByPlayers(gameState, land.mapPos, [turnOwnerId]);

    if (allArmies.length === 0) return;

    // Apply penalties to all armies at this position
    const updatedArmies = calculateAndApplyArmyPenalties(allArmies, ATTRITION_PENALTY_CONFIG);

    // Update or remove armies based on remaining units
    updatedArmies.forEach((updatedArmy, index) => {
      const originalArmy = allArmies[index];

      // Update army reference for the conditional check below
      Object.assign(originalArmy, updatedArmy);

      // Remove armies with no units or update them in GameState
      if (originalArmy.regulars.length === 0 && originalArmy.heroes.length === 0) {
        Object.assign(gameState, removeArmyFromGameState(gameState, originalArmy.id));
      } else {
        Object.assign(gameState, updateArmyInGameState(gameState, originalArmy));
      }
    });
  });
};
