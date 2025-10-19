import { getSpellById, SpellName } from '../../types/Spell';
import { battlefieldLandId, GameState } from '../../types/GameState';
import { getLands } from '../utils/mapLands';
import { GamePlayer } from '../../types/GamePlayer';

export const getAvailableToCastSpellLands = (
  spellName: SpellName,
  player: GamePlayer,
  gameState: GameState
) => {
  const spell = getSpellById(spellName);
  const playerFilter =
    spell.apply === 'player'
      ? [player]
      : spell.apply === 'opponent'
        ? [gameState.selectedPlayer!, ...gameState.opponents!].filter((p) => p !== player)
        : [gameState.selectedPlayer!, ...gameState.opponents!];

  return getLands(gameState.battlefield.lands, playerFilter).map((land) =>
    battlefieldLandId(land.mapPos)
  );
};
