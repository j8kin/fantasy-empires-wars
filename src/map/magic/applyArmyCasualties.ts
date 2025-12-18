import { hasTreasureByPlayer } from '../../selectors/playerSelectors';
import { getArmiesAtPositionByPlayers } from '../../selectors/armySelectors';
import { calculateAndApplyArmyPenalties } from '../../domain/army/armyPenaltyCalculator';
import { cleanupArmies, updateArmyInGameState } from '../../systems/armyActions';

import { TreasureType } from '../../types/Treasures';
import { RegularUnitType } from '../../types/UnitType';
import type { GameState } from '../../state/GameState';
import type { LandPosition } from '../../state/map/land/LandPosition';
import type { PenaltyConfig } from '../../domain/army/armyPenaltyCalculator';

/**
 * Applies casualty penalties to all armies at a specific land position.
 * Used by spells and items that cause damage or losses to units.
 *
 * @param state - The current game state
 * @param penaltyConfig - Configuration for how penalties are calculated and applied
 * @param landPos - The land position where casualties should be applied
 * @param units - Optional filter for specific unit types to target (e.g., UNDEAD for Turn Undead spell)
 * @returns Updated game state with casualties applied
 *
 * @remarks
 * This function affects all players' armies at the position, including the caster in rare cases (friendly fire).
 * Players with SHARD_OF_THE_SILENT_ANVIL treasure receive 35% damage reduction.
 * Empty armies are automatically cleaned up after casualties are applied.
 */
export const applyArmyCasualtiesAtPosition = (
  state: GameState,
  penaltyConfig: PenaltyConfig,
  landPos: LandPosition,
  units?: RegularUnitType[]
): GameState => {
  let updatedState = state;

  // right now spell affects all players, even turnOwner in rare cases it could cause a friendly-fire
  state.players.forEach((p) => {
    const playerArmiesAtPosition = getArmiesAtPositionByPlayers(updatedState, landPos, [p.id]);

    const updatedArmies = calculateAndApplyArmyPenalties(
      playerArmiesAtPosition,
      penaltyConfig,
      hasTreasureByPlayer(p, TreasureType.SHARD_OF_THE_SILENT_ANVIL),
      units
    );

    updatedArmies.forEach((army) => {
      updatedState = updateArmyInGameState(updatedState, army);
    });
  });

  // cleanup Armies
  return cleanupArmies(updatedState);
};
