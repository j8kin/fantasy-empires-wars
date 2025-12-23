import { getTurnOwner, hasTreasureByPlayer } from '../../selectors/playerSelectors';
import { calculateIncome } from './calculateIncome';
import { calculateMaintenance } from './calculateMaintenance';

import { TreasureName } from '../../types/Treasures';
import type { GameState } from '../../state/GameState';

/**
 * Calculates the current net income for the turn owner player.
 * This includes base income from lands minus maintenance costs,
 * plus any empire treasure bonuses.
 *
 * @param gameState - The current game state
 * @returns The net income per turn for the current player, or 0 if no player is found
 */
export const calculatePlayerIncome = (gameState: GameState): number => {
  const turnOwner = getTurnOwner(gameState);

  // On turn 1, no income is calculated (players just place homeland)
  if (gameState.turn === 1) {
    return 0;
  }

  // Calculate base income minus maintenance
  let netIncome = calculateIncome(gameState) - calculateMaintenance(gameState);

  // Apply empire treasure effects
  const hasObsidianChalice = hasTreasureByPlayer(turnOwner, TreasureName.OBSIDIAN_CHALICE);
  const hasBannerOfUnity = hasTreasureByPlayer(turnOwner, TreasureName.BANNER_OF_UNITY);

  // Banner of Unity increases income by 25%
  netIncome = hasBannerOfUnity ? Math.ceil(netIncome * 1.25) : netIncome;

  // Obsidian Chalice reduces income by 10% (the mana conversion happens in startTurn)
  netIncome = hasObsidianChalice ? Math.ceil(netIncome * 0.9) : netIncome;

  return netIncome;
};
