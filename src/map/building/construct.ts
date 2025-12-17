import { GameState } from '../../state/GameState';
import { LandPosition } from '../../state/map/land/LandPosition';
import { getLandId } from '../../state/map/land/LandId';

import { getTurnOwner, hasTreasureByPlayer } from '../../selectors/playerSelectors';
import { getLandOwner } from '../../selectors/landSelectors';
import { getBuilding } from '../../selectors/buildingSelectors';
import { addPlayerLand, updatePlayerVault } from '../../systems/gameStateActions';

import { NO_PLAYER } from '../../domain/player/playerRepository';

import { TreasureType } from '../../types/Treasures';
import { BuildingType } from '../../types/Building';

import { getTilesInRadius } from '../utils/mapAlgorithms';
import { destroyBuilding } from './destroyBuilding';

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
      destroyBuilding(gameState, position);
      break;

    case BuildingType.STRONGHOLD:
      gameState.map.lands[mapPosition].buildings.push(building);
      Object.assign(gameState, addPlayerLand(gameState, turnOwner.id, position));
      const newLandsCandidates = getTilesInRadius(map.dimensions, position, 1, true);
      newLandsCandidates.forEach((land) => {
        // if the land is not controlled by any player, it becomes controlled by the player
        if (getLandOwner(gameState, land) === NO_PLAYER.id) {
          Object.assign(gameState, addPlayerLand(gameState, turnOwner.id, land));
        }
      });
      break;

    default:
      gameState.map.lands[mapPosition].buildings.push(building);
      break;
  }

  // if player has Crown of Dominion, reduce cost by 15%
  // https://github.com/j8kin/fantasy-empires-wars/wiki/Heroes’-Quests
  const hasCrownOfDominion = hasTreasureByPlayer(turnOwner, TreasureType.CROWN_OF_DOMINION);

  if (gameState.turn > 1) {
    const cost = hasCrownOfDominion ? Math.ceil(building.buildCost * 0.85) : building.buildCost;
    Object.assign(gameState, updatePlayerVault(gameState, turnOwner.id, -cost));
  }
};
