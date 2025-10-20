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
        ? gameState.players.filter((p) => p !== player)
        : gameState.players;

  return getLands(gameState.battlefield.lands, playerFilter).map((land) =>
    battlefieldLandId(land.mapPos)
  );
};
