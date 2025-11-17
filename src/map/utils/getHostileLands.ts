import { battlefieldLandId, GameState, getTurnOwner, LandState } from '../../types/GameState';
import { getLands } from './getLands';
import { DiplomacyStatus, getPlayersByDiplomacy } from '../../types/Diplomacy';
import { getRealmLands } from './getRealmLands';

export const getHostileLands = (gameState: GameState): LandState[] => {
  const turnOwner = getTurnOwner(gameState)!;

  const realmLands = getRealmLands(gameState).flatMap((l) => battlefieldLandId(l.mapPos));
  const allies = getPlayersByDiplomacy(gameState, [DiplomacyStatus.ALLIANCE]).map((p) => p.id);

  return getLands({
    gameState: gameState,
    noArmy: false,
  }).filter(
    (land) =>
      !(
        realmLands.includes(battlefieldLandId(land.mapPos)) || allies.includes(land.controlledBy)
      ) && land.army.some((a) => a.controlledBy === turnOwner.id)
  );
};
