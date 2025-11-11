import { LandPosition } from '../map/utils/getLands';

export interface Movements {
  mp: number;
  from: LandPosition;
  to: LandPosition;
  path: LandPosition[];
}
