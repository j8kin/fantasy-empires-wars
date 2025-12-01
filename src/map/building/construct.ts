import { GameState } from '../../state/GameState';

import { getTurnOwner } from '../../selectors/playerSelectors';
import { getLandOwner } from '../../selectors/landSelectors';
import { getBuilding } from '../../selectors/buildingSelectors';
import { addLand } from '../../systems/playerActions';

import { TreasureItem } from '../../types/Treasures';
import { BuildingType } from '../../types/Building';

import { getTilesInRadius } from '../utils/mapAlgorithms';

import { destroyBuilding } from './destroyBuilding';
import { NO_PLAYER } from '../../data/players/predefinedPlayers';
import { LandPosition } from '../../state/map/land/LandPosition';
import { getLandId } from '../../state/map/land/LandId';

export const construct = (
  gameState: GameState,
  buildingType: BuildingType,
  position: LandPosition
) => {
  const map = gameState.map;
  const turnOwner = getTurnOwner(gameState);
  const mapPosition = getLandId(position);
  const building = getBuilding(buildingType);
  if (turnOwner.vault < building.buildCost && gameState.turn > 1) {
    return;
  }
  switch (buildingType) {
    case BuildingType.DEMOLITION:
      destroyBuilding(position, gameState);
      break;

    case BuildingType.STRONGHOLD:
      map.lands[mapPosition].buildings.push(building);
      addLand(turnOwner, position);
      const newLandsCandidates = getTilesInRadius(map.dimensions, position, 1, true);
      newLandsCandidates.forEach((land) => {
        // if the land is not controlled by any player, it becomes controlled by the player
        if (getLandOwner(gameState, land) === NO_PLAYER.id) {
          addLand(turnOwner, land);
        }
      });
      break;

    default:
      map.lands[mapPosition].buildings.push(building);
      break;
  }

  // if player has Crown of Dominion, reduce cost by 15%
  // https://github.com/j8kin/fantasy-empires-wars/wiki/Heroes’-Quests
  const hasCrownOfDominion = turnOwner.empireTreasures?.some(
    (t) => t.id === TreasureItem.CROWN_OF_DOMINION
  );

  if (gameState.turn > 1) {
    turnOwner.vault -= hasCrownOfDominion
      ? Math.ceil(building.buildCost * 0.85)
      : building.buildCost;
  }
};
