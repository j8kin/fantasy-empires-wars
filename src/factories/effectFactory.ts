import { v4 as uuid } from 'uuid';
import { getSpellById } from '../selectors/spellSelectors';
import { getItem } from '../domain/treasure/treasureRepository';

import { SpellName } from '../types/Spell';
import type { Effect, EffectSourceId } from '../types/Effect';

const isSpellEffect = (effect: EffectSourceId): effect is SpellName => {
  return Object.values(SpellName).includes(effect as SpellName);
};

export const effectFactory = (sourceId: EffectSourceId, appliedBy: string): Effect => {
  const source = isSpellEffect(sourceId) ? getSpellById(sourceId) : getItem(sourceId);
  return {
    id: Object.freeze(uuid()),
    sourceId: Object.freeze(sourceId),
    appliedBy: Object.freeze(appliedBy),
    rules: {
      type: source.rules!.type,
      target: source.rules!.target,
      duration: source.rules!.duration,
    },
  };
};
