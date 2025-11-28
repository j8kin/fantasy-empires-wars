import { GameState } from '../../state/GameState';
import { getLands } from './getLands';
import { BuildingType } from '../../types/Building';
import { getTilesInRadius } from './mapAlgorithms';
import { getLand } from '../../selectors/landSelectors';
import { LandState } from '../../state/map/land/LandState';
import { getLandId } from '../../state/map/land/LandId';

/** return all lands controlled by all strongholds of the player
 **/
export const getRealmLands = (state: GameState): LandState[] => {
  const seen = new Set<string>();

  return getLands({
    gameState: state,
    players: [state.turnOwner],
    buildings: [BuildingType.STRONGHOLD],
  })
    .flatMap((s) => getTilesInRadius(state.map.dimensions, s.mapPos, 1))
    .map((pos) => {
      const land = getLand(state, pos);
      if (!land) return undefined;

      const id = getLandId(pos);
      if (seen.has(id)) return undefined;

      seen.add(id);
      return land;
    })
    .filter((l): l is LandState => Boolean(l));
};
