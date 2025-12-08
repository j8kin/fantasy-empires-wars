import { GameState } from '../../state/GameState';
import { getLandId } from '../../state/map/land/LandId';

import { getPlayerLands } from '../../selectors/playerSelectors';
import { getArmiesByPlayer, getPosition } from '../../selectors/armySelectors';
import { getSpellById } from '../../selectors/spellSelectors';

import { SpellName, SpellTarget } from '../../types/Spell';
import { EffectTarget } from '../../types/Effect';

export const getAvailableToCastSpellLands = (gameState: GameState, spellName: SpellName) => {
  const spell = getSpellById(spellName);
  if (spell.apply === SpellTarget.PLAYER) {
    if (spell.effect?.target === EffectTarget.ARMY) {
      return getArmiesByPlayer(gameState)
        .filter((army) => !army.effects.some((e) => e.spell === spellName))
        .flatMap((a) => getLandId(getPosition(a)));
    }
    return getPlayerLands(gameState)
      .filter((l) => !l.effects.some((e) => e.spell === spellName))
      .flatMap((l) => getLandId(l.mapPos));
  }

  const playerFiltered =
    spell.apply === SpellTarget.OPPONENT
      ? gameState.players.filter((p) => p.id !== gameState.turnOwner)
      : gameState.players;

  return playerFiltered
    .flatMap((p) => getPlayerLands(gameState, p.id))
    .filter((l) => !l.effects.some((e) => e.spell === spellName))
    .flatMap((l) => getLandId(l.mapPos));
};
