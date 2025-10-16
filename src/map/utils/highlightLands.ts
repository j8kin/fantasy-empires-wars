import { GameState, battlefieldLandId } from '../../types/GameState';
import { getLands } from './mapLands';
import { getSpellById, SpellName } from '../../types/Spell';
import { BuildingType } from '../../types/Building';
import { getAvailableLands } from '../building/getAvailableLands';

export const highlightLands = (
  gameState: GameState,
  actionType: 'spell' | 'building',
  name: SpellName | BuildingType
): string[] => {
  const { battlefieldLands, selectedPlayer, opponents } = gameState;

  if (!battlefieldLands) return [];

  if (actionType === 'building') {
    return getAvailableLands(name as BuildingType, selectedPlayer!, gameState);
  } else {
    const spellApply = getSpellById(name as SpellName).apply;
    const playerFilter =
      spellApply === 'player'
        ? [selectedPlayer!]
        : spellApply === 'opponent'
          ? opponents
          : [selectedPlayer!, ...opponents!];
    return getLands(battlefieldLands, playerFilter).map((land) => battlefieldLandId(land.mapPos));
  }
};
