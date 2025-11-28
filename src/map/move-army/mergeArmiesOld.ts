import { GameState } from '../../state/GameState';
import { mergeArmies } from '../../systems/armyActions';
import { getLands } from '../utils/getLands';
import { isMoving } from '../../selectors/armySelectors';

// todo refactor after Army moved into GameState from LandState
export const mergeArmiesOld = (gameState: GameState): void => {
  const turnOwner = gameState.turnOwner;

  getLands({ gameState: gameState, players: [turnOwner], noArmy: false })
    .filter(
      (land) =>
        land.army.length > 1 &&
        land.army.filter((a) => a.controlledBy === turnOwner && !isMoving(a)).length > 1
    )
    .forEach((land) => {
      // merge armies of the same type and turnsUntilReady === 0 in one unit with summary quantity
      // Heroes should never be merged since they are unique individuals
      const stationedArmies = land.army.filter((a) => !isMoving(a) && a.controlledBy === turnOwner);
      if (stationedArmies.length < 2) return; // no armies to merge

      const movingArmies = land.army.filter((a) => isMoving(a) && a.controlledBy === turnOwner);
      const otherPlayersArmies = land.army.filter((a) => a.controlledBy !== turnOwner);

      const mainArmy = stationedArmies.pop()!;
      while (stationedArmies.length > 0) {
        const armyToMerge = stationedArmies.pop()!;
        mergeArmies(mainArmy, armyToMerge);
      }

      land.army = [mainArmy, ...movingArmies, ...otherPlayersArmies];
    });
};
