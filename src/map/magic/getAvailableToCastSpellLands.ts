import { getSpellById, SpellName } from '../../types/Spell';
import { battlefieldLandId, GameState } from '../../types/GameState';
import { getLands } from '../utils/getLands';

export const getAvailableToCastSpellLands = (gameState: GameState, spellName: SpellName) => {
  const spell = getSpellById(spellName);
  const playerFiltered =
    spell.apply === 'player'
      ? [gameState.turnOwner]
      : (spell.apply === 'opponent'
          ? gameState.players.filter((p) => p.id !== gameState.turnOwner)
          : gameState.players
        ).map((p) => p.id);

  return getLands({ gameState: gameState, players: playerFiltered }).map((land) =>
    battlefieldLandId(land.mapPos)
  );
};
