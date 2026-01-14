import { getLandId } from '../../state/map/land/LandId';
import { getLandOwner, getPlayerLands, getTilesInRadius, hasBuilding } from '../../selectors/landSelectors';
import { getMapDimensions } from '../../utils/screenPositionUtils';
import { BuildingName } from '../../types/Building';
import type { GameState } from '../../state/GameState';
import type { BuildingType } from '../../types/Building';

export const getAvailableToConstructLands = (gameState: GameState, buildingType: BuildingType): string[] => {
  const { turnOwner } = gameState;
  const playerLands = getPlayerLands(gameState, turnOwner);

  switch (buildingType) {
    case BuildingName.WALL:
      // border lands: some land in radius 1 has a non-player owner (neutral or opponent)
      return playerLands
        .filter(
          (land) =>
            (land.buildings.length === 0 || !hasBuilding(land, BuildingName.WALL)) &&
            getTilesInRadius(getMapDimensions(gameState), land.mapPos, 1, true).some(
              (tile) => getLandOwner(gameState, tile) !== turnOwner
            )
        )
        .map((l) => getLandId(l.mapPos));

    case BuildingName.STRONGHOLD:
      const allStrongholds = gameState.players.flatMap((p) =>
        getPlayerLands(gameState, p.id).filter((l) => hasBuilding(l, BuildingName.STRONGHOLD))
      );
      const strongholdsExcludedArea = allStrongholds.flatMap((stronghold) =>
        getTilesInRadius(getMapDimensions(gameState), stronghold.mapPos, 1, false).map((tile) => getLandId(tile))
      );

      return playerLands
        .filter((land) => !strongholdsExcludedArea.includes(getLandId(land.mapPos)))
        .map((l) => getLandId(l.mapPos));

    case BuildingName.DEMOLITION:
      return playerLands.filter((land) => land.buildings.length > 0).map((l) => getLandId(l.mapPos));

    default:
      return playerLands
        .filter(
          (land) => land.buildings.length === 0 || (land.buildings.length === 1 && hasBuilding(land, BuildingName.WALL))
        )
        .map((l) => getLandId(l.mapPos));
  }
};
