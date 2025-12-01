import { LandState } from './land/LandState';
import { MapDimensions } from './MapDimensions';

export type MapLands = Record<string, LandState>;

export interface MapState {
  dimensions: MapDimensions;
  lands: MapLands;
}
