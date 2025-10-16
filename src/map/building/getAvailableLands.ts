import { BuildingType } from '../../types/Building';
import { battlefieldLandId, GameState } from '../../types/GameState';
import { getLands } from '../utils/mapLands';
import { GamePlayer } from '../../types/GamePlayer';
import { getTilesInRadius } from '../utils/mapAlgorithms';

export const getAvailableLands = (
  buildingType: BuildingType,
  player: GamePlayer,
  gameState: GameState
): string[] => {
  if (buildingType === BuildingType.WALL) {
    // border lands: some land in radius 1 has non player owner (neutral or opponent)
    const playerLands = getLands(gameState.battlefieldLands, [player]);
    const borderLands = playerLands.filter(
      (land) =>
        (land.buildings.length === 0 || !land.buildings?.some((b) => b.id === BuildingType.WALL)) &&
        getTilesInRadius(gameState.mapSize, land.mapPos, 1, true).some(
          (tile) => gameState.battlefieldLands[battlefieldLandId(tile)].controlledBy !== player.id
        )
    );

    return borderLands.map((land) => battlefieldLandId(land.mapPos));
  }

  if (buildingType !== BuildingType.STRONGHOLD) {
    const playerLands = getLands(gameState.battlefieldLands, [player]);

    return playerLands
      .filter(
        (land) =>
          land.buildings.length === 0 ||
          (land.buildings.length === 1 && land.buildings[0].id === BuildingType.WALL)
      )
      .map((l) => battlefieldLandId(l.mapPos));
  }

  const playerLands = getLands(gameState.battlefieldLands, [player]);
  const allStrongholds = getLands(gameState.battlefieldLands, undefined, undefined, undefined, [
    BuildingType.STRONGHOLD,
  ]);
  const strongholdsExcludedArea = allStrongholds.flatMap((stronghold) =>
    getTilesInRadius(gameState.mapSize, stronghold.mapPos, 1, false).map((tile) =>
      battlefieldLandId(tile)
    )
  );

  return playerLands
    .filter((land) => !strongholdsExcludedArea.includes(battlefieldLandId(land.mapPos)))
    .map((land) => battlefieldLandId(land.mapPos));
};
