import { getSpellById, SpellName } from '../../types/Spell';
import { battlefieldLandId, GameState, getTurnOwner } from '../../types/GameState';
import { getLands } from '../utils/getLands';

export const getAvailableToCastSpellLands = (gameState: GameState, spellName: SpellName) => {
  const spell = getSpellById(spellName);
  const owner = getTurnOwner(gameState)!;
  const playerFiltered =
    spell.apply === 'player'
      ? [owner]
      : spell.apply === 'opponent'
        ? gameState.players.filter((p) => p !== owner)
        : gameState.players;

  return getLands({ lands: gameState.battlefield.lands, players: playerFiltered }).map((land) =>
    battlefieldLandId(land.mapPos)
  );
};
