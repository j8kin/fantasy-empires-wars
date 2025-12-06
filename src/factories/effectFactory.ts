import { v4 as uuid } from 'uuid';
import { Effect } from '../types/Effect';
import { Spell } from '../types/Spell';

export const effectFactory = (spell: Spell): Effect => {
  return {
    id: Object.freeze(uuid()),
    spell: spell.id,
    type: spell.effect!.type,
    duration: spell.effect!.duration,
  };
};
