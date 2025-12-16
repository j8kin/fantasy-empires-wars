import { GameState } from '../../state/GameState';
import { LandState } from '../../state/map/land/LandState';
import { getLandId } from '../../state/map/land/LandId';

import { getLand } from '../../selectors/landSelectors';
import { getPosition, getArmiesByPlayer } from '../../selectors/armySelectors';
import {
  getPlayerLands,
  getRealmLands,
  getPlayersByDiplomacy,
} from '../../selectors/playerSelectors';

import { DiplomacyStatus } from '../../types/Diplomacy';

export const getHostileLands = (gameState: GameState): LandState[] => {
  const hostileLands = new Set<LandState>();

  const realmLands = getRealmLands(gameState).flatMap((l) => getLandId(l.mapPos));

  // get lands controlled by players but far from strongholds
  getPlayerLands(gameState)
    .filter((land) => !realmLands.includes(getLandId(land.mapPos))) // todo add effect from DEED_OF_RECLAMATION
    .forEach((land) => hostileLands.add(land));

  // add lands far from strongholds but with an army but not controlled by player
  getArmiesByPlayer(gameState)
    .filter((a) => !realmLands.includes(getLandId(getPosition(a))))
    .map((a) => getLand(gameState, getPosition(a)))
    .forEach((land) => hostileLands.add(land));

  // get allies lands
  const allies = getPlayersByDiplomacy(gameState, [DiplomacyStatus.ALLIANCE]).map((p) => p.id);
  const alliesLands = allies.flatMap((p) => getPlayerLands(gameState, p));

  // return all hostile lands that are not controlled by player or allies
  alliesLands.forEach((land) => hostileLands.delete(land));
  return hostileLands.values().toArray();
};
