import { SpellName } from './Spell';

export enum EffectTarget {
  PLAYER = 'player',
  ARMY = 'army',
  LAND = 'land',
}
export enum EffectType {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
}

export type Effect = {
  /** UUID **/
  id: string;
  type: EffectType; // when army merged positive effect disappears negative effect remains
  spell: SpellName;
  duration: number;
  castBy: string;
};
