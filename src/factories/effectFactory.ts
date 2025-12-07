import { v4 as uuid } from 'uuid';
import { Effect } from '../types/Effect';
import { Spell } from '../types/Spell';

export const effectFactory = (spell: Spell, castBy: string): Effect => {
  return {
    id: Object.freeze(uuid()),
    spell: Object.freeze(spell.id),
    type: Object.freeze(spell.effect!.type),
    castBy: Object.freeze(castBy),
    duration: spell.effect!.duration,
  };
};
