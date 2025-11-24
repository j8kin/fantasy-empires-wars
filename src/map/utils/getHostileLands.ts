import { GameState } from '../../state/GameState';
import { getLandId, LandState } from '../../state/LandState';
import { DiplomacyStatus, getPlayersByDiplomacy } from '../../types/Diplomacy';
import { getLands } from './getLands';
import { getRealmLands } from './getRealmLands';

export const getHostileLands = (gameState: GameState): LandState[] => {
  const turnOwner = gameState.turnOwner;

  const realmLands = getRealmLands(gameState).flatMap((l) => getLandId(l.mapPos));
  const allies = getPlayersByDiplomacy(gameState, [DiplomacyStatus.ALLIANCE]).map((p) => p.id);

  return getLands({
    gameState: gameState,
    noArmy: false,
  }).filter(
    (land) =>
      !(
        realmLands.includes(getLandId(land.mapPos)) ||
        allies.includes(gameState.getLandOwner(land.mapPos))
      ) && land.army.some((a) => a.controlledBy === turnOwner.id)
  );
};
