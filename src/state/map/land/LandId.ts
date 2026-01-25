import type { LandPosition } from './LandPosition';

export const getLandId = (position: LandPosition): string => `${position.row}-${position.col}`;

export const landIdToPosition = (landId: string): LandPosition => {
  const [row, col] = landId.split('-').map(Number);
  return { row, col };
};
