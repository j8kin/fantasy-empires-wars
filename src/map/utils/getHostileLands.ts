import { getLandId, GameState, getTurnOwner, LandState } from '../../state/GameState';
import { getLands } from './getLands';
import { DiplomacyStatus, getPlayersByDiplomacy } from '../../types/Diplomacy';
import { getRealmLands } from './getRealmLands';

export const getHostileLands = (gameState: GameState): LandState[] => {
  const turnOwner = getTurnOwner(gameState)!;

  const realmLands = getRealmLands(gameState).flatMap((l) => getLandId(l.mapPos));
  const allies = getPlayersByDiplomacy(gameState, [DiplomacyStatus.ALLIANCE]).map(
    (p) => p.playerId
  );

  return getLands({
    gameState: gameState,
    noArmy: false,
  }).filter(
    (land) =>
      !(realmLands.includes(getLandId(land.mapPos)) || allies.includes(land.controlledBy)) &&
      land.army.some((a) => a.controlledBy === turnOwner.playerId)
  );
};
