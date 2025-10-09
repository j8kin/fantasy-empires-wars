import { GameState, createTileId } from '../../types/HexTileState';
import { getLands } from './mapLands';
import { getSpellById, SpellName } from '../../types/Spell';
import { BuildingType } from '../../types/Building';

export const highlightLands = (
  gameState: GameState,
  actionType: 'spell' | 'building',
  name: SpellName | BuildingType
): string[] => {
  const { tiles, selectedPlayer, opponents } = gameState;

  if (actionType === 'building') {
    const lands = getLands(tiles, [selectedPlayer!], undefined, undefined, []);
    return lands.map((land) => createTileId(land.mapPos));
  } else {
    const spell = getSpellById(name as SpellName);
    const spellApply = spell.apply;
    const playerFilter =
      spellApply === 'player'
        ? [selectedPlayer!]
        : spellApply === 'opponent'
          ? opponents
          : [selectedPlayer!, ...opponents!];
    const lands = getLands(tiles, playerFilter);
    return lands.map((land) => createTileId(land.mapPos));
  }
};
