import { GameState } from '../../state/GameState';
import { ArmyState } from '../../state/army/ArmyState';

/**
 * Add an army to GameState
 */
export const addArmyToGameState = (gameState: GameState, army: ArmyState): GameState => {
  return {
    ...gameState,
    armies: [...gameState.armies, army],
  };
};

/**
 * Remove an army from GameState by ID
 */
export const removeArmyFromGameState = (gameState: GameState, armyId: string): GameState => {
  return {
    ...gameState,
    armies: gameState.armies.filter((army) => army.id !== armyId),
  };
};

/**
 * Update an army in GameState
 */
export const updateArmyInGameState = (gameState: GameState, updatedArmy: ArmyState): GameState => {
  return {
    ...gameState,
    armies: gameState.armies.map((army) => (army.id === updatedArmy.id ? updatedArmy : army)),
  };
};
