import { getSpellById, SpellName } from '../../types/Spell';
import { battlefieldLandId, GameState } from '../../types/GameState';
import { getLands } from '../utils/getLands';
import { GamePlayer } from '../../types/GamePlayer';

export const getAvailableToCastSpellLands = (
  spellName: SpellName,
  player: GamePlayer,
  gameState: GameState
) => {
  const spell = getSpellById(spellName);
  const playerFiltered =
    spell.apply === 'player'
      ? [player]
      : spell.apply === 'opponent'
        ? gameState.players.filter((p) => p !== player)
        : gameState.players;

  return getLands({ lands: gameState.battlefield.lands, players: playerFiltered }).map((land) =>
    battlefieldLandId(land.mapPos)
  );
};
