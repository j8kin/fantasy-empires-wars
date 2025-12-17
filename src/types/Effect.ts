import type { SpellName } from './Spell';
import type { TreasureType } from './Treasures';

export enum EffectTarget {
  PLAYER = 'player',
  ARMY = 'army',
  LAND = 'land',
}
export enum EffectType {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  PERMANENT = 'permanent',
}

export type EffectSourceId = SpellName | TreasureType;

export type Effect = {
  /** UUID **/
  id: string;
  sourceId: EffectSourceId;
  appliedBy: string; // who use spell or treasure item (some effects are related only to owner)
  rules: EffectRules;
};

export type EffectRules = {
  type: EffectType;
  target: EffectTarget;
  duration: number;
};
