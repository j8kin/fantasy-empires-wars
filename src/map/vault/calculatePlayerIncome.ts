import { GameState, getTurnOwner } from '../../state/GameState';
import { TreasureItem } from '../../types/Treasures';
import { calculateIncome } from './calculateIncome';
import { calculateMaintenance } from './calculateMaintenance';

/**
 * Calculates the current net income for the turn owner player.
 * This includes base income from lands minus maintenance costs,
 * plus any empire treasure bonuses.
 *
 * @param gameState - The current game state
 * @returns The net income per turn for the current player, or 0 if no player is found
 */
export const calculatePlayerIncome = (gameState: GameState): number => {
  const player = getTurnOwner(gameState);
  if (!player) return 0;

  // On turn 1, no income is calculated (players just place homeland)
  if (gameState.turn === 1) {
    return 0;
  }

  // Calculate base income minus maintenance
  let netIncome = calculateIncome(gameState) - calculateMaintenance(gameState);

  // Apply empire treasure effects
  const hasObsidianChalice = player.empireTreasures?.some(
    (t) => t.id === TreasureItem.OBSIDIAN_CHALICE
  );
  const hasBannerOfUnity = player.empireTreasures?.some(
    (t) => t.id === TreasureItem.BANNER_OF_UNITY
  );

  // Banner of Unity increases income by 25%
  netIncome = hasBannerOfUnity ? Math.ceil(netIncome * 1.25) : netIncome;

  // Obsidian Chalice reduces income by 10% (the mana conversion happens in startTurn)
  netIncome = hasObsidianChalice ? Math.ceil(netIncome * 0.9) : netIncome;

  return netIncome;
};
