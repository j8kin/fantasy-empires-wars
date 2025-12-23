import type { HeroUnitType } from './UnitType';
import type { LandType } from './Land';

export const MAX_MANA = 200;

export const ManaKind = {
  WHITE: 'white',
  BLACK: 'black',
  GREEN: 'green',
  BLUE: 'blue',
  RED: 'red',
} as const;

export type ManaType = (typeof ManaKind)[keyof typeof ManaKind];

export interface ManaSource {
  type: ManaType;
  heroTypes: HeroUnitType[];
  landKinds: LandType[];
}

export type Mana = Record<ManaType, number>;
