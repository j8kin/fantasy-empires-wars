import { GameState } from '../state/GameState';
import { Effect } from '../types/Effect';
import { getPlayerLands, getTurnOwner } from '../selectors/playerSelectors';
import { getArmiesByPlayer } from '../selectors/armySelectors';

/**
 * Decrements effect durations and filters out expired effects
 * Only processes effects that were cast by the specified player
 * @param effects - Array of effects to process
 * @param castById - ID of the player whose cast effects should be decremented
 * @returns Array of effects with durations decremented and expired effects removed
 */
const decrementAndFilterEffects = (effects: Effect[], castById: string): Effect[] => {
  return effects
    .map((effect) => {
      // Only decrement effects cast by the specified player
      if (effect.castBy === castById) {
        return {
          ...effect,
          duration: effect.duration - 1,
        };
      }
      // Return effect unchanged if not cast by the specified player
      return effect;
    })
    .filter((effect) => {
      // Remove effects that were cast by the specified player and have expired
      if (effect.castBy === castById) {
        return effect.duration > 0;
      }
      // Keep effects that were not cast by the specified player regardless of duration
      return true;
    });
};

/**
 * Decrements effect durations for effects cast by the current turn owner across all entities:
 * - Player effects (only those cast by the turn owner)
 * - Land effects (only those cast by the turn owner, on all lands)
 * - Army effects (only those cast by the turn owner, on all armies)
 *
 * Effects with duration <= 0 after decrementing are removed.
 *
 * @param gameState - The current game state
 */
export const decrementEffectDurations = (gameState: GameState): void => {
  const turnOwner = getTurnOwner(gameState);
  const turnOwnerId = turnOwner.id;

  // 1. Decrement player effects cast by the turn owner
  turnOwner.effects = decrementAndFilterEffects(turnOwner.effects, turnOwnerId);

  // 2. Decrement effects cast by the turn owner on all lands
  gameState.players.forEach((player) => {
    const playerLands = getPlayerLands(gameState, player.id);
    playerLands.forEach((land) => {
      land.effects = decrementAndFilterEffects(land.effects, turnOwnerId);
    });
  });

  // 3. Decrement effects cast by the turn owner on armies controlled by the turn owner
  const playerArmies = getArmiesByPlayer(gameState);
  playerArmies.forEach((army) => {
    army.effects = decrementAndFilterEffects(army.effects, turnOwnerId);
  });
};
