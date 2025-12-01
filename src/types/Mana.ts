import { HeroUnitType } from './UnitType';
import { LandType } from './Land';

export const MAX_MANA = 200;

export enum ManaType {
  WHITE = 'white',
  BLACK = 'black',
  GREEN = 'green',
  BLUE = 'blue',
  RED = 'red',
}

export interface ManaSource {
  type: ManaType;
  heroTypes: HeroUnitType[];
  landTypes: LandType[];
}

export type Mana = Record<ManaType, number>;
