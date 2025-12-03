import { GameState } from '../state/GameState';
import { Effect } from '../types/Effect';
import { getPlayerLands, getTurnOwner } from '../selectors/playerSelectors';
import { getArmiesByPlayer } from '../selectors/armySelectors';

/**
 * Decrements effect durations and filters out expired effects
 * @param effects - Array of effects to process
 * @returns Array of effects with durations decremented and expired effects removed
 */
const decrementAndFilterEffects = (effects: Effect[]): Effect[] => {
  return effects
    .map((effect) => ({
      ...effect,
      duration: effect.duration - 1,
    }))
    .filter((effect) => effect.duration > 0);
};

/**
 * Decrements effect durations for the current turn owner across all their entities:
 * - Player effects
 * - Land effects (on lands owned by the player)
 * - Army effects (on armies controlled by the player)
 *
 * Effects with duration <= 0 after decrementing are removed.
 *
 * @param gameState - The current game state
 */
export const decrementEffectDurations = (gameState: GameState): void => {
  const turnOwner = getTurnOwner(gameState);

  // 1. Decrement player effects
  turnOwner.effects = decrementAndFilterEffects(turnOwner.effects);

  // 2. Decrement effects on lands owned by the turn owner
  const playerLands = getPlayerLands(gameState);
  playerLands.forEach((land) => {
    land.effects = decrementAndFilterEffects(land.effects);
  });

  // 3. Decrement effects on armies controlled by the turn owner
  const playerArmies = getArmiesByPlayer(gameState);
  playerArmies.forEach((army) => {
    army.effects = decrementAndFilterEffects(army.effects);
  });
};
