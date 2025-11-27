import { GameState } from '../../state/GameState';
import { getLands } from '../utils/getLands';

export const mergeArmies = (gameState: GameState): void => {
  const turnOwner = gameState.turnOwner.id;

  getLands({ gameState: gameState, players: [turnOwner], noArmy: false })
    .filter(
      (land) =>
        land.army.length > 1 &&
        land.army.filter((a) => a.controlledBy === turnOwner && !a.isMoving).length > 1
    )
    .forEach((land) => {
      // merge armies of the same type and turnsUntilReady === 0 in one unit with summary quantity
      // Heroes should never be merged since they are unique individuals
      const stationedArmies = land.army.filter((a) => !a.isMoving && a.controlledBy === turnOwner);
      if (stationedArmies.length < 2) return; // no armies to merge

      const movingArmies = land.army.filter((a) => a.isMoving && a.controlledBy === turnOwner);
      const otherPlayersArmies = land.army.filter((a) => a.controlledBy !== turnOwner);

      const mainArmy = stationedArmies.pop()!;
      while (stationedArmies.length > 0) {
        const armyToMerge = stationedArmies.pop()!;
        mainArmy.merge(armyToMerge);
      }

      land.army = [mainArmy, ...movingArmies, ...otherPlayersArmies];
    });
};
