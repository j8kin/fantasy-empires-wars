import { BuildingType } from '../../types/Building';
import { getLandId, GameState, getTurnOwner } from '../../types/GameState';
import { getLand, getLands } from '../utils/getLands';
import { getTilesInRadius } from '../utils/mapAlgorithms';

export const getAvailableToConstructLands = (
  gameState: GameState,
  buildingType: BuildingType
): string[] => {
  const owner = getTurnOwner(gameState)!;
  const playerLands = getLands({
    gameState: gameState,
    players: [gameState.turnOwner],
  });

  switch (buildingType) {
    case BuildingType.WALL:
      // border lands: some land in radius 1 has a non-player owner (neutral or opponent)
      return playerLands
        .filter(
          (land) =>
            (land.buildings.length === 0 ||
              !land.buildings?.some((b) => b.id === BuildingType.WALL)) &&
            getTilesInRadius(gameState.battlefield.dimensions, land.mapPos, 1, true).some(
              (tile) => getLand(gameState, tile).controlledBy !== owner.playerId
            )
        )
        .map((l) => getLandId(l.mapPos));

    case BuildingType.STRONGHOLD:
      const allStrongholds = getLands({
        gameState: gameState,
        buildings: [BuildingType.STRONGHOLD],
      });
      const strongholdsExcludedArea = allStrongholds.flatMap((stronghold) =>
        getTilesInRadius(gameState.battlefield.dimensions, stronghold.mapPos, 1, false).map(
          (tile) => getLandId(tile)
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
