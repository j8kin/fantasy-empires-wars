import { v4 as uuid } from 'uuid';
import { Effect } from '../types/Effect';
import { SpellName } from '../types/Spell';
import { getSpellById } from '../selectors/spellSelectors';

export const effectFactory = (spellName: SpellName): Effect => {
  const spell = getSpellById(spellName);
  return {
    id: Object.freeze(uuid()),
    spell: spellName,
    type: spell.effectType!,
    duration: spell.duration!,
  };
};
