import { GameState } from '../../state/GameState';
import { getLandId } from '../../state/LandState';

import { getSpellById, SpellName } from '../../types/Spell';

import { getLands } from '../utils/getLands';

export const getAvailableToCastSpellLands = (gameState: GameState, spellName: SpellName) => {
  const spell = getSpellById(spellName);
  const playerFiltered =
    spell.apply === 'player'
      ? [gameState.turnOwner.id]
      : (spell.apply === 'opponent'
          ? gameState.allPlayers.filter((p) => p.id !== gameState.turnOwner.id)
          : gameState.allPlayers
        ).map((p) => p.id);

  return getLands({ gameState: gameState, players: playerFiltered }).map((land) =>
    getLandId(land.mapPos)
  );
};
