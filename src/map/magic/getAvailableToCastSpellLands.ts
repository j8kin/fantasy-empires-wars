import { GameState } from '../../state/GameState';
import { getLandId } from '../../state/map/land/LandId';

import { getPlayerLands, getTurnOwner } from '../../selectors/playerSelectors';

import { getSpellById, SpellName } from '../../types/Spell';

export const getAvailableToCastSpellLands = (gameState: GameState, spellName: SpellName) => {
  const spell = getSpellById(spellName);
  const playerFiltered =
    spell.apply === 'player'
      ? [getTurnOwner(gameState)]
      : spell.apply === 'opponent'
        ? gameState.players.filter((p) => p.id !== gameState.turnOwner)
        : gameState.players;

  return playerFiltered
    .flatMap((playerId) => getPlayerLands(gameState, playerId.id))
    .map((land) => getLandId(land.mapPos));
};
