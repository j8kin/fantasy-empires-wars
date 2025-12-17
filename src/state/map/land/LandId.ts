import type { LandPosition } from './LandPosition';

export const getLandId = (position: LandPosition): string => `${position.row}-${position.col}`;
