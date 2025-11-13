import { battlefieldLandId, GameState, getTurnOwner, TurnPhase } from '../../types/GameState';
import { mergeArmies } from './mergeArmies';
import { getLands, LandPosition } from '../utils/getLands';
import { Army } from '../../types/Army';
import { DiplomacyStatus } from '../../types/GamePlayer';

export const performMovements = (gameState: GameState): void => {
  if (gameState == null || gameState.turnPhase !== TurnPhase.END) return;

  // Find all armies of the current turn owner that have movements
  const armiesToMove: Array<{
    army: Army;
    currentLandPos: LandPosition;
    nextLandPos: LandPosition;
    isAtDestination: boolean;
  }> = [];

  const player = getTurnOwner(gameState)!;
  const allies = gameState.players.filter(
    (p) => p.id !== player.id && player.diplomacy[p.id] === DiplomacyStatus.ALLIANCE
  );

  getLands({
    lands: gameState.battlefield.lands,
    players: [player, ...allies],
    noArmy: false,
  })
    .filter((land) => land.army.some((a) => a.controlledBy === player.id && a.movements != null))
    .forEach((landState) => {
      landState.army.forEach((army) => {
        if (army.controlledBy === gameState.turnOwner && army.movements) {
          // Find current position in the path
          const currentPos = landState.mapPos;
          const pathIndex = army.movements.path.findIndex(
            (pos) => pos.row === currentPos.row && pos.col === currentPos.col
          );

          if (pathIndex !== -1 && pathIndex < army.movements.path.length - 1) {
            // There's a next position in the path
            const nextPos = army.movements.path[pathIndex + 1];
            const isAtDestination =
              nextPos.row === army.movements.to.row && nextPos.col === army.movements.to.col;

            armiesToMove.push({
              army,
              currentLandPos: currentPos,
              nextLandPos: nextPos,
              isAtDestination,
            });
          }
        }
      });
    });

  // Create immutable copy of lands to avoid moving armies twice
  const updatedLands = { ...gameState.battlefield.lands };

  // Process each army movement
  armiesToMove.forEach(({ army, currentLandPos, nextLandPos, isAtDestination }) => {
    const currentLandId = battlefieldLandId(currentLandPos);
    const nextLandId = battlefieldLandId(nextLandPos);

    // Remove army from current land
    if (updatedLands[currentLandId]) {
      updatedLands[currentLandId] = {
        ...updatedLands[currentLandId],
        army: updatedLands[currentLandId].army.filter((a) => a !== army),
      };
    }

    // Create updated army (remove movements if at destination)
    const updatedArmy = {
      ...army,
      movements: isAtDestination ? undefined : army.movements,
    };

    // Add army to next land
    if (updatedLands[nextLandId]) {
      updatedLands[nextLandId] = {
        ...updatedLands[nextLandId],
        army: [...updatedLands[nextLandId].army, updatedArmy],
      };
    }
  });

  // Update gameState with the new lands
  gameState.battlefield.lands = updatedLands;

  // merge armies after all movements are performed
  mergeArmies(gameState);
};
