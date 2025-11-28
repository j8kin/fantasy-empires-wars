import { GameState } from '../../state/GameState';

import { getSpellById, SpellName } from '../../types/Spell';

import { getLands } from '../utils/getLands';
import { getLandId } from '../../state/map/land/LandId';

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
    getLandId(land.mapPos)
  );
};
