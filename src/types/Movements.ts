import { LandPosition } from '../state/LandState';

export interface Movements {
  mp: number;
  from: LandPosition;
  to: LandPosition;
  path: LandPosition[];
}
