import { BuildingType } from '../../types/Building';
import { battlefieldLandId, GameState } from '../../types/GameState';
import { getLands } from '../utils/mapLands';
import { GamePlayer } from '../../types/GamePlayer';
import { getTilesInRadius } from '../utils/mapAlgorithms';
import { getBattlefieldDimensions } from '../../types/BattlefieldSize';

export const getAvailableToConstructLands = (
  buildingType: BuildingType,
  player: GamePlayer,
  gameState: GameState
): string[] => {
  const playerLands = getLands(gameState.battlefield.lands, [player]);

  switch (buildingType) {
    case BuildingType.WALL:
      // border lands: some land in radius 1 has non-player owner (neutral or opponent)
      return playerLands
        .filter(
          (land) =>
            (land.buildings.length === 0 ||
              !land.buildings?.some((b) => b.id === BuildingType.WALL)) &&
            getTilesInRadius(
              getBattlefieldDimensions(gameState.mapSize),
              land.mapPos,
              1,
              true
            ).some(
              (tile) =>
                gameState.battlefield.lands[battlefieldLandId(tile)].controlledBy !== player.id
            )
        )
        .map((l) => battlefieldLandId(l.mapPos));

    case BuildingType.STRONGHOLD:
      const allStrongholds = getLands(
        gameState.battlefield.lands,
        undefined,
        undefined,
        undefined,
        [BuildingType.STRONGHOLD]
      );
      const strongholdsExcludedArea = allStrongholds.flatMap((stronghold) =>
        getTilesInRadius(
          getBattlefieldDimensions(gameState.mapSize),
          stronghold.mapPos,
          1,
          false
        ).map((tile) => battlefieldLandId(tile))
      );

      return playerLands
        .filter((land) => !strongholdsExcludedArea.includes(battlefieldLandId(land.mapPos)))
        .map((l) => battlefieldLandId(l.mapPos));

    case BuildingType.DEMOLITION:
      return playerLands
        .filter((land) => land.buildings.length > 0)
        .map((l) => battlefieldLandId(l.mapPos));

    default:
      return playerLands
        .filter(
          (land) =>
            land.buildings.length === 0 ||
            (land.buildings.length === 1 && land.buildings[0].id === BuildingType.WALL)
        )
        .map((l) => battlefieldLandId(l.mapPos));
  }
};
