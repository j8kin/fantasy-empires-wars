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
  if (buildingType !== BuildingType.STRONGHOLD) {
    return getLands(gameState.battlefieldLands, [player], undefined, undefined, []).map((land) =>
      battlefieldLandId(land.mapPos)
    );
  }
  const playerLands = getLands(gameState.battlefieldLands, [player], undefined, undefined);
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
