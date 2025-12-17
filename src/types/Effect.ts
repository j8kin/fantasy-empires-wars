import { SpellName } from './Spell';
import { TreasureType } from './Treasures';

export enum EffectTarget {
  PLAYER = 'player',
  ARMY = 'army',
  LAND = 'land',
}
export enum EffectType {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
}

export type EffectSourceId = SpellName | TreasureType;

export type Effect = {
  /** UUID **/
  id: string;
  type: EffectType; // when army merged positive effect disappears negative effect remains
  sourceId: EffectSourceId;
  duration: number;
  appliedBy: string; // who use spell or treasure item (some effects are related only to owner)
};
