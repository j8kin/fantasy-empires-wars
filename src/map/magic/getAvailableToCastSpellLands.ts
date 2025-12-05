import { GameState } from '../../state/GameState';
import { getLandId } from '../../state/map/land/LandId';

import { getPlayerLands, getTurnOwner } from '../../selectors/playerSelectors';
import { getSpellById } from '../../selectors/spellSelectors';

import { SpellName } from '../../types/Spell';
import { getArmiesByPlayer, getPosition } from '../../selectors/armySelectors';

export const getAvailableToCastSpellLands = (gameState: GameState, spellName: SpellName) => {
  const spell = getSpellById(spellName);
  const playerFiltered =
    spell.apply === 'player'
      ? [getTurnOwner(gameState)]
      : spell.apply === 'opponent'
        ? gameState.players.filter((p) => p.id !== gameState.turnOwner)
        : gameState.players;

  return playerFiltered
    .flatMap((player) => {
      // exclude all players lands if player already effected by this spell
      if (player.effects.some((effect) => effect.spell === spellName)) return [];
      // exclude all lands with effects from this spell
      const landsWithArmiesAffectedByThisSpell = getArmiesByPlayer(gameState, player.id)
        .filter((a) => a.effects.some((e) => e.spell === spellName))
        .map((a) => getLandId(getPosition(a)));

      console.log(`getAvailableToCastSpellLands: ${landsWithArmiesAffectedByThisSpell}`);
      return getPlayerLands(gameState, player.id).filter(
        (l) =>
          !landsWithArmiesAffectedByThisSpell.includes(getLandId(l.mapPos)) &&
          l.effects.every((e) => e.spell !== spellName)
      );
    })
    .map((land) => getLandId(land.mapPos));
};
