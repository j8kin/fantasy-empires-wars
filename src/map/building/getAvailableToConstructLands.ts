import { BuildingType } from '../../types/Building';
import { GameState } from '../../state/GameState';
import { getLandId } from '../../state/map/land/LandId';

import { getLandOwner } from '../../selectors/landSelectors';
import { getPlayerLands } from '../../selectors/playerSelectors';

import { getTilesInRadius } from '../utils/mapAlgorithms';

export const getAvailableToConstructLands = (
  gameState: GameState,
  buildingType: BuildingType
): string[] => {
  const { turnOwner } = gameState;
  const playerLands = getPlayerLands(gameState, turnOwner);

  switch (buildingType) {
    case BuildingType.WALL:
      // border lands: some land in radius 1 has a non-player owner (neutral or opponent)
      return playerLands
        .filter(
          (land) =>
            (land.buildings.length === 0 ||
              !land.buildings?.some((b) => b.id === BuildingType.WALL)) &&
            getTilesInRadius(gameState.map.dimensions, land.mapPos, 1, true).some(
              (tile) => getLandOwner(gameState, tile) !== turnOwner
            )
        )
        .map((l) => getLandId(l.mapPos));

    case BuildingType.STRONGHOLD:
      const allStrongholds = gameState.players.flatMap((p) =>
        getPlayerLands(gameState, p.id).filter((l) =>
          l.buildings.some((b) => b.id === BuildingType.STRONGHOLD)
        )
      );
      const strongholdsExcludedArea = allStrongholds.flatMap((stronghold) =>
        getTilesInRadius(gameState.map.dimensions, stronghold.mapPos, 1, false).map((tile) =>
          getLandId(tile)
        )
      );

      return playerLands
        .filter((land) => !strongholdsExcludedArea.includes(getLandId(land.mapPos)))
        .map((l) => getLandId(l.mapPos));

    case BuildingType.DEMOLITION:
      return playerLands
        .filter((land) => land.buildings.length > 0)
        .map((l) => getLandId(l.mapPos));

    default:
      return playerLands
        .filter(
          (land) =>
            land.buildings.length === 0 ||
            (land.buildings.length === 1 && land.buildings[0].id === BuildingType.WALL)
        )
        .map((l) => getLandId(l.mapPos));
  }
};
