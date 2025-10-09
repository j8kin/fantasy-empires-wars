import { MapTilesType } from '../../types/HexTileState';
import { GamePlayer } from '../../types/GamePlayer';
import { getLands } from './mapLands';
import { getSpellById, SpellName } from '../../types/Spell';
import { BuildingType } from '../../types/Building';

export const highlightLands = (
  map: MapTilesType,
  player: GamePlayer,
  opponents: GamePlayer[],
  actionType: 'spell' | 'building',
  name: SpellName | BuildingType
) => {
  if (actionType === 'building') {
    getLands(map, [player], undefined, undefined, []).forEach((land) => {
      land.glow = true;
    });
  } else {
    const spellApply = getSpellById(name as SpellName).apply;
    const playerFilter =
      spellApply === 'player'
        ? [player]
        : spellApply === 'opponent'
          ? opponents
          : [player, ...opponents];
    getLands(map, playerFilter).forEach((land) => {
      land.glow = true;
    });
  }
};
