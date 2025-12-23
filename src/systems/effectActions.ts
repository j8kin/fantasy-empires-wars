import { getPlayerLands, getTurnOwner } from '../selectors/playerSelectors';
import { getArmiesByPlayer } from '../selectors/armySelectors';

import { SpellName } from '../types/Spell';
import { EffectKind } from '../types/Effect';
import type { GameState } from '../state/GameState';
import type { Effect } from '../types/Effect';

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
      if (effect.appliedBy === castById || effect.sourceId === SpellName.TURN_UNDEAD) {
        // Don't decrement permanent effects
        if (effect.rules.type === EffectKind.PERMANENT) return effect;

        return {
          ...effect,
          rules: {
            ...effect.rules,
            duration: Math.max(0, effect.rules.duration - 1),
          },
        };
      }
      // Return effect unchanged if not cast by the specified player
      return effect;
    })
    .filter((effect) => {
      // Remove effects that were cast by the specified player and have expired
      if (effect.appliedBy === castById || effect.sourceId === SpellName.TURN_UNDEAD) {
        return effect.rules.type === EffectKind.PERMANENT || effect.rules.duration > 0;
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
 * @param state - The current game state
 */
export const decrementEffectDurations = (state: GameState): void => {
  const turnOwner = getTurnOwner(state);
  const turnOwnerId = turnOwner.id;

  // 1. Decrement player effects cast by the turn owner
  turnOwner.effects = decrementAndFilterEffects(turnOwner.effects, turnOwnerId);

  // 2. Decrement effects cast by the turn owner on all lands
  state.players.forEach((player) => {
    const playerLands = getPlayerLands(state, player.id);
    playerLands.forEach((land) => {
      land.effects = decrementAndFilterEffects(land.effects, turnOwnerId);
    });
  });

  // 3. Decrement effects cast by the turn owner on armies controlled by the turn owner
  const playerArmies = getArmiesByPlayer(state);
  playerArmies.forEach((army) => {
    army.effects = decrementAndFilterEffects(army.effects, turnOwnerId);
  });
};
