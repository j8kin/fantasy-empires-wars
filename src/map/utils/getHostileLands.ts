import { battlefieldLandId, GameState, getTurnOwner, LandState } from '../../types/GameState';
import { getLands } from './getLands';
import { BuildingType } from '../../types/Building';
import { getTilesInRadius } from './mapAlgorithms';
import { DiplomacyStatus, getPlayersByDiplomacy } from '../../types/Diplomacy';

export const getHostileLands = (gameState: GameState): LandState[] => {
  const turnOwner = getTurnOwner(gameState)!;

  const allStrongholds = getLands({
    lands: gameState.battlefield.lands,
    players: [turnOwner],
    buildings: [BuildingType.STRONGHOLD],
  });
  const controlledLands = allStrongholds
    .flatMap((s) => getTilesInRadius(gameState.battlefield.dimensions, s.mapPos, 1))
    .map((l) => battlefieldLandId(l));

  const allies = getPlayersByDiplomacy(gameState, [DiplomacyStatus.ALLIANCE]).map((p) => p.id);
  return getLands({
    lands: gameState.battlefield.lands,
    noArmy: false,
  }).filter(
    (land) =>
      !(
        controlledLands.includes(battlefieldLandId(land.mapPos)) ||
        allies.includes(land.controlledBy)
      ) && land.army.some((a) => a.controlledBy === turnOwner.id)
  );
};
